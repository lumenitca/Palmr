import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cookieHeader = req.headers.get("cookie");

  const body = await req.arrayBuffer();

  const apiRes = await fetch(`${process.env.API_BASE_URL}/filesystem/upload/${token}`, {
    method: "PUT",
    headers: {
      cookie: cookieHeader || "",
      "Content-Type": req.headers.get("Content-Type") || "application/octet-stream",
      "Content-Length": req.headers.get("Content-Length") || body.byteLength.toString(),
    },
    body: body,
  });

  const contentType = apiRes.headers.get("Content-Type") || "application/json";

  let resBody;
  if (contentType.includes("application/json")) {
    resBody = await apiRes.text();
  } else {
    resBody = await apiRes.arrayBuffer();
  }

  const res = new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      "Content-Type": contentType,
    },
  });

  const setCookie = apiRes.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    res.headers.set("Set-Cookie", setCookie.join(","));
  }

  return res;
}
