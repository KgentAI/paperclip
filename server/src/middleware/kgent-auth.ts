import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import type { Db } from "@paperclipai/db";
import { authUsers } from "@paperclipai/db";
import { logger } from "./logger.js";

/**
 * Payload structure of the HS256 JWT issued by tenant-frontend-service.
 * See: tenant-frontend-service/common/auth.py → create_access_token()
 */
interface KgentHs256Payload {
  user_id: number | string;
  phone?: string;
  type?: string;
  exp?: number;
  iat?: number;
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

/**
 * Get the HS256 shared secret from environment.
 * Must match tenant-frontend-service's jwt.secret_key config.
 */
function getSharedSecret(): string | null {
  return process.env.PAPERCLIP_KGENT_SHARED_SECRET ?? null;
}

/**
 * Identify whether a JWT token is a kgent HS256 token.
 *
 * Heuristic: payload contains user_id (int or string) AND type === "access".
 * This matches the payload produced by tenant-frontend-service's create_access_token().
 */
export function isKgentToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") return false;
    const payload = decoded as Record<string, unknown>;
    return (
      (typeof payload.user_id === "number" || typeof payload.user_id === "string") &&
      payload.type === "access"
    );
  } catch {
    return false;
  }
}

/**
 * Validate a kgent HS256 JWT using the shared secret.
 *
 * Returns the decoded payload if valid, or null if:
 * - Shared secret is not configured
 * - Signature verification fails
 * - Token is expired
 * - user_id claim is missing
 */
export async function validateKgentToken(
  token: string,
): Promise<KgentHs256Payload | null> {
  const sharedSecret = getSharedSecret();
  if (!sharedSecret) {
    logger.warn("PAPERCLIP_KGENT_SHARED_SECRET not configured — kgent JWT validation disabled");
    return null;
  }

  try {
    const decoded = jwt.verify(token, sharedSecret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded === "string") {
      logger.debug("Kgent JWT verify returned unexpected string");
      return null;
    }

    const payload = decoded as KgentHs256Payload;

    if (!payload.user_id) {
      logger.debug("Kgent JWT missing user_id claim");
      return null;
    }

    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.debug({ err }, "Kgent JWT expired");
    } else if (err instanceof jwt.JsonWebTokenError) {
      logger.debug({ err }, "Kgent JWT verification failed");
    } else {
      logger.warn({ err }, "Unexpected error validating kgent JWT");
    }
    return null;
  }
}

/**
 * Resolve a kgent HS256 JWT into a Paperclip BoardActor.
 *
 * Creates/updates the user in authUsers table.
 * NOTE: HS256 JWTs from tenant-frontend-service do NOT contain tenant_id,
 * so no company membership is auto-created. The user will have empty companyIds
 * until they join a company through Paperclip's invite mechanism.
 */
export async function resolveKgentActor(
  token: string,
  db: Db,
): Promise<BoardActor | null> {
  const payload = await validateKgentToken(token);
  if (!payload) {
    return null;
  }

  const userId = String(payload.user_id);
  const phone = payload.phone;
  const email = phone && phone.length > 0 ? phone : `${userId}@kgent.ai`;
  const name = `Kgent User ${userId}`;

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
      logger.info({ userId, email }, "Auto-created user from kgent HS256 JWT");
    } else {
      await tx
        .update(authUsers)
        .set({ name, email, updatedAt: now })
        .where(eq(authUsers.id, userId));
    }
  });

  return {
    type: "board",
    userId,
    userName: name,
    userEmail: email,
    companyIds: [],
    memberships: [],
    isInstanceAdmin: false,
    source: "kgent_jwt",
  };
}
