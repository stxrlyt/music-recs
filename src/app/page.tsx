"use client";

import { useState, useEffect } from "react";
import SolidLoginButton from "@/components/solid_login";
import SongInput from "@/components/song_input";
import RecommendationList from "@/components/rec_list";

const MAX_SONGS = 5;
const DEFAULT_RECOMMENDATION_LIMIT = 10;
const MESSAGES = {
  notLoggedIn: "Please log in with Solid to continue.",
  loading: "Fetching recommendations...",
  noResults: "No recommendations yet. Try adding some songs!",
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const webId = sessionStorage.getItem("webId");
    setIsLoggedIn(!!webId);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎶 LLM Music Recommender</h1>

      {!isLoggedIn ? (
        <>
          <p>{MESSAGES.notLoggedIn}</p>
          <SolidLoginButton />
        </>
      ) : (
        <>
          <SongInput maxSongs={MAX_SONGS} onSubmit={setRecommendations} />
          {loading ? (
            <p>{MESSAGES.loading}</p>
          ) : recommendations.length > 0 ? (
            <RecommendationList songs={recommendations.slice(0, DEFAULT_RECOMMENDATION_LIMIT)} />
          ) : (
            <p>{MESSAGES.noResults}</p>
          )}
        </>
      )}
    </main>
  );
}
