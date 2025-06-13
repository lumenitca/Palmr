import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cookieHeader = req.headers.get("cookie");

  const apiRes = await fetch(`${process.env.API_BASE_URL}/filesystem/download/${token}`, {
    method: "GET",
    headers: {
      cookie: cookieHeader || "",
    },
  });

  const contentType = apiRes.headers.get("Content-Type") || "application/octet-stream";
  const contentDisposition = apiRes.headers.get("Content-Disposition");
  const contentLength = apiRes.headers.get("Content-Length");

  const resBody = await apiRes.arrayBuffer();
  const res = new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      "Content-Type": contentType,
      ...(contentDisposition && { "Content-Disposition": contentDisposition }),
      ...(contentLength && { "Content-Length": contentLength }),
    },
  });

  const setCookie = apiRes.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    res.headers.set("Set-Cookie", setCookie.join(","));
  }

  return res;
}
