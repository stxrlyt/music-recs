'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState} from "react";
import { useSolidSession } from "@/context/solidsession";
import toast, { Toaster } from 'react-hot-toast';
import { 
  getPodUrlAll, 
  createThing,
  setThing,
  buildThing,
  createSolidDataset,
  saveSolidDatasetAt,
  setStringNoLocale
 } from "@inrupt/solid-client";
import SongInput, { Song } from '@/components/song_input';
import SongSelected from '@/components/song_selected';

export default function RecPage() {
  const { session, isLoggedIn } = useSolidSession();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [reason, setReason] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && session?.info?.webId) {
      (async () => {
        try {
          const podUrls = await getPodUrlAll(session.info.webId!, {fetch: session.fetch});
          if (podUrls.length > 0){
            const storage = podUrls[0];
            toast.success(`Connected to Solid storage ${storage}`)
          }
        } catch (err) {
          console.error('Failed to get Pod URL:', err);
        }
      })();
    }
  }, [session]);

  function handleSongSelect(song: Song) {
    if (selectedSongs.length >= 5) return alert('You can only add 5 songs');
    if (selectedSongs.some((s) => s.id === song.id)) return; // prevent duplicates
    setSelectedSongs((prev) => [...prev, song]);
  }

  async function saveChosenSongs(){
  try {
    const podUrls = await getPodUrlAll(session.info.webId!, {fetch: session.fetch});
    const storage = podUrls[0];
    const playlistUrl = `${storage}MuseRec/${Date.now()}-playlist.ttl`;

    let chosenPlaylistDataset = createSolidDataset();

    let chosenThing = buildThing(createThing({name: "playlist"}))
      .addStringNoLocale("https://schema.org/name", "User-chosen")
      .addStringNoLocale("https://schema.org/description", reason)
      .build();

    selectedSongs.forEach((song, index) => {
      let songBuilder = buildThing(createThing({ name: `song-${index}` }))
        .addStringNoLocale("https://schema.org/name", song.title)
        .addStringNoLocale("https://schema.org/artist", song.artist);

      if (song.inAlbum) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/inAlbum", song.inAlbum);
      }
      if (song.duration) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/duration", song.duration);
      }
      if (song.inLanguage) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/inLanguage", song.inLanguage);
      }
      if (song.datePublished) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/datePublished", song.datePublished);
      }
      if (song.genre) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/genre", song.genre);
      }
      chosenPlaylistDataset = setThing(chosenPlaylistDataset, songBuilder.build());
    });

    chosenPlaylistDataset = setThing(chosenPlaylistDataset, chosenThing);

    await saveSolidDatasetAt(playlistUrl, chosenPlaylistDataset, {fetch: session.fetch});

    toast.success(`Chosen songs saved to your Pod at ${playlistUrl}`);
  } catch (err) {
    console.error("Error saving chosen songs:", err);
    toast.error("Failed saving chosen songs");
  }
}

  return (
    <div className="mx-auto p-6 flex flex-col gap-6">

      <div className="text-center">
        <h1 className="text-2xl font-bold">MuseRec</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-3 p-3 bg-gray-100 rounded-md">
          <SongInput onSongSelect={handleSongSelect} />

          <SongSelected
            selectedSongs={selectedSongs}
            setSelectedSongs={setSelectedSongs}
          />
        </div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="font-bold text-gray-600 mt-1 mb-2">Step 2. (Optional) What's the vibe?</p>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="What you want (optional)"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <div className="p-3 bg-gray-100 rounded-md">
            <p className="font-bold text-gray-600 mt-1 mb-2">Step 3. (Also optional) Which LLM would you like to use?</p>
            <select id="LLM" className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <option value="GPT">ChatGPT</option>
              <option value="LL">LLama</option>
              <option value="Q">Qwen</option>
            </select>
          </div>
  

          <div className="p-3 bg-gray-100 rounded-md">
            <p className="font-bold text-gray-600 mt-1 mb-2">Step 4. Recommend me some songs!</p>
            <button
              onClick={saveChosenSongs}
              className="w-full py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:bg-gray-400"
            >
              <span>
                Recommend me!
              </span>
            </button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}