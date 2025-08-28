import { Bayon } from "next/font/google"

export const RDF = {
    type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
}

export const SCHEMA = {
    MusicRecording: "http://schema.org/MusicRecording",
    thumbnail: "http://schema.org/thumbnail",
    name: "http://schema.org/name",
    translationOfWork: "http://schema.org/translationOfWork",
    byArtist: "http://schema.org/byArtist",
    inAlbum: "http://schema.org/inAlbum",
    duration: "http://schema.org/duration",
    inLanguage: "http://schema.org/inLanguage",
    datePublished: "http://schema.org/datePublished"
}

export const DCTERMS = {
    created: "http://purl.org/dc/terms/created",
    modified: "http://purl.org/dc/terms/modified"
}

export const FOAF = {
    Person: "http://xmlns.com/foaf/0.1/Person",
    name: "http://xmlns.com/foaf/0.1/name"
}

//export const MYAPP = {
    // Session: "http://myapp.com/Session"
    // userNotes: "http://myapp.com/userNotes"
    // recs: "http://myapp.com/recs"
//}