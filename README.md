# Steam Receipts

A Receiptify-style web app for Steam accounts that displays your gaming activity in a stylish receipt format.

![Nuxt](https://img.shields.io/badge/Nuxt%203-00DC82?style=flat&logo=nuxt&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js%203-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify%203-1867C0?style=flat&logo=vuetify&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white)

## Features

- 🎮 **Steam Integration** - Login with your Steam account via OpenID authentication
- 📜 **Receipt-style Display** - Shows your gaming activity in a nostalgic receipt format with custom receipt font
- 🔄 **Multiple Views** - Switch between "Recent" (last 2 weeks) and "All Time" playtime stats
- 🎚️ **Customizable** - Adjust the number of games shown (1-25 items)
- 📥 **Download as Image** - Export your receipt as a PNG image
- 🎨 **Steam-themed Dark UI** - Featuring a responsive design using Steam's signature colors
- 💾 **Database Caching** - SQLite caching for improved performance

## Tech Stack

### Frontend (Nuxt BFF Pattern)
- **Nuxt 3** - Full-stack Vue framework with server-side rendering
- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Vuetify 3** for Material Design components
- **html2canvas** for receipt image export
- **Nitro** - Server engine for serverless deployment (Vercel)

### Backend API
- **Bun** - Fast JavaScript runtime and package manager
- **Hono** - Fast, lightweight web framework
- **Drizzle ORM** - TypeScript ORM for SQLite
- **Bun SQLite** - Native SQLite database driver
- **Steam OpenID** - Authentication via Steam

### Architecture
- **BFF (Backend for Frontend)** - Nuxt server acts as a proxy between browser and API
- **Separate Domains** - Frontend on Vercel, Backend on Railway
- **HttpOnly Cookies** - Secure session management on Nuxt domain
- **Server-to-Server Communication** - Nuxt server calls backend API internally

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- A [Steam Web API Key](https://steamcommunity.com/dev/apikey)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/renanzro/steam-receipts.git
   cd steam-receipts
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd backend && bun install
   cd ../frontend && npm install
   ```

3. Configure environment variables:

   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your STEAM_API_KEY

   # Frontend (.env)
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env and set NUXT_BACKEND_URL to your backend URL
   ```

4. Initialize the database:

   ```bash
   cd backend
   bun run db:generate
   bun run db:migrate
   ```

5. Start both servers:

   ```bash
   # Terminal 1 - Backend (runs on port 3000)
   cd backend && bun run dev

   # Terminal 2 - Frontend (runs on port 8080)
   cd frontend && npm run dev
   ```

6. Open http://localhost:8080 in your browser

### Building for Production

```bash
# Build frontend (generates Vercel-ready output in .vercel/output)
cd frontend && npm run build

# Build backend
cd backend && bun run build
```

### Deployment

- **Frontend**: Deploy to Vercel (auto-detects Nuxt, uses Nitro preset)
- **Backend**: Deploy to Railway or any Node.js/Bun-compatible host
- Set environment variables:
  - Frontend: `NUXT_BACKEND_URL` (your Railway backend URL)
  - Backend: `STEAM_API_KEY`, `DATABASE_URL` (if using remote DB)

## Project Structure

```
steam-receipts/
├── frontend/                    # Nuxt 3 Application
│   ├── components/              # Vue components
│   │   ├── SteamReceipt.vue     # Main receipt display
│   │   ├── ReceiptOptions.vue   # Settings panel
│   │   ├── LoginCard.vue        # Login UI
│   │   ├── LoadingState.vue     # Loading spinner
│   │   └── AppLogo.vue          # App logo component
│   ├── composables/             # Auto-imported composables
│   │   └── useSteam.ts          # Steam state management
│   ├── server/api/              # Nuxt server routes (BFF layer)
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── login.get.ts     # Initiate Steam login
│   │   │   ├── callback.get.ts  # Handle Steam callback
│   │   │   ├── me.get.ts        # Get current user
│   │   │   └── logout.post.ts   # Logout
│   │   └── steam/               # Steam data proxy
│   │       ├── profile.get.ts   # User profile
│   │       └── games/           # Games endpoints
│   ├── types/                   # TypeScript types
│   │   └── steam.ts             # Steam API types
│   ├── assets/                  # Static assets (fonts, images)
│   ├── app.vue                  # Root component
│   ├── nuxt.config.ts           # Nuxt configuration
│   └── package.json
├── backend/                     # Hono API Server
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.ts          # Steam authentication & validation
│   │   │   └── steam.ts         # Steam data endpoints
│   │   ├── lib/                 # Utilities
│   │   │   ├── steam-auth.ts    # OpenID helpers
│   │   │   └── steam-api.ts     # Steam API client
│   │   ├── db/                  # Database
│   │   │   ├── schema.ts        # Drizzle schema
│   │   │   ├── queries.ts       # Database queries
│   │   │   └── index.ts         # DB connection
│   │   ├── app.ts               # Hono app setup
│   │   └── index.ts             # Server entry point
│   ├── drizzle/                 # Database migrations
│   └── package.json
└── README.md
```

## API Endpoints

### Nuxt Server Routes (BFF - Browser calls these)
- `GET /api/auth/login` - Initiate Steam login flow
- `GET /api/auth/callback` - Handle Steam OAuth callback
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/steam/games` - Get user's owned games (all-time)
- `GET /api/steam/games/recent` - Get recently played games
- `GET /api/steam/profile` - Get user's Steam profile

### Backend API Routes (Nuxt server calls these)
- `GET /auth/steam/url` - Get Steam OpenID login URL
- `POST /auth/steam/validate` - Validate Steam OpenID response
- `GET /steam/games` - Get owned games (requires `X-Steam-Id` header)
- `GET /steam/games/recent` - Get recent games (requires `X-Steam-Id` header)
- `GET /steam/profile` - Get profile (requires `X-Steam-Id` header)

## License

MIT License

## Acknowledgments

- Inspired by [Receiptify](https://receiptify.herokuapp.com)
- Receipt font: [Fake Receipt](https://www.1001fonts.com/fake-receipt-font.html) from 1001 Fonts
- Steam is a trademark of Valve Corporation
