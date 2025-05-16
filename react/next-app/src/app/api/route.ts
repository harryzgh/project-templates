import { NextRequest } from "next/server"

export async function get(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  return Response.json({ pathname })
}
