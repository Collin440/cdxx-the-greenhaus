
# CDXX: The GreenHaus

A **venue-first social platform** built around community, creativity, discovery and conversation.

**CDXX: The GreenHaus** is a production-oriented portfolio project demonstrating modern frontend, backend, database, authentication and real-time application development.

Built with React and Supabase, GreenHaus combines social interaction with place-based discovery through a dark, modern, cyberpunk-inspired interface with a strong emphasis on responsive UX.

---

## Project Status

**Active Development**

The core social platform is operational, including authentication, profiles, social interactions, media uploads, notifications, realtime messaging and responsive navigation.

The current major development direction is **Radar (Diwa Va)** — GreenHaus's discovery layer focused on natural-language place discovery and location-aware search.

Radar is currently being developed incrementally, with the goal of allowing users to describe what they are looking for naturally rather than relying solely on predefined categories or conventional keyword searches.

---

## Screenshots

### Feed

<img width="1011" height="927" alt="GreenHaus Feed" src="https://github.com/user-attachments/assets/c01c73a8-0b4d-423c-8fc6-ff2a56eac334" />

### Mobile

<img width="886" height="1031" alt="GreenHaus Mobile" src="https://github.com/user-attachments/assets/b6287de6-246d-41c4-a68a-7c7cc8399ff7" />

### Burger Overlay

<img width="882" height="1033" alt="GreenHaus Overlay" src="https://github.com/user-attachments/assets/dd8e74a2-ae6d-41be-a599-ec1756281709" />

---

# Features

## Authentication

* User registration
* User login
* Supabase Authentication
* Protected application routes
* Persistent authenticated sessions
* Logout functionality

## Profiles

* User profiles
* Display names
* Usernames
* Profile avatars
* Profile banners
* Edit profile functionality
* Followers
* Following
* Follower/following modals
* Profile navigation

## Social Feed

Users can create and interact with posts through:

* Text posts
* Image posts
* Video posts
* Multiple images
* Likes
* Comments
* Reposts / Sprouts
* Saved posts
* Post sharing
* User profile navigation

Posts are stored in PostgreSQL through Supabase, while media is handled through Supabase Storage.

## Media

The platform currently supports:

* Image uploads
* Multiple images per post
* Video uploads
* MP4
* WebM
* QuickTime video
* Responsive media rendering
* Image lightbox viewing
* Supabase Storage integration

Video is implemented as a media capability within the existing posting system rather than as a separate video product.

## Notifications

The notification system supports database-backed notification records for social activity.

## Realtime Messaging

The messaging system includes:

* Direct conversations
* User search
* Message persistence
* Read status
* Typing indicators
* Realtime message updates
* Message deletion for the current user
* Message unsending
* Message reactions
* Realtime reaction updates

Supported message reactions via Lucide currently include:

* Heart
* Laugh
* Fire
* Sad
* Angry

Message unsending is protected by a server-side Supabase RPC with a time restriction.

## Saved Posts

Users can save posts and access them through the dedicated Saved section.

---

# Radar — Diwa Va

**Radar (Diwa Va)** is the next major development direction for GreenHaus.

The existing Explore concept is being evolved into a natural-language discovery system designed to make place discovery more conversational and context-aware.

The current Radar development includes:

* Natural-language intent parsing
* Category detection
* Location extraction
* Search-term extraction
* Preference detection
* Location-aware discovery
* GreenHaus venue search
* External place discovery
* Map-based place exploration

For example, a user could enter:

> "What's the move tonight?"

or:

> "Find a peaceful restaurant"

Radar is being designed to interpret the intent behind these requests and translate that intent into structured search criteria.

The planned experience is built around separating:

**AI interpretation**

from

**database truth and deterministic retrieval**

The AI layer is intended to interpret user intent rather than become the source of truth for venue or application data.

This separation is an important part of the planned architecture, allowing GreenHaus to combine conversational AI capabilities with deterministic application and location data.

Radar is intended to become one of the primary demonstrations of AI integration within the GreenHaus platform.

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* React Router
* CSS
* Lucide React
* Font Awesome
* Google Maps API

## Backend

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Storage
* Supabase Realtime
* Row Level Security (RLS)
* PostgreSQL functions / RPC

## Development

* Git
* GitHub
* Visual Studio Code
* Windows / PowerShell
* Chrome / Edge Developer Tools

---

# Architecture

GreenHaus follows a client-driven React architecture with Supabase providing the backend infrastructure.

```text
React + Vite
     │
     ├── React Router
     │
     ├── Pages
     │    ├── Feed
     │    ├── Profile
     │    ├── Messages
     │    ├── Notifications
     │    ├── Saved
     │    ├── Settings
     │    └── Explore / Radar
     │
     ├── Radar Discovery Layer
     │    ├── Natural-language intent parsing
     │    ├── Location resolution
     │    ├── GreenHaus venue search
     │    └── External place discovery
     │
     ├── Reusable Components
     │    ├── PostCard
     │    ├── Sidebar
     │    ├── Modals
     │    └── Media Components
     │
     └── Supabase Client
              │
              ├── Authentication
              ├── PostgreSQL
              ├── Storage
              ├── Realtime
              └── RPC Functions
```

---

# Author

**Collin Moleme**

Johannesburg, South Africa

**GitHub:**
https://github.com/Collin440

**LinkedIn:**
https://www.linkedin.com/in/fofo-moleme-a10b2337a/

