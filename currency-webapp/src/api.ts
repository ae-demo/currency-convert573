// Typed client for currency-api, the one component-kind dependency this app
// talks to. Same-origin baseUrl: nginx in this pod reverse-proxies /api to
// the sibling's gateway address (see nginx/15-aep-api-proxy.sh); there is no
// browser-visible API host and no window._env_ key for it.
//
// Authorization is entirely src/authz/client.ts's: the bearer is attached and
// the 401 rule (session invalid -> sign in; session valid -> Forbidden) is
// applied through this middleware. Nothing about authorization is decided
// here.
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/currency-api";
import { authorizationHeader, classifyResponse, ForbiddenError } from "./authz/client";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
};

export const currencyApi = createClient<paths>({ baseUrl: "/api" });
currencyApi.use(authMiddleware);
