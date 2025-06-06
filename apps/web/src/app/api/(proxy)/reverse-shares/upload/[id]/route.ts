import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const { id } = await params;

  let url = `${process.env.API_BASE_URL}/reverse-shares/${id}/upload`;
  if (password) {
    url += `?password=${encodeURIComponent(password)}`;
  }

  const apiRes = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
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

  return res;
}
