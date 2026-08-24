# Architecture Overview — HMS

```
HMS Monorepo Layout
├── apps/web/           # React 18 + Vite + TypeScript + Tailwind CSS
├── backend/            # Python FastAPI + Motor Async Driver + Pydantic v2
├── database/           # MongoDB 2dsphere indexes & seeding scripts
├── infrastructure/     # Docker Compose & Nginx configuration
└── docs/               # Technical specifications
```

## System Data Flow
`Route → Page → Feature Component → API Client → FastAPI Endpoint → MongoDB Service / Repository → MongoDB Database`

- **Frontend**: Single Page Application built with Vite and Tailwind CSS.
- **Backend**: Asynchronous REST & WebSocket API powered by FastAPI.
- **Database**: Document storage with MongoDB Motor engine supporting geospatial `2dsphere` index queries.
