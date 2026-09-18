// Mock mode's window._env_ — the keys the platform actually emits for this
// component: the `user-auth` platform-resource dependency's four browser
// keys, exactly the set src/env.ts declares. No sibling API URL: currency-api
// is same-origin `/api`, never a window._env_ key.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  // OIDC scopes are `group` and `ou`, singular, plus the project's catalog
  // handle so a caller can actually be seen to hold it.
  USER_AUTH_SCOPES: "openid profile email group ou conversions:create",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
