import { vi } from "vitest";
import en from "./locales/en.json";

function resolve(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const k of keys) {
    if (current && typeof current === "object" && k in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

function tMock(key: string, params?: Record<string, unknown>): string {
  let value = resolve(en as Record<string, unknown>, key);
  if (params) {
    value = Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v)),
      value,
    );
  }
  return value;
}

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: tMock,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

vi.mock("i18next", () => ({
  t: tMock,
  default: { t: tMock },
}));
