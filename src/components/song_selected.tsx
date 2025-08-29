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
    <div className="sm:mx-auto sm:w-full sm:max-w-sm py-6 gap-4">
      <h2 className="text-center text-lg font-semibold mb-2 text-gray-900">Your Selected Songs:</h2>
      {selectedSongs.length === 0 && <p className="text-gray-500 text-center">No songs selected yet.</p>}
      
      <ul className="flex gap-4 overflow-x-visible p-2 justify-center">
        {selectedSongs.map((song) => {
          const isPlaying = playingSongId === song.id;
          return (
            <li
              key={song.id}
              className="flex flex-col items-center p-4 rounded-md shadow-sm hover:bg-gray-900 hover:text-white cursor-pointer min-w-[150px]"
            >
              {song.coverImage && (
                <img
                  src={song.coverImage}
                  alt={song.title}
                  className="w-24 h-24 rounded-md mb-2"
                />
              )}
              <p className="font-semibold text-center">{song.title}</p>
              <p className="text-sm text-gray-500 text-center">{song.artist}</p>

              {/* Preview Toggle Button */}
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
                {isPlaying ? 'Pause' : 'Preview'}
              </button>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveSong(song.id)}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                X
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
