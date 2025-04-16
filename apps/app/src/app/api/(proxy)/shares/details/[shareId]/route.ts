import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { shareId: string } }) {
  const cookieHeader = req.headers.get('cookie')
  const url = new URL(req.url)
  const searchParams = url.searchParams.toString()

  const apiRes = await fetch(
    `${process.env.API_BASE_URL}/shares/${params.shareId}${searchParams ? `?${searchParams}` : ''}`,
    {
      method: 'GET',
      headers: {
        cookie: cookieHeader || '',
      },
      redirect: 'manual',
    }
  )

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