import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { alias: string } }) {
  const cookieHeader = req.headers.get('cookie')
  const queryParams = new URLSearchParams(req.url.split('?')[1]) || undefined

  const apiRes = await fetch(`${process.env.API_BASE_URL}/shares/alias/${params.alias}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader || '',
    },
    redirect: 'manual',
    ...(queryParams ? { params: queryParams } : {}),
  })

  const resBody = await apiRes.text()

  const res = new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const setCookie = apiRes.headers.getSetCookie?.() || []
  if (setCookie.length > 0) {
    res.headers.set('Set-Cookie', setCookie.join(','))
  }

  return res
}