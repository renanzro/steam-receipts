# Steam Receipts

A Receiptify-style web app for Steam accounts that displays your gaming activity in a stylish receipt format.

![Steam Receipts](https://img.shields.io/badge/Vue.js%203-4FC08D?style=flat&logo=vue.js&logoColor=white)
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
- 🎯 **Demo Mode** - Try the app with mock data without logging in

## Tech Stack

### Frontend
- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Vuetify 3** for Material Design components
- **Vite** for fast development and building
- **html2canvas** for receipt image export

### Backend
- **Bun** - Fast JavaScript runtime and package manager
- **Hono** - Fast, lightweight web framework
- **Drizzle ORM** - TypeScript ORM for SQLite
- **Bun SQLite** - Native SQLite database driver
- **Steam OpenID** - Authentication via Steam

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
   cd ../frontend && bun install
   ```

3. Configure environment variables:

   ```bash
   # Backend (.env)
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your STEAM_API_KEY

   # Frontend (.env)
   cp frontend/.env.example frontend/.env
   ```

4. Initialize the database:

   ```bash
   cd backend
   bun run db:generate
   bun run db:migrate
   ```

5. Start both servers:

   ```bash
   # Terminal 1 - Backend
   cd backend && bun run dev

   # Terminal 2 - Frontend
   cd frontend && bun run dev
   ```

6. Open http://localhost:8080 in your browser

### Building for Production

```bash
# Build frontend
cd frontend && bun run build

# Build backend
cd backend && bun run build
```

## Project Structure

```
steam-receipts/
├── frontend/
│   ├── src/
│   │   ├── components/             # Vue components
│   │   │   ├── SteamReceipt.vue    # Main receipt display
│   │   │   ├── ReceiptOptions.vue  # Settings panel
│   │   │   ├── LoginCard.vue       # Login UI
│   │   │   ├── LoadingState.vue    # Loading spinner
│   │   │   └── AppLogo.vue         # App logo component
│   │   ├── composables/            # Composition API hooks
│   │   │   └── useSteam.ts         # Steam context (auth, games)
│   │   ├── types/                  # TypeScript types
│   │   │   └── steam.ts            # Steam API types
│   │   ├── assets/                 # Static assets (fonts, images)
│   │   ├── App.vue                 # Root component
│   │   └── main.ts                 # App entry point
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.ts          # Steam authentication
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

### Authentication
- `GET /auth/steam` - Redirect to Steam login
- `GET /auth/steam/callback` - Handle Steam OAuth callback
- `GET /auth/me` - Get current user session
- `POST /auth/logout` - Logout user

### Steam Data
- `GET /steam/games` - Get user's owned games (sorted by all-time playtime)
- `GET /steam/games/recent` - Get recently played games (last 2 weeks)
- `GET /steam/profile` - Get user's Steam profile

## License

MIT License

## Acknowledgments

- Inspired by [Receiptify](https://receiptify.herokuapp.com)
- Receipt font: [Fake Receipt](https://www.1001fonts.com/fake-receipt-font.html) from 1001 Fonts
- Steam is a trademark of Valve Corporation
