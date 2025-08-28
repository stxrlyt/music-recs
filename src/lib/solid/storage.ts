import { MYAPP, SCHEMA, DCTERMS } from "./schemas";
import { RecommendationSession, Song } from "@/types/recommendation";

// -------------------------------------------------------
// CREATE / SAVE a recommendation session
// -------------------------------------------------------
export async function createSession(
  podUrl: string,                    // user pod base url (e.g. "https://user.solidpod.dev")
  session: RecommendationSession,    // data to save
  fetch: typeof window.fetch         // fetch from solid-authn
): Promise<string> {
  const datasetUrl = `${podUrl}/recommendations/${session.id}.ttl`;

  // Create RDF Thing
  let sessionThing: Thing = createThing({ name: session.id });

  // Metadata
  sessionThing = addDatetime(sessionThing, DCTERMS.created, session.created);
  if (session.userNotes) {
    sessionThing = addStringNoLocale(sessionThing, MYAPP.userNotes, session.userNotes);
  }

  // Input songs
  session.inputSongs.forEach((song) => {
    sessionThing = addStringNoLocale(sessionThing, SCHEMA.name, song.title);
    sessionThing = addStringNoLocale(sessionThing, SCHEMA.byArtist, song.artist);
  });

  // Recommendations
  session.recommendations.forEach((rec) => {
    sessionThing = addStringNoLocale(sessionThing, MYAPP.recommendations, rec.title);
  });

  // Wrap into dataset & save
  let dataset = setThing(createThing(), sessionThing);
  await saveSolidDatasetAt(datasetUrl, dataset, { fetch });

  return datasetUrl; // return where it was saved
}

// -------------------------------------------------------
// LOAD / READ recommendation sessions from a folder
// -------------------------------------------------------
export async function loadSessions(
  folderUrl: string,                 // e.g. "https://user.solidpod.dev/recommendations/"
  fetch: typeof window.fetch
): Promise<RecommendationSession[]> {
  const dataset = await getSolidDataset(folderUrl, { fetch });
  const things = getThingAll(dataset);

  return things.map((thing) => {
    const created = getDatetime(thing, DCTERMS.created) || new Date();
    const notes = getStringNoLocale(thing, MYAPP.userNotes);

    // Very minimal reconstruction for now
    const inputSongs: Song[] = [
      { id: "unknown", title: getStringNoLocale(thing, SCHEMA.name) || "?", artist: getStringNoLocale(thing, SCHEMA.byArtist) || "?" }
    ];

    const recommendations: Song[] = [
      { id: "unknown", title: getStringNoLocale(thing, MYAPP.recommendations) || "?", artist: "?" }
    ];

    return {
      id: thing.url,
      created,
      userNotes: notes || undefined,
      inputSongs,
      recommendations,
    };
  });
}
