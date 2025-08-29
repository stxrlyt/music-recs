import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("song");

  if (!query) {
    return NextResponse.json({ error: "Missing song query" }, { status: 400 });
  }

  try {
    // Call Deezer API (no auth needed)
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    const tracks = data.data.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      artist: item.artist.name,
      coverImage: item.album.cover_medium,
      previewUrl: item.preview, // 30-sec preview
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}
