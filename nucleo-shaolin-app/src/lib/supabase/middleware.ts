import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Ignora requisições de prefetch ou rotas puramente públicas (Home e Callback)
  // para resposta instantânea em 0ms sem round-trip de rede.
  const isPrefetch =
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch'

  if (isPrefetch || pathname === '/' || pathname.startsWith('/auth')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usa getSession() para ler o JWT do cookie em memória (~0ms) sem round-trip
  // de rede a cada clique; renova o token apenas se estiver expirado.
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const publicRoutes = ['/', '/login', '/cadastro', '/auth/callback']
  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith('/auth'))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/aluno', request.url))
  }

  return supabaseResponse
}
