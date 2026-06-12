import { connectDB } from '@/lib/mongodb';
import { WINNER_SPACES } from '@/lib/winners-list';
import WinnersList from '@/models/WinnersList';

export async function GET() {
  try {
    await connectDB();

    const publishedLists = await WinnersList.find({ isPublished: true })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .lean();

    const latestBySpace = new Map<string, (typeof publishedLists)[number]>();
    for (const list of publishedLists) {
      if (!latestBySpace.has(list.space)) {
        latestBySpace.set(list.space, list);
      }
    }

    const ordered = WINNER_SPACES.map((space) => latestBySpace.get(space)).filter(Boolean);

    return Response.json(ordered);
  } catch (error) {
    console.error('Public winners list fetch error:', error);
    return Response.json({ error: 'Gabim gjatë marrjes së listave fituese.' }, { status: 500 });
  }
}
