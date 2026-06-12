import { connectDB } from '@/lib/mongodb';
import { isListaAuthenticated, unauthorizedResponse } from '@/lib/lista-auth';
import { getDisplaySpace } from '@/lib/winners-list';
import WinnersList from '@/models/WinnersList';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function unpublishOtherListsForSpace(space: string, excludeId: string) {
  await WinnersList.updateMany(
    { space, _id: { $ne: excludeId }, isPublished: true },
    { $set: { isPublished: false }, $unset: { publishedAt: '' } }
  );
}

export async function GET(_req: Request, context: RouteContext) {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    await connectDB();
    const list = await WinnersList.findById(id).lean();
    if (!list) {
      return Response.json({ error: 'Lista nuk u gjet.' }, { status: 404 });
    }
    return Response.json(list);
  } catch (error) {
    console.error('Winners list fetch error:', error);
    return Response.json({ error: 'Gabim gjatë marrjes së listës.' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = await req.json();
    const { winners, isPublished } = body;

    if (!winners?.length) {
      return Response.json(
        { error: 'Lista duhet të ketë të paktën një fitues.' },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await WinnersList.findById(id);
    if (!existing) {
      return Response.json({ error: 'Lista nuk u gjet.' }, { status: 404 });
    }

    existing.winners = winners;
    existing.displaySpace = getDisplaySpace(existing.space);

    if (typeof isPublished === 'boolean') {
      existing.isPublished = isPublished;
      if (isPublished) {
        existing.publishedAt = new Date();
        await unpublishOtherListsForSpace(existing.space, id);
      } else {
        existing.publishedAt = undefined;
      }
    }

    await existing.save();

    return Response.json({
      message: 'Lista fituese u përditësua me sukses.',
      list: existing.toObject(),
    });
  } catch (error) {
    console.error('Winners list update error:', error);
    return Response.json({ error: 'Gabim gjatë përditësimit të listës.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  if (!(await isListaAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    await connectDB();
    const deleted = await WinnersList.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ error: 'Lista nuk u gjet.' }, { status: 404 });
    }
    return Response.json({ message: 'Lista fituese u fshi me sukses.' });
  } catch (error) {
    console.error('Winners list delete error:', error);
    return Response.json({ error: 'Gabim gjatë fshirjes së listës.' }, { status: 500 });
  }
}
