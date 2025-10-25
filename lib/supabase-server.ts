// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// import { NextRequest, NextResponse } from 'next/server'

// export const createSupabaseServerClient = () => {
//   const cookieStore = cookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           try {
//             cookieStore.set({ name, value, ...options })
//           } catch {
//             // ignore — read-only mode during SSR
//           }
//         },
//         remove(name: string, options: CookieOptions) {
//           try {
//             cookieStore.set({ name, value: '', ...options })
//           } catch {
//             // ignore — read-only mode during SSR
//           }
//         },
//       },
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false,
//         detectSessionInUrl: false,
//         debug: process.env.NODE_ENV === 'development'
//       }
//     }
//   )
// }

// export const createSupabaseRouteHandlerClient = (req: NextRequest, res: NextResponse) => {
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           const cookie = req.cookies.get(name)?.value;
//           console.log(`🍪 Getting cookie ${name}:`, cookie ? 'Found' : 'Missing');
//           return cookie;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           console.log(`🍪 Setting cookie ${name}:`, value ? 'Set' : 'Empty');
//           req.cookies.set({ name, value, ...options });
//           res.cookies.set({ name, value, ...options });
//         },
//         remove(name: string, options: CookieOptions) {
//           console.log(`🍪 Removing cookie ${name}`);
//           req.cookies.set({ name, value: '', ...options });
//           res.cookies.set({ name, value: '', ...options });
//         },
//       },
//       auth: {
//         autoRefreshToken: true,
//         persistSession: true,
//         detectSessionInUrl: false,
//         debug: process.env.NODE_ENV === 'development'
//       }
//     }
//   )
// }
