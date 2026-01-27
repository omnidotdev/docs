import { createMiddleware, createStart } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteLLM } = rewritePath(
  "/{*path}.mdx",
  "/llms.mdx/docs/{*path}",
);

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
 * TanStack Start instance with request middleware.
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [llmMiddleware],
}));
