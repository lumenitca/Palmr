import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const cookieHeader = req.headers.get("cookie");
  const { shareId } = await params;
  const body = await req.text();

  const apiRes = await fetch(`${process.env.API_BASE_URL}/shares/${shareId}/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader || "",
    },
    body: body,
    redirect: "manual",
  });

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
