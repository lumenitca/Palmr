import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  const apiRes = await fetch(`${process.env.API_BASE_URL}/auth/oidc/config`, {
    method: "GET",
    headers: forwardedHeaders,
    redirect: "manual",
  });

  const resBody = await apiRes.text();
  const res = new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res;
}
