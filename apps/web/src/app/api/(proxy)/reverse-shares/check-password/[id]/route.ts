import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.text();
  const { id } = await params;

  const apiRes = await fetch(`${process.env.API_BASE_URL}/reverse-shares/${id}/check-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  return res;
}
