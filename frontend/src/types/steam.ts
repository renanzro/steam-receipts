export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  timecreated?: number;
}

export interface RecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number; // in minutes
  playtime_forever: number; // in minutes
  img_icon_url: string;
  img_logo_url?: string;
}

export interface SteamAuthResponse {
  user: SteamUser;
  recentGames: RecentGame[];
}

export type ReceiptType = 'recent' | 'alltime';

export interface ReceiptOptions {
  type: ReceiptType;
  limit: number;
}
