// Adapted from thunder-authentication's assets/App.example.tsx. The routing
// STRUCTURE below is prescribed by that skill (NoAccess above the shell,
// Forbidden inside it, /callback outside the provider, every gated route
// wrapped in RequireOperation) — only PAGE_BY_KEY and APP_NAME are this app's
// own, and currency-webapp has no public screen (its one flow's role is
// "User"), so PUBLIC_SCREENS is always empty and every route sits behind the
// sign-in guard.
import { useEffect, type ReactElement } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AuthzProvider,
  Forbidden,
  NoAccess,
  RequireOperation,
  useAuthz,
  useScopes,
} from "./authz/gates";
import { SCREEN_ROUTES, reachableScreens, hasScopedReach } from "./authz/screens";
import { setForbiddenNavigator } from "./authz/client";
import { signIn } from "./authz/session";
import { AppShell } from "./shell/AppShell";
import { CallbackPage } from "./pages/Callback";
import { ConverterPage } from "./pages/Converter";
import { APP_NAME } from "./appName";

const PAGE_BY_KEY: Record<string, ReactElement> = {
  converter: <ConverterPage />,
};

/** Always empty here: currency-webapp's one flow has role "User" — nothing is public. */
const PUBLIC_SCREENS = SCREEN_ROUTES.filter((screen) => screen.public);

// BrowserRouter lives in src/main.tsx (the platform's standard router
// wiring), so App itself is already inside the Router context — that is
// what lets ForbiddenWiring call useNavigate() here, as a sibling of
// <Routes> and above every route, exactly as thunder-authentication
// prescribes.
export default function App(): ReactElement {
  return (
    <>
      <ForbiddenWiring />
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        {PUBLIC_SCREENS.map((screen) => (
          <Route
            key={screen.key}
            path={screen.path}
            element={<AuthzProvider fallback={<Splash />}>{PAGE_BY_KEY[screen.key]}</AuthzProvider>}
          />
        ))}
        <Route
          path="*"
          element={
            <AuthzProvider fallback={<Splash />}>
              <SignedIn />
            </AuthzProvider>
          }
        />
      </Routes>
    </>
  );
}

/**
 * Hands src/authz/client.ts the route a refusal goes to, once, from inside
 * the router and above every route.
 */
function ForbiddenWiring(): null {
  const navigate = useNavigate();
  useEffect(() => {
    setForbiddenNavigator(() => navigate("/forbidden", { replace: true }));
  }, [navigate]);
  return null;
}

function Splash(): ReactElement {
  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>Checking your session…</p>
    </main>
  );
}

function SignedIn(): ReactElement {
  const { signedIn } = useAuthz();
  const scopes = useScopes();

  // Load-time guard: only a MISSING session starts a sign-in. currentUser()
  // already tried a silent renew, so signing in on a merely expired token
  // would re-log the user in on every visit.
  useEffect(() => {
    if (!signedIn) void signIn();
  }, [signedIn]);

  if (!signedIn) return <Splash />;

  const reachable = reachableScreens(scopes, signedIn);

  if (!hasScopedReach(scopes, signedIn)) return <NoAccess appName={APP_NAME} />;

  const landing = (reachable.find((s) => !s.public && s.loads !== null) ?? reachable[0]).path;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={landing} replace />} />
        {SCREEN_ROUTES.map((screen) => {
          if (screen.public) return null;
          const page = PAGE_BY_KEY[screen.key];
          if (screen.loads === null) {
            return <Route key={screen.key} path={screen.path} element={page} />;
          }
          return (
            <Route
              key={screen.key}
              element={<RequireOperation op={screen.loads} screen={screen.label} />}
            >
              <Route path={screen.path} element={page} />
            </Route>
          );
        })}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Route>
    </Routes>
  );
}
