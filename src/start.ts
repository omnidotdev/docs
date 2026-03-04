import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";
import { rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteLLM } = rewritePath(
  "/{*path}.mdx",
  "/llms.mdx/docs/{*path}",
);

/**
 * Permanent redirects for moved pages.
 */
const permanentRedirects: Record<string, string> = {
  "/grid/vortex/self-hosting": "/help/self-hosting/docker-compose",
  "/grid/fractal/self-hosting": "/help/self-hosting/kubernetes",
  "/armory/manifold/self-hosting": "/help/self-hosting/docker-compose",
};

/**
 * Middleware to rewrite .mdx extension requests to LLM route.
 */
const llmMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);
  const path = rewriteLLM(url.pathname);

  if (path) {
    throw redirect({ href: path });
  }

  return next();
});

/**
 * Middleware to redirect moved self-hosting pages.
 */
const redirectMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);
  const destination = permanentRedirects[url.pathname];

  if (destination) {
    throw redirect({ href: destination, statusCode: 301 });
  }

  return next();
});

/**
 * TanStack Start instance with request middleware.
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [redirectMiddleware, llmMiddleware],
}));
