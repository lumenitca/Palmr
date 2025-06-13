import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();

  const forwardedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const protocol = req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("host") || req.nextUrl.host;

  forwardedHeaders["x-forwarded-proto"] = protocol;
  forwardedHeaders["x-forwarded-host"] = host;

  if (req.headers.get("referer")) {
    forwardedHeaders["referer"] = req.headers.get("referer")!;
  }
  if (req.headers.get("origin")) {
    forwardedHeaders["origin"] = req.headers.get("origin")!;
  }

  const apiRes = await fetch(`${process.env.API_BASE_URL}/auth/oidc/callback${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
    headers: forwardedHeaders,
    redirect: "manual",
  });

  if (apiRes.status >= 300 && apiRes.status < 400) {
    const location = apiRes.headers.get("Location");
    if (location) {
      return NextResponse.redirect(location);
    }
  }

  const resBody = await apiRes.text();
  const res = new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const setCookie = apiRes.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    res.headers.set("Set-Cookie", setCookie.join(","));
  }

  return res;
}
