import { connectDB } from '@/lib/mongodb';
import { isListaAuthenticated, unauthorizedResponse } from '@/lib/lista-auth';
import { getDisplaySpace } from '@/lib/winners-list';
import WinnersList from '@/models/WinnersList';

async function unpublishOtherListsForSpace(space: string, excludeId?: string) {
  const filter: Record<string, unknown> = { space, isPublished: true };
  if (excludeId) filter._id = { $ne: excludeId };
  await WinnersList.updateMany(filter, { $set: { isPublished: false }, $unset: { publishedAt: '' } });
}

export async function GET() {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const lists = await WinnersList.find({}).sort({ createdAt: -1 }).lean();
    return Response.json(lists);
  } catch (error) {
    console.error('Winners list fetch error:', error);
    return Response.json({ error: 'Gabim gjatë marrjes së listave fituese.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const { space, winners, isPublished = false } = await req.json();

    if (!space || !winners?.length) {
      return Response.json(
        { error: 'Zgjidhni të paktën një aplikant për listën fituese.' },
        { status: 400 }
      );
    }

    await connectDB();

    const displaySpace = getDisplaySpace(space);
    const publishNow = Boolean(isPublished);

    if (publishNow) {
      await unpublishOtherListsForSpace(space);
    }

    const saved = await WinnersList.create({
      space,
      displaySpace,
      winners,
      isPublished: publishNow,
      publishedAt: publishNow ? new Date() : undefined,
    });

    return Response.json(
      { message: 'Lista fituese u ruajt me sukses.', id: saved._id, list: saved },
      { status: 201 }
    );
  } catch (error) {
    console.error('Winners list save error:', error);
    return Response.json({ error: 'Gabim gjatë ruajtjes së listës fituese.' }, { status: 500 });
  }
}
