import { useEffect, useRef, type ReactElement } from "react";
import { handleCallback } from "../authz/session";

/**
 * The OIDC redirect target — computed as window.location.origin + "/callback",
 * never an env key (thunder-authentication). Processes the code exchange once
 * on mount, then lands the user back at the app root.
 */
export function CallbackPage(): ReactElement {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void handleCallback()
      .catch((error) => {
        console.error("authz: sign-in callback failed", error);
      })
      .finally(() => {
        window.location.assign("/");
      });
  }, []);

  return (
    <main>
      <p>Signing you in…</p>
    </main>
  );
}
