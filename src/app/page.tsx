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

      if (song.translationOfWork) {
        songBuilder = songBuilder.addStringNoLocale("https://schema.org/translationOfWork", song.translationOfWork);
      }
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
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-lg font-bold">
          MuseRec
        </h1>
      </div>

      <div className="mt-10 px-3 py-3 rounded-xl sm:mx-auto sm:w-full sm:max-w-sm bg-white">
        <SongInput onSongSelect={handleSongSelect} />

        <SongSelected
          selectedSongs={selectedSongs}
          setSelectedSongs={setSelectedSongs}
        />
      </div>
      
      <div className="mt-10 px-3 py-3 rounded-xl sm:mx-auto sm:w-full sm:max-w-sm bg-white">
        <div>
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-center py-3 text-gray-900 text-lg font-bold">
              Step 2. (Optional) Tell me what you want (e.g. for a party, for studying, etc.)
            </h2>
          </div>
          <form className="space-y-6">
            <div>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What you want (optional)"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </form>
        </div>
  
        <div className="mt-10 px-3 py-3 rounded-xl sm:mx-auto sm:w-full sm:max-w-sm bg-white">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-center py-3 text-gray-900 text-lg font-bold">
              Step 3. (Also optional) Choose your LLM
            </h2>
          </div>
          <form className="space-y-6">
            <div>
              (// dropdown for LLM selection)
            </div>
          </form>
        </div>
      </div>

      <div className="mt-10 px-3 py-3 rounded-xl sm:mx-auto sm:w-full sm:max-w-sm bg-white">
        <button
          onClick={saveChosenSongs}
          className="flex w-full justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span>
            Recommend me!
          </span>
        </button>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}