'use client';

import React, { useState, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverImage?: string;
  previewUrl?: string;
  inAlbum?: string;          // Album name
  duration?: string;         // Formatted duration (e.g., "3:45")
  inLanguage?: string;       // Language if available
  datePublished?: string;    // Release date
  genre?: string;            // Genre (Spotify needs extra query for this)
}

export default function SongInput({ onSongSelect }: { onSongSelect: (song: Song) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  async function handleSearch(searchTerm: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?song=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setResults(data.tracks || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
        <p className="font-bold text-gray-600 mt-1 mb-2">
          Step 1. Choose 5 songs
        </p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song"
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        {loading && <p className="text-gray-900 text-sm">Searching...</p>}

      <div className="mt-2 flex flex-wrap gap-2">
        {results.map((song) => (
          <li
            key={song.id}
            onClick={() => onSongSelect(song)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            {song.coverImage && (
              <img
                src={song.coverImage}
                alt={song.title}
                className="w-12 h-12 rounded-md"
              />
            )}
            <div>
              <p className="font-semibold text-black">{song.title}</p>
              <p className="text-sm text-gray-500">{song.artist}</p>
            </div>
          </li>
        ))}
      </div>
    </div>
  );
}
