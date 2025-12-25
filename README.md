<h1 align="center">Steam Receipts</h1>

<p align="center">
  <img src="public/logo.svg" width="100" height="100" alt="Steam Receipts" />
</p>

<p align="center">
  <strong>A Receiptify-style web app for Steam accounts that displays your gaming activity in a stylish receipt format.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt%203-00DC82?style=flat&logo=nuxt&logoColor=white" alt="Nuxt 3" />
  <img src="https://img.shields.io/badge/Vue.js%203-4FC08D?style=flat&logo=vue.js&logoColor=white" alt="Vue.js 3" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vuetify%203-1867C0?style=flat&logo=vuetify&logoColor=white" alt="Vuetify 3" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" alt="Vercel" />
</p>

## Features

- 🎮 **Steam Integration** - Login with your Steam account via OpenID authentication
- 📜 **Receipt-style Display** - Shows your gaming activity in a nostalgic receipt format with custom receipt font
- 🔄 **Multiple Views** - Switch between "Recent" (last 2 weeks) and "All Time" playtime stats
- 🎚️ **Customizable** - Adjust the number of games shown (1-25 items)
- 📥 **Download as Image** - Export your receipt as a PNG image
- 🎨 **Steam-themed Dark UI** - Featuring a responsive design using Steam's signature colors
- 💾 **Firebase Caching** - Firestore caching for improved performance and scalability
- ☁️ **Serverless Architecture** - Deployed entirely on Vercel with zero backend maintenance

<details>
<summary>Screenshots</summary>
<br>

|                 Home Screen                 |                All Time Receipt Example                 |
| :-----------------------------------------: | :-----------------------------------------------------: |
| <img src="examples/home.png" width="400" /> | <img src="examples/all_time_receipt.png" width="400" /> |

</details>

---

## Tech Stack

- **Nuxt 3** - Full-stack Vue framework with server-side rendering
- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Vuetify 3** for Material Design components
- **html2canvas** for receipt image export

### Backend (Serverless)

- **Nitro** - Server engine powering Nuxt server routes
- **Firebase Admin SDK** - Server-side Firestore access for caching
- **Firestore** - NoSQL document database for caching user data
- **Steam Web API** - Direct API calls for game data
- **Steam OpenID** - Authentication via Steam

### Architecture

- **Serverless Nuxt** - All backend logic runs in Nuxt server routes (serverless functions)
- **Single Deployment** - Entire app deployed to Vercel (no separate backend)
- **Direct Steam API Calls** - Server routes fetch data directly from Steam
- **Firestore Caching** - 1-hour cache TTL reduces Steam API calls
- **HttpOnly Cookies** - Secure session management
- **Server-to-Server Communication** - Nuxt server calls backend API internally

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ or [Bun](https://bun.sh)
- A [Steam Web API Key](https://steamcommunity.com/dev/apikey)
- A [Firebase](https://firebase.google.com/) project with Firestore enabled

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/renanzro/steam-receipts.git
   cd steam-receipts

   npm install
   ```

2. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Firestore Database** (production mode)
   - Go to **Project Settings → Service Accounts**
   - Click **Generate New Private Key** and download the JSON file

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:

   ```env
   STEAM_API_KEY=your-steam-api-key
   NUXT_SESSION_SECRET=generate-random-string-here

   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. Start the development server:

   ```bash
   Frontend (runs on port 8080)
   cd frontend && npm run dev
   ```

5. Open http://localhost:8080 in your browser

### Building for Production

```bash
npm run build
```

### Deployment

**Deploy to Vercel:**

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Vercel auto-detects Nuxt configuration
4. Add environment variables in Vercel dashboard:
   - `STEAM_API_KEY`
   - `NUXT_SESSION_SECRET`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
5. Deploy!

## Endpoints (serverless functions running on Vercel)

### Authentication

- `GET /api/auth/login` - Initiate Steam OpenID login flow
- `GET /api/auth/callback` - Validate Steam OpenID callback & set session
- `GET /api/auth/me` - Get current user session (from cache or Steam API)
- `POST /api/auth/logout` - Clear session cookie

### Steam Data

- `GET /api/steam/profile` - Get user's Steam profile (Firestore cached, 1hr TTL)
- `GET /api/steam/games?limit=10` - Get owned games, sorted by playtime (cached)
- `GET /api/steam/games/recent?limit=5` - Get recently played games (filtered from cache)

### Caching Strategy

- User profiles cached in `users/{steamId}` collection
- All games cached in `userGames/{steamId}` collection (single source of truth)
- Recent games filtered in-memory from cached games (no separate API call)
- Cache TTL: 1 hour
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
