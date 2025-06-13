import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const cookieHeader = req.headers.get("cookie");
  const { fileId } = await params;

  const apiRes = await fetch(`${process.env.API_BASE_URL}/reverse-shares/files/${fileId}/download`, {
    method: "GET",
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const cookieHeader = req.headers.get("cookie");
  const { fileId } = await params;
  const body = await req.json();

  const apiRes = await fetch(`${process.env.API_BASE_URL}/reverse-shares/files/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader || "",
    },
    body: JSON.stringify(body),
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const cookieHeader = req.headers.get("cookie");
  const { fileId } = await params;

  const apiRes = await fetch(`${process.env.API_BASE_URL}/reverse-shares/files/${fileId}`, {
    method: "DELETE",
    headers: {
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
