/**
 * Next.js middleware entry point.
 *
 * Next.js requires the middleware to live in `middleware.ts` at the project
 * root and export either a default function or a named `middleware` export.
 * The actual logic lives in `proxy.ts` so it can be tested and reused
 * independently of the Next.js file-naming convention.
 */

export { proxy as middleware } from './proxy'
export { config } from './proxy'
