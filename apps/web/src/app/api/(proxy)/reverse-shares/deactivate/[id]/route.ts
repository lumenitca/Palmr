import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieHeader = req.headers.get("cookie");
  const { id } = await params;

  const apiRes = await fetch(`${process.env.API_BASE_URL}/reverse-shares/${id}/deactivate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader || "",
    },
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
