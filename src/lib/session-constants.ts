// Kept separate from session.ts so edge middleware can import the cookie name
// without pulling in `next/headers` (which is not allowed in middleware).
export const SESSION_COOKIE = "deedar_session";
