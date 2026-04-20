import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const KGENT_TOKEN_KEY = "kgent_auth_token";

export function useKgentAuthToken() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem(KGENT_TOKEN_KEY, token);
      setHasToken(true);
      window.dispatchEvent(
        new CustomEvent("kgent-auth-token-changed", { detail: { token } }),
      );
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("token");
      const newSearch = newParams.toString();
      const newUrl = `${window.location.pathname}${newSearch ? "?" + newSearch : ""}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
    }
    setIsProcessing(false);
  }, []);

  return { isProcessing, hasToken };
}

export function getKgentToken(): string | null {
  return localStorage.getItem(KGENT_TOKEN_KEY);
}

export function removeKgentToken(): void {
  localStorage.removeItem(KGENT_TOKEN_KEY);
}
