import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const body = await req.text();

  const apiRes = await fetch(`${process.env.API_BASE_URL}/shares`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader || "",
    },
    body,
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
