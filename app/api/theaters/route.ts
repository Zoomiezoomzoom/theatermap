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
  
  const { data: theaters, error } = await supabase
    .from('theaters')
    .select('*')

  if (error) {
    console.error("Error fetching theaters:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ theaters });
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
    const theater = await prisma.theater.create({
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        email: body.email,
        phone: body.phone,
        website: body.website,
        image_url: body.image_url,
        capacity: body.capacity,
        created_by: session.user.id,
        updated_by: session.user.id
      }
    })
    return NextResponse.json(theater)
  } catch (error) {
    console.error('Error creating theater:', error)
    return NextResponse.json(
      { error: 'Failed to create theater' },
      { status: 500 }
    )
  }
} 