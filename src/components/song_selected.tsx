'use client';

import React, { useState } from 'react';
import { Song } from './song_input';

interface SongSelectedProps {
  selectedSongs: Song[];
  setSelectedSongs: React.Dispatch<React.SetStateAction<Song[]>>;
}

export default function SongSelected({ selectedSongs, setSelectedSongs }: SongSelectedProps) {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  function handleRemoveSong(id: string) {
    // If the removed song is currently playing, stop the audio
    if (playingSongId === id && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSongId(null);
    }
    setSelectedSongs((prev) => prev.filter((s) => s.id !== id));
  }

  function handleToggle(song: Song) {

    if (!song.previewUrl || !song.previewUrl.startsWith('http')) {
      console.warn('Invalid preview URL for song:', song);
      return;
    }
    
    if (!song.previewUrl) return;

    // If the same song is playing, pause it
    if (playingSongId === song.id && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSongId(null);
      return;
    }

    // Stop previous audio
    if (currentAudio) {
      currentAudio.pause();
    }

    // Play new audio
    const audio = new Audio(song.previewUrl);
    audio.play().catch((err) => console.error('Error playing audio:', err));
    setCurrentAudio(audio);
    setPlayingSongId(song.id);
  }

  return (
    <div className="mt-4">
      <h2 className="text-center text-lg font-semibold mb-4 text-gray-900">Your Selected Songs:</h2>
      {selectedSongs.length === 0 && (
        <p className="text-gray-500 text-center">No songs selected yet.</p>
      )}

      <ul className="grid grid-cols-5 gap-4">
        {selectedSongs.map((song) => {
          const isPlaying = playingSongId === song.id;
          return (
            <li
                key={song.id}
              className="bg-white rounded-lg shadow p-2 text-center max-w-[200px] mx-auto"
            >
              {song.coverImage && (
                <img
                  src={song.coverImage}
                  alt={song.title}
                  className="w-32 h-32 object-cover rounded-md mb-2"
                />
              )}
              <p className="mt-2 font-semibold text-sm text-gray-900">{song.title}</p>
              <p className="text-gray-500 text-xs">{song.artist}</p>

              <div className='px-2'>
                <button
                  onClick={() => handleToggle(song)}
                  disabled={!song.previewUrl}
                  className={`mt-2 px-3 py-1 rounded-md transition ${
                    song.previewUrl
                    ? isPlaying
                      ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {song.previewUrl ? (isPlaying ? 'Pause' : 'Preview') : 'No Preview'}
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-400"
                >
                  X
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
