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
  getResourceInfo,
  createContainerAt, /*,
  getStringNoLocale,
  getThingAll,
  getSolidDataset */
 } from "@inrupt/solid-client";
import { v4 as uuidv4 } from 'uuid';
import SongInput, { Song } from '@/components/song_input';
import SongSelected from '@/components/song_selected';

export default function RecPage() {
  const { session, isLoggedIn } = useSolidSession();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [reason, setReason] = useState("");
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
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
            await ensureChatFolderExists(storage);
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

  const ensureChatFolderExists = async (storageRoot: string) => {
    const chatFolderUrl = `${storageRoot}MuseRec/`;
    try {
      await getResourceInfo(chatFolderUrl, { fetch: session.fetch });
    } catch {
      try {
        await createContainerAt(chatFolderUrl, { fetch: session.fetch });
      } catch (err) {
        console.error('❌ Failed to create chat folder:', err);
      }
    }
  };

  async function saveChosenSongs(){
    try {
      const podUrls = await getPodUrlAll(session.info.webId!, {fetch: session.fetch});
      if (podUrls.length === 0) {
        toast.error("No Pod URL found");
        return null;
      }

      const uuid = uuidv4();
      const storage = podUrls[0];
      const playlistUrl = `${storage}MuseRec/${uuid}-playlist.ttl`;

      let dataset = createSolidDataset();

      let playlistThing = buildThing(createThing({name: "playlist"}))
        .addStringNoLocale("https://schema.org/name", "User-chosen playlist")
        .addStringNoLocale("https://schema.org/description", reason)
        .build();

      dataset = setThing(dataset, playlistThing)

      selectedSongs.forEach((song, index) => {
        dataset = setThing(
          dataset,
          buildThing(createThing({ name: `song-${index}` }))
            .addStringNoLocale("https://schema.org/name", song.title)
            .addStringNoLocale("https://schema.org/artist", song.artist)
            .build()
        );
      });

      await saveSolidDatasetAt(playlistUrl, dataset, {fetch: session.fetch});

      toast.success(`Chosen songs saved to your Pod at ${playlistUrl}`);
    } catch (err) {
      console.error('Error saving song list: ', err);
      toast.error('Failed saving song list');
      return null;
    }
  }

  async function handleRecommend() {
    if (selectedSongs.length === 0) {
      toast.error('Please select at least one song');
      return;
    }

    setLoading(true);
    try {
      const fileUrl = await saveChosenSongs();
      if (!fileUrl) return;

      const prompt = 
        `You are a music recommendation assistant.
        User selected these songs:
        ${selectedSongs.map((s, i) => `${i + 1}. ${s.title} by ${s.artist}`).join('\n')}
        Reason: ${reason || 'N/A'}

        Suggest 5 new songs similar to these with brief explanations.
      `; 

      console.log('Sending prompt to LLM', prompt);

      const response = await fetch ('/api/recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      console.log('API status:', response.status);

      const data = await response.json();
      console.log('API response data:', data);

      if (data.reply){
        setRecommendation(data.reply);
      } else {
        toast.error('No recommendation received');
      }
    } catch (error) {
      console.error('Error during recommendation:', error);
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
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
        </div>

        <div className="grid grid-cols-1 p-3 bg-gray-100 rounded-md">
          <p className="font-bold text-gray-600 mt-1 mb-2">Step 4. Recommend me some songs!</p>
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Recommending...' : 'Recommend me!'}
          </button>
        </div>
      </div>
      <div>
        {recommendation && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md text-gray-900">
            <h3 className="font-bold mb-2">AI Recommendation:</h3>
            <p>{recommendation}</p>
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}