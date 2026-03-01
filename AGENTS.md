## Project Summary
An anime streaming application built with React, Vite, and Tailwind CSS. It features anime discovery, details, episode selection, and a video player with history tracking.

## Tech Stack
- Frontend: React 18, Vite, TypeScript
- Styling: Tailwind CSS, Framer Motion, Lucide React
- State Management: TanStack React Query
- Icons: Lucide React
- Components: Shadcn UI (Radix UI)
- Routing: React Router DOM

## Architecture
- `src/components`: Reusable UI components and business components like `AnimeCard`, `AnimeRow`, etc.
- `src/pages`: Page-level components corresponding to routes.
- `src/hooks`: Custom React hooks for data fetching (e.g., `useAnime`, `useLibrary`).
- `src/lib`: Utility functions, API clients, and database helpers.

## User Preferences
- Clean Home page (do not touch).
- Efficient navigation for long episode lists (100+ episodes).

## Project Guidelines
- Follow existing code style and conventions.
- No comments unless requested.
- Use `useMemo` for expensive calculations or data processing derived from props/state.
- Keep hooks at the top level of components.

## Common Patterns
- Episode range selection (1-100, 101-200, etc.) for anime with > 100 episodes.
- Fullscreen landscape mode for video playback.
