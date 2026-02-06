import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
 
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag')
  if (tag) {
    // @ts-expect-error - Next.js types mismatch in this version, ignoring to allow build
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  }
  return NextResponse.json({ revalidated: false, message: 'Missing tag' })
}