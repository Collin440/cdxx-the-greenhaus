# CDXX: The GreenHaus

A venue-first social platform for discovering dispensaries, restaurants, galleries and experiences nearby — and talking about them with people who've actually been.

**Repo:** [github.com/Collin440/cdxx-the-greenhaus](https://github.com/Collin440/cdxx-the-greenhaus)
**Stack:** React · Supabase · Google Maps API

---

## What it is

GreenHaus is a full-stack social platform built around community, creativity, discovery and conversation. It's a portfolio project designed to demonstrate real frontend, backend, database, authentication and real-time application development — not a tutorial clone. The interface is dark, modern and cyberpunk-inspired, with a strong emphasis on responsive UX.

The core idea: instead of a generic feed, GreenHaus is built around *venues*. Users create and follow places, not just people — leaning into local discovery rather than a TikTok-style content firehose.

## Status: active development

The core social platform is operational:

- Authentication and dynamic public profiles
- Follow / unfollow
- Community venue creation, with a details modal and deletion
- Media uploads (profile avatars, banners, venue images) via Supabase storage
- Notifications
- Real-time direct messaging — conversation history, search, read/unread tracking
- Responsive navigation throughout

## Currently building: Radar (Diwa Va)

The next major direction is **Radar** — an AI-powered discovery layer, currently taking shape inside `Explore.jsx`.

Radar surfaces nearby venues on an interactive map, blending:

- **Filtered venues** already on the platform (`filteredVenues`)
- **External place results** pulled in via a radar search (`radarResults`)
- A **venue detail modal** for anything selected, on- or off-platform (`selectedVenue` / `selectedRadarPlace`)
- **Location-aware results**, centered on the user (`userLocation`)

```jsx
<ExploreMap
  venues={filteredVenues}
  radarResults={radarResults}
  selectedVenue={selectedVenue}
  selectedRadarPlace={selectedRadarPlace}
  userLocation={userLocation}
/>
```

The goal is natural-language venue search — "find dispensaries" or "somewhere quiet to get coffee" — resolving into real map results, not just keyword filters. This is the foundation for adding AI capabilities to the project.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React |
| Backend / DB | Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (messaging) |
| Maps | Google Maps API |

## Why this project

GreenHaus is built to demonstrate the full stack in one place: schema design, auth flows, real-time systems, file storage, and a UI that doesn't look like a template. Radar is the next milestone — moving from a working social app to one with an AI-driven discovery layer.
