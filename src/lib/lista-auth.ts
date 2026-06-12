import { createHash } from 'crypto';
import { cookies } from 'next/headers';

export function getListaAuthToken(): string {
  const password = process.env.LISTA_PASSWORD || '';
  return createHash('sha256').update(`lista:${password}`).digest('hex');
}

export async function isListaAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get('lista_auth');
  return auth?.value === getListaAuthToken();
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Nuk jeni të autorizuar.' }, { status: 401 });
}
