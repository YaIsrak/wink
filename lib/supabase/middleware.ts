import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). supabase.auth.getUser() refreshes expired tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/login' || pathname === '/sign-up'
  const isPublicRoute =
    isAuthRoute || pathname === '/theme' || pathname.startsWith('/api/')

  // Helper to construct redirect response preserving refreshed session cookies
  const createRedirectWithCookies = (destination: string) => {
    const url = request.nextUrl.clone()
    url.pathname = destination
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 1. Authenticated users visiting auth routes get redirected to the feed
  if (user && isAuthRoute) {
    return createRedirectWithCookies('/feed')
  }

  // 2. Unauthenticated visitors accessing protected routes get redirected to login
  if (!user && !isPublicRoute) {
    return createRedirectWithCookies('/login')
  }

  // 3. Authenticated users visiting root route get redirected to the feed
  if (user && pathname === '/') {
    return createRedirectWithCookies('/feed')
  }

  return supabaseResponse
}
