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
- Real-time direct messaging — conversation history, search, unsend, read/unread tracking, and live message reactions
- Video posts, alongside image posts
- Responsive navigation throughout, including a dedicated mobile nav

## Now live: Radar

**Radar** is GreenHaus's discovery layer, and it's moved from concept to a working feature over the past week of development:

- Venue search foundation, built out and polished
- External place discovery — pulling in results beyond what's already on the platform
- Radar results rendered directly on the Explore map, plus a dedicated results list
- Location fallback handling, for when precise user location isn't available
- Place selection on the map, tying a result back to a full venue view

Radar surfaces nearby venues by blending what's already on GreenHaus with live external place data, centered on the person searching. The next step is layering in natural-language search — "find dispensaries" or "somewhere quiet to get coffee" — resolving into real map results instead of just keyword filters.

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

GreenHaus is built to demonstrate the full stack in one place: schema design, auth flows, real-time systems, file storage, and a UI that doesn't look like a template. With Radar now live, the next milestone is layering natural-language search on top of it.

## Recent activity

| Date | Commit | Hash |
|---|---|---|
| Sep 27, 2026 | Add project portfolio | `6093629` |
| Sep 27, 2026 | Add radar place map selection | `b5c7c18` |
| Sep 25, 2026 | feat: build Radar results list on Explore page | `945511c` |
| Sep 24, 2026 | feat: show Radar results on Explore map | `f8724dd` |
| Sep 23, 2026 | fix: improve Radar external location fallback | `0bae261` |
| Sep 22, 2026 | feat: build Radar external place discovery | `274d067` |
| Sep 22, 2026 | Polish Radar search layout | `1e0b1f1` |
| Sep 22, 2026 | Build Radar venue search foundation | `4c036c5` |
| Sep 21, 2026 | Rename Explore reference to Radar | `ccb5c17` |
| Sep 19, 2026 | Add video posts and mobile navigation | `54de39f` |
| Sep 19, 2026 | feat: add realtime message reactions | `de7cbcd` |
| Sep 19, 2026 | style: polish message unsend button | `e44efd7` |
| Sep 13, 2026 | fix: restore missing @supabase/supabase-js dependency | `f2f1c33` |
| Sep 3, 2026 | feat: complete messaging core and unsend functionality | `11c8f90` |
| Aug 18, 2026 | feat(messages): implement realtime messaging and conversation features | `0e0042e` |

*Full history: [github.com/Collin440/cdxx-the-greenhaus/commits/main](https://github.com/Collin440/cdxx-the-greenhaus/commits/main)*
