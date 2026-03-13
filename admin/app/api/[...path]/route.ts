import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/admin-session";
import { buildServerApiUrl } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type LoginPayload = {
  success?: boolean;
  data?: {
    token?: string;
  } | null;
};

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function isLoginRoute(path: string[]): boolean {
  return path.length === 2 && path[0] === "auth" && path[1] === "login";
}

function isLogoutRoute(path: string[]): boolean {
  return path.length === 2 && path[0] === "auth" && path[1] === "logout";
}

function buildProxyHeaders(request: NextRequest, token?: string): Headers {
  const headers = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");

  if (accept) {
    headers.set("accept", accept);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return headers;
}

async function forwardRequest(
  request: NextRequest,
  path: string[],
): Promise<Response> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const url = buildServerApiUrl(`/${path.join("/")}`, request.nextUrl.search);
  const headers = buildProxyHeaders(request, token);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (!METHODS_WITHOUT_BODY.has(request.method)) {
    const body = await request.text();
    if (body) {
      init.body = body;
    }
  }

  return fetch(url, init);
}

function buildClientResponse(
  upstreamResponse: Response,
  bodyText: string,
): NextResponse {
  const response = new NextResponse(bodyText, {
    status: upstreamResponse.status,
  });

  const contentType = upstreamResponse.headers.get("content-type");
  if (contentType) {
    response.headers.set("content-type", contentType);
  }

  return response;
}

function tryParseLoginPayload(bodyText: string): LoginPayload | null {
  try {
    return JSON.parse(bodyText) as LoginPayload;
  } catch {
    return null;
  }
}

async function handleRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  const upstreamResponse = await forwardRequest(request, path);
  const bodyText = await upstreamResponse.text();
  const response = buildClientResponse(upstreamResponse, bodyText);

  if (upstreamResponse.status === 401 || isLogoutRoute(path)) {
    clearAdminSessionCookie(response);
  }

  if (isLoginRoute(path) && upstreamResponse.ok) {
    const payload = tryParseLoginPayload(bodyText);
    const token = payload?.success ? payload.data?.token : undefined;

    if (token) {
      setAdminSessionCookie(response, token);
    }
  }

  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context);
}
