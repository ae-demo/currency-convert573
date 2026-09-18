// THIS IS THE ONLY FILE THAT KNOWS ABOUT SCREENS. currency-webapp has exactly
// one screen — Converter (wireframes.dsl) — and one flow, "Convert currency",
// role "User": a signed-in user picks currencies, enters an amount, submits,
// and sees the result on the same screen.
//
// `loads` is POST /conversions, not GET /currencies, even though the screen's
// initial render fetches GET /currencies to populate the pickers. Reasoning:
// GET /currencies requires only a signed-in session (security: oauth2: [] —
// no scope), while POST /conversions is scope-gated on conversions:create,
// the operation the screen's whole reason to exist maps onto. Naming the
// submit operation here is the "form that only writes" pattern
// (thunder-authentication): it keeps the rail, the route guard and the
// button's <Can> gate all reading the same fact, and it is what makes the
// route guard reject signed-out and under-scoped callers alike, satisfying
// "an unauthenticated visitor is redirected to sign in before reaching
// Converter."
import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "converter", label: "Converter", path: "/converter", loads: "POST /conversions" },
];

for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

export function hasScopedReach(scopes: ReadonlySet<string>, signedIn: boolean): boolean {
  return reachableScreens(scopes, signedIn).some(
    (screen) => !screen.public && screen.loads !== null,
  );
}
