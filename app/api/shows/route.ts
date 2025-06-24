import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { data: shows, error } = await supabase
    .from('shows')
    .select(`
      *,
      theater:theaters(
        name,
        address,
        latitude,
        longitude
      )
    `)
    .order('start_date', { ascending: true });

  if (error) {
    console.error("Error fetching shows:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shows });
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const show = await prisma.show.create({
      data: {
        title: body.title,
        description: body.description,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        price_range: body.price_range,
        ticket_url: body.ticket_url,
        image_url: body.image_url,
        theater_id: body.theater_id,
        created_by: session.user.id,
        updated_by: session.user.id
      },
      include: {
        theater: true
      }
    })
    return NextResponse.json(show)
  } catch (error) {
    console.error('Error creating show:', error)
    return NextResponse.json(
      { error: 'Failed to create show' },
      { status: 500 }
    )
  }
} 