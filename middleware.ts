import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const code = request.nextUrl.searchParams.get('code')
  const authError = request.nextUrl.searchParams.get('error')

  // Intercept any path containing an auth code and route it to our auth confirmation handler
  if (code && !pathname.startsWith('/auth/confirm')) {
    const confirmUrl = request.nextUrl.clone()
    confirmUrl.pathname = '/auth/confirm'
    return NextResponse.redirect(confirmUrl)
  }

  // Intercept Supabase errors (like clicking a link twice) and show them the success page anyway 
  // so they can proceed to log in, instead of abandoning them on the landing page.
  if (authError && (authError === 'access_denied' || authError === 'confirmation_failed') && !pathname.startsWith('/email-confirmed')) {
    const successUrl = request.nextUrl.clone()
    successUrl.pathname = '/email-confirmed'
    return NextResponse.redirect(successUrl)
  }

  // Skip middleware entirely for public/onboarding routes
  const isPublicRoute =
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/email-confirmed') ||
    pathname.startsWith('/waitlist')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For all other routes, refresh the auth session
  const { supabaseResponse, user, onboardingCompleted } = await updateSession(request)

  const isProtectedRoute = 
    pathname.startsWith('/home') || 
    pathname.startsWith('/profile') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/module');

  // If trying to access protected route but not logged in -> Auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding/auth'
    url.searchParams.set('login', 'true')
    return NextResponse.redirect(url)
  }

  // If logged in but onboarding not completed -> Onboarding (unless already in onboarding or on email-confirmed)
  if (user && !onboardingCompleted && !pathname.startsWith('/onboarding') && pathname !== '/' && pathname !== '/email-confirmed') {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding/language'
    return NextResponse.redirect(url)
  }

  // If logged in and onboarding completed -> redirect away from auth/onboarding to home
  if (user && onboardingCompleted && (pathname.startsWith('/onboarding') || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
