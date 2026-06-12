import { NextResponse } from 'next/server';
import { getListaAuthToken, isListaAuthenticated } from '@/lib/lista-auth';

export async function GET() {
  const authenticated = await isListaAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.LISTA_PASSWORD) {
      return NextResponse.json({ error: 'Fjalëkalimi i gabuar.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('lista_auth', getListaAuthToken(), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Gabim gjatë hyrjes.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('lista_auth');
  return response;
}
