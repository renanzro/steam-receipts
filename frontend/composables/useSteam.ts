import type { SteamUser, RecentGame, ReceiptOptions, ReceiptType } from '~/types/steam';

// Global state using useState for SSR-friendly state management
export const useSteam = () => {
  const user = useState<SteamUser | null>('steam-user', () => null);
  const recentGames = useState<RecentGame[]>('steam-recent-games', () => []);
  const allTimeGames = useState<RecentGame[]>('steam-alltime-games', () => []);
  const receiptOptions = useState<ReceiptOptions>('steam-receipt-options', () => ({
    type: 'recent',
    limit: 10
  }));
  const isLoading = useState('steam-loading', () => false);
  const error = useState<string | null>('steam-error', () => null);
  const receiptElement = useState<HTMLElement | null>('steam-receipt-element', () => null);

  const isAuthenticated = computed(() => user.value !== null);

  const totalPlaytime = computed(() => {
    const games = receiptOptions.value.type === 'recent' ? recentGames.value : allTimeGames.value;
    const playtimeKey =
      receiptOptions.value.type === 'recent' ? 'playtime_2weeks' : 'playtime_forever';
    return games
      .slice(0, receiptOptions.value.limit)
      .reduce((total, game) => total + (game[playtimeKey] || 0), 0);
  });

  const displayedGames = computed(() => {
    const games = receiptOptions.value.type === 'recent' ? recentGames.value : allTimeGames.value;
    return games.slice(0, receiptOptions.value.limit);
  });

  const login = () => {
    // Redirect to Nuxt BFF login endpoint
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      });
    } catch (e) {
      // Ignore errors on logout
    } finally {
      user.value = null;
      recentGames.value = [];
      allTimeGames.value = [];
      error.value = null;
    }
  };

  const checkAuth = async () => {
    try {
      const data = await $fetch<{ authenticated: boolean; player?: SteamUser }>('/api/auth/me');

      if (data.authenticated && data.player) {
        user.value = data.player;
        // Fetch recent games after confirming authentication
        await fetchRecentGames();
      }
    } catch (e) {
      // Not authenticated or server error
      console.error('Auth check failed:', e);
    }
  };

  const MAX_ITEMS = 25; // Maximum items the slider allows

  const fetchRecentGames = async () => {
    if (!user.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const games = await $fetch<any[]>(`/api/steam/games/recent?limit=${MAX_ITEMS}`);
      recentGames.value = games.map(game => ({
        ...game,
        img_icon_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
      }));
    } catch (e) {
      error.value = 'Failed to load recent games';
      console.error('Fetch games error:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllTimeGames = async () => {
    if (!user.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const games = await $fetch<any[]>(`/api/steam/games?limit=${MAX_ITEMS}`);
      allTimeGames.value = games.map(game => ({
        ...game,
        img_icon_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`
      }));
    } catch (e) {
      error.value = 'Failed to load all-time games';
      console.error('Fetch all-time games error:', e);
    } finally {
      isLoading.value = false;
    }
  };

  const setReceiptType = async (type: ReceiptType) => {
    receiptOptions.value.type = type;

    // Fetch data if not already loaded
    if (type === 'recent' && recentGames.value.length === 0) {
      await fetchRecentGames();
    } else if (type === 'alltime' && allTimeGames.value.length === 0) {
      await fetchAllTimeGames();
    }
  };

  const setReceiptLimit = (limit: number) => {
    receiptOptions.value.limit = limit;
  };

  const setReceiptElement = (element: HTMLElement | null) => {
    receiptElement.value = element;
  };

  // Mock data for demonstration purposes
  const setMockData = () => {
    isLoading.value = true;

    setTimeout(() => {
      user.value = {
        steamid: '76561198012345678',
        personaname: 'GamerPro2024',
        profileurl: 'https://steamcommunity.com/id/gamerpro2024/',
        avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
        avatarmedium:
          'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
        avatarfull:
          'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        personastate: 1
      };

      recentGames.value = [
        {
          appid: 730,
          name: 'Counter-Strike 2',
          playtime_2weeks: 1847,
          playtime_forever: 24560,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg'
        },
        {
          appid: 570,
          name: 'Dota 2',
          playtime_2weeks: 965,
          playtime_forever: 15420,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg'
        },
        {
          appid: 1172470,
          name: 'Apex Legends',
          playtime_2weeks: 542,
          playtime_forever: 3200,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg'
        },
        {
          appid: 1245620,
          name: 'ELDEN RING',
          playtime_2weeks: 423,
          playtime_forever: 1850,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'
        },
        {
          appid: 892970,
          name: 'Valheim',
          playtime_2weeks: 312,
          playtime_forever: 890,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg'
        },
        {
          appid: 413150,
          name: 'Stardew Valley',
          playtime_2weeks: 187,
          playtime_forever: 456,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg'
        },
        {
          appid: 1091500,
          name: 'Cyberpunk 2077',
          playtime_2weeks: 156,
          playtime_forever: 320,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'
        },
        {
          appid: 814380,
          name: 'Sekiro™: Shadows Die Twice',
          playtime_2weeks: 98,
          playtime_forever: 245,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg'
        }
      ];

      allTimeGames.value = [
        {
          appid: 730,
          name: 'Counter-Strike 2',
          playtime_2weeks: 1847,
          playtime_forever: 24560,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg'
        },
        {
          appid: 570,
          name: 'Dota 2',
          playtime_2weeks: 965,
          playtime_forever: 15420,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg'
        },
        {
          appid: 1172470,
          name: 'Apex Legends',
          playtime_2weeks: 542,
          playtime_forever: 8200,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg'
        },
        {
          appid: 1245620,
          name: 'ELDEN RING',
          playtime_2weeks: 0,
          playtime_forever: 5850,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'
        },
        {
          appid: 292030,
          name: 'The Witcher 3: Wild Hunt - Game of the Year Edition',
          playtime_2weeks: 0,
          playtime_forever: 4560,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg'
        },
        {
          appid: 892970,
          name: 'Valheim',
          playtime_2weeks: 312,
          playtime_forever: 3890,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg'
        },
        {
          appid: 1091500,
          name: 'Cyberpunk 2077: Phantom Liberty Ultimate Edition',
          playtime_2weeks: 0,
          playtime_forever: 3200,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'
        },
        {
          appid: 814380,
          name: 'Sekiro™: Shadows Die Twice - GOTY Edition',
          playtime_2weeks: 0,
          playtime_forever: 2800,
          img_icon_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg'
        }
      ];

      isLoading.value = false;
    }, 1500);
  };

  return {
    user,
    recentGames,
    allTimeGames,
    receiptOptions,
    isLoading,
    error,
    isAuthenticated,
    totalPlaytime,
    displayedGames,
    receiptElement,
    login,
    logout,
    checkAuth,
    fetchRecentGames,
    fetchAllTimeGames,
    setReceiptType,
    setReceiptLimit,
    setReceiptElement,
    setMockData
  };
};
