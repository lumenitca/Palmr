import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const body = await req.text();

  const apiRes = await fetch(`${process.env.API_BASE_URL}/app/test-smtp`, {
    method: "POST",
    headers: {
      cookie: cookieHeader || "",
      "Content-Type": "application/json",
    },
    body: body || "{}",
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
