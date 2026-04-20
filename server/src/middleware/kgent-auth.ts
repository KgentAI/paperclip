import { createHash, randomUUID } from "node:crypto";
import { eq, and } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { authUsers, companyMemberships, companies } from "@paperclipai/db";
import { logger } from "./logger.js";

interface KgentJwtPayload {
  user_id: string;
  email?: string;
  name?: string;
  current_tenant_id?: string;
  current_role?: string;
  exp?: number;
  iat?: number;
}

interface KgentPublicKey {
  kid: string;
  public_key: string;
}

interface BoardActor {
  type: "board";
  userId: string;
  userName: string | null;
  userEmail: string | null;
  companyIds: string[];
  memberships: Array<{
    companyId: string;
    membershipRole: string | null;
    status: string;
  }>;
  isInstanceAdmin: boolean;
  source: "kgent_jwt";
}

let cachedPublicKeys: Map<string, string> | null = null;
let lastKeyFetchTime = 0;
const KEY_CACHE_TTL_MS = 5 * 60 * 1000;

function getKgentPublicKeyUrl(): string {
  return (
    process.env.KGENT_JWKS_URL ??
    "https://api-dev.kgent.ai/api/tenant-frontend/v1/.well-known/jwks.json"
  );
}

async function fetchKgentPublicKeys(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedPublicKeys && now - lastKeyFetchTime < KEY_CACHE_TTL_MS) {
    return cachedPublicKeys;
  }

  try {
    const response = await fetch(getKgentPublicKeyUrl());
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status}`);
    }
    const data = (await response.json()) as {
      keys?: KgentPublicKey[];
    };

    const keys = new Map<string, string>();
    if (data.keys) {
      for (const key of data.keys) {
        keys.set(key.kid, key.public_key);
      }
    }

    cachedPublicKeys = keys;
    lastKeyFetchTime = now;
    return keys;
  } catch (err) {
    logger.error({ err }, "Failed to fetch kgent public keys");
    return cachedPublicKeys ?? new Map();
  }
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(base64 + padding, "base64").toString("utf8");
}

function decodeJwtHeader(token: string): { kid?: string; alg?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const headerJson = base64UrlDecode(parts[0]);
    return JSON.parse(headerJson) as { kid?: string; alg?: string };
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): KgentJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson) as KgentJwtPayload;
  } catch {
    return null;
  }
}

function verifyRsaSignature(token: string, publicKeyPem: string): boolean {
  try {
    const { createVerify } = require("node:crypto");
    const parts = token.split(".");
    const signedData = `${parts[0]}.${parts[1]}`;
    const signature = base64UrlDecode(parts[2]);

    const verifier = createVerify("RSA-SHA256");
    verifier.update(signedData);
    return verifier.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}

export async function validateKgentToken(
  token: string,
): Promise<KgentJwtPayload | null> {
  const header = decodeJwtHeader(token);
  if (!header?.kid) {
    logger.debug("Kgent JWT missing kid in header");
    return null;
  }

  const publicKeys = await fetchKgentPublicKeys();
  const publicKey = publicKeys.get(header.kid);
  if (!publicKey) {
    logger.debug({ kid: header.kid }, "Kgent public key not found for kid");
    return null;
  }

  const isValid = verifyRsaSignature(token, publicKey);
  if (!isValid) {
    logger.debug("Kgent JWT signature verification failed");
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    logger.debug("Failed to decode kgent JWT payload");
    return null;
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    logger.debug({ userId: payload.user_id }, "Kgent JWT expired");
    return null;
  }

  if (!payload.user_id) {
    logger.debug("Kgent JWT missing user_id claim");
    return null;
  }

  return payload;
}

function mapKgentRoleToPaperclipRole(
  kgentRole: string | undefined,
): "owner" | "admin" | "operator" | "viewer" | null {
  if (!kgentRole) return null;
  const role = kgentRole.toLowerCase();
  if (role === "owner") return "owner";
  if (role === "admin") return "admin";
  if (role === "member") return "operator";
  return "viewer";
}

export async function resolveKgentActor(
  token: string,
  db: Db,
): Promise<BoardActor | null> {
  const payload = await validateKgentToken(token);
  if (!payload) {
    return null;
  }

  const userId = payload.user_id;
  const email = payload.email ?? `${userId}@kgent.ai`;
  const name = payload.name ?? "Kgent User";
  const tenantId = payload.current_tenant_id;

  await db.transaction(async (tx) => {
    const existingUser = await tx
      .select({ id: authUsers.id })
      .from(authUsers)
      .where(eq(authUsers.id, userId))
      .then((rows) => rows[0] ?? null);

    const now = new Date();

    if (!existingUser) {
      await tx.insert(authUsers).values({
        id: userId,
        name,
        email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });
      logger.info({ userId, email }, "Auto-created user from kgent JWT");
    } else {
      await tx
        .update(authUsers)
        .set({ name, email, updatedAt: now })
        .where(eq(authUsers.id, userId));
    }

    if (tenantId) {
      const existingCompany = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, tenantId))
        .then((rows) => rows[0] ?? null);

      if (!existingCompany) {
        await tx.insert(companies).values({
          id: tenantId,
          name: `Kgent Tenant ${tenantId.slice(0, 8)}`,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        logger.info({ tenantId }, "Auto-created company from kgent tenant");
      }

      const existingMembership = await tx
        .select({ id: companyMemberships.id })
        .from(companyMemberships)
        .where(
          and(
            eq(companyMemberships.companyId, tenantId),
            eq(companyMemberships.principalType, "user"),
            eq(companyMemberships.principalId, userId),
          ),
        )
        .then((rows) => rows[0] ?? null);

      const paperclipRole = mapKgentRoleToPaperclipRole(payload.current_role);

      if (!existingMembership) {
        await tx.insert(companyMemberships).values({
          id: randomUUID(),
          companyId: tenantId,
          principalType: "user",
          principalId: userId,
          status: "active",
          membershipRole: paperclipRole,
          createdAt: now,
          updatedAt: now,
        });
        logger.info({ userId, tenantId }, "Auto-created company membership from kgent JWT");
      } else {
        await tx
          .update(companyMemberships)
          .set({ membershipRole: paperclipRole, updatedAt: now })
          .where(
            and(
              eq(companyMemberships.companyId, tenantId),
              eq(companyMemberships.principalType, "user"),
              eq(companyMemberships.principalId, userId),
            ),
          );
      }
    }
  });

  const memberships = await db
    .select({
      companyId: companyMemberships.companyId,
      membershipRole: companyMemberships.membershipRole,
      status: companyMemberships.status,
    })
    .from(companyMemberships)
    .where(
      and(
        eq(companyMemberships.principalType, "user"),
        eq(companyMemberships.principalId, userId),
        eq(companyMemberships.status, "active"),
      ),
    );

  return {
    type: "board",
    userId,
    userName: name,
    userEmail: email,
    companyIds: memberships.map((m) => m.companyId),
    memberships,
    isInstanceAdmin: false,
    source: "kgent_jwt",
  };
}

export function isKgentToken(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    return (
      typeof payload.user_id === "string" &&
      (payload.current_tenant_id !== undefined || payload.current_role !== undefined)
    );
  } catch {
    return false;
  }
}
