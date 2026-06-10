// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
 
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');
  const secret = searchParams.get('secret');

  // 🔒 SECURITY CHECK: Prevent unauthorized cache busting
  if (secret !== process.env.MY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token secret key' }, { status: 401 });
  }

  // 1. Support existing revalidateTag (If tag parameter is provided)
  if (tag) {
    // @ts-expect-error - Next.js types mismatch in this version, ignoring to allow build
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, type: 'tag', tag, now: Date.now() })
  }

  // 2. Support new revalidatePath (For direct URL purging like product pages)
  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, type: 'path', path, now: Date.now() })
  }

  return NextResponse.json({ revalidated: false, message: 'Missing tag or path parameter' }, { status: 400 })
}