import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  // Dynamically determine the origin to avoid hardcoded localhost redirects
  const origin = request.nextUrl.origin
  const redirectTo = new URL('/email-confirmed', origin)

  // Handle PKCE flow (code parameter)
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirectTo.pathname = '/email-confirmed'
      redirectTo.searchParams.delete('code')
      return NextResponse.redirect(redirectTo)
    }
  }

  // Handle token_hash flow (email template method)
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirectTo.pathname = '/email-confirmed'
      redirectTo.searchParams.delete('token_hash')
      redirectTo.searchParams.delete('type')
      return NextResponse.redirect(redirectTo)
    }
  }

  // If verification failed, redirect to email-confirmed page with error
  redirectTo.pathname = '/email-confirmed'
  redirectTo.searchParams.set('error', 'confirmation_failed')
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  return NextResponse.redirect(redirectTo)
}
