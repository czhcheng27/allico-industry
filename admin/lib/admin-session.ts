import type { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin_token";
const ADMIN_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function setAdminSessionCookie(
  response: NextResponse,
  token: string,
) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    ...getBaseCookieOptions(),
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...getBaseCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}
