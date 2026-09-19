# CDXX: The GreenHaus

A full-stack social media platform built around community, creativity, discovery and conversation.

**CDXX: The GreenHaus** is a production-oriented portfolio project designed to demonstrate modern frontend, backend, database, authentication and real-time application development.

The platform is built with React and Supabase and is designed with a dark, modern, cyberpunk-inspired interface with a strong emphasis on responsive UX.

---

## Project Status

**Active Development**

The core social platform is operational, with authentication, profiles, social interactions, media uploads, notifications, realtime messaging and responsive navigation implemented.

The next major development direction is **Radar (Diwa Va)** — the planned AI-powered discovery layer for the platform.

---

##Screenshots
<img width="1011" height="927" alt="WhatsApp Image 2026-09-19 at 21 22 36" src="https://github.com/user-attachments/assets/c01c73a8-0b4d-423c-8fc6-ff2a56eac334" />
<img width="886" height="1031" alt="WhatsApp Image 2026-09-19 at 21 35 14" src="https://github.com/user-attachments/assets/b6287de6-246d-41c4-a68a-7c7cc8399ff7" />
<img width="882" height="1033" alt="WhatsApp Image 2026-09-19 at 21 35 49" src="https://github.com/user-attachments/assets/dd8e74a2-ae6d-41be-a599-ec1756281709" />

---

## Features

### Authentication

- User registration
- User login
- Supabase Authentication
- Protected application routes
- Persistent authenticated sessions
- Logout functionality

### Profiles

- User profiles
- Display names
- Usernames
- Profile avatars
- Profile banners
- Edit profile functionality
- Followers
- Following
- Follower/following modals
- Profile navigation

### Social Feed

Users can create and interact with posts through:

- Text posts
- Image posts
- Video posts
- Multiple images
- Likes
- Comments
- Reposts / Sprouts
- Saved posts
- Post sharing
- User profile navigation

Posts are stored in PostgreSQL through Supabase, while media is handled through Supabase Storage.

### Media

The platform currently supports:

- Image uploads
- Multiple images per post
- Video uploads
- MP4
- WebM
- QuickTime video
- Responsive media rendering
- Image lightbox viewing
- Supabase Storage integration

Video is implemented as a media capability within the existing posting system rather than as a separate video product.

### Notifications

The notification system supports database-backed notification records for social activity.

### Realtime Messaging

The messaging system includes:

- Direct conversations
- User search
- Message persistence
- Read status
- Typing indicators
- Realtime message updates
- Message deletion for the current user
- Message unsending
- Message reactions
- Realtime reaction updates

Supported message reactions (via Lucide) currently include:

- Heart
- Laugh
- Fire
- Sad
- Angry

Message unsending is protected by a server-side Supabase RPC with a time restriction.

### Saved Posts

Users can save posts and access them through the dedicated Saved section.

### Radar — Diwa Va

**Radar (Diwa Va)** is the next major direction for GreenHaus.

The current Explore concept is being evolved into a future AI-assisted discovery system.

The planned experience is centered around natural-language discovery.

For example:

> "What's the move tonight?"

The future Radar system will interpret the user's intent and combine that interpretation with structured application data to return relevant places, activities and community discoveries.

The planned architecture separates:

**AI interpretation**

from

**database truth and deterministic retrieval**

The AI layer will interpret intent rather than becoming the source of truth for venue or application data.

Radar is intended to become one of the primary demonstrations of AI integration within the GreenHaus platform.

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- React Router
- CSS
- Lucide React
- Font Awesome

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Realtime
- Row Level Security (RLS)
- PostgreSQL functions / RPC

## Development

- Git
- GitHub
- Visual Studio Code
- Windows / PowerShell
- Chrome / Edge Developer Tools

---

# Architecture

GreenHaus follows a client-driven React architecture with Supabase providing the backend infrastructure.

```
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
     │    └── Radar
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
Author

Collin Moleme

Johannesburg, South Africa

GitHub:
https://github.com/Collin440

LinkedIn:
https://www.linkedin.com/in/fofo-moleme-a10b2337a/
