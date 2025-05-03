
import { AudioSnippet, Topic, UserSettings } from "@/types";

const STORAGE_KEYS = {
  HISTORY: "audioHistory",
  GEMINI_API_KEY: "geminiApiKey",
  ELEVENLABS_API_KEY: "elevenLabsApiKey",
  USER_SETTINGS: "userSettings",
  FAVORITES: "favoriteSnippets",
  USAGE_STATS: "usageStats"
};

export interface UsageStats {
  totalGenerated: number;
  topicsPerSession: number[];
  lastUsed: string;
  generationTimeAvg: number;
}

export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from storage: ${key}`, error);
    return defaultValue;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in storage: ${key}`, error);
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from storage: ${key}`, error);
  }
};

// History management
export const getHistory = (): AudioSnippet[] => {
  return getItem<AudioSnippet[]>(STORAGE_KEYS.HISTORY, []);
};

export const addToHistory = (snippet: AudioSnippet): AudioSnippet[] => {
  const history = getHistory();
  const newHistory = [snippet, ...history.filter(item => item.id !== snippet.id)];
  
  // Limit history to last 10 items
  const limitedHistory = newHistory.slice(0, 10);
  setItem(STORAGE_KEYS.HISTORY, limitedHistory);
  
  // Update usage stats
  updateUsageStats();
  
  return limitedHistory;
};

export const clearHistory = (): void => {
  removeItem(STORAGE_KEYS.HISTORY);
};

// Favorites management
export const getFavorites = (): AudioSnippet[] => {
  return getItem<AudioSnippet[]>(STORAGE_KEYS.FAVORITES, []);
};

export const toggleFavorite = (snippet: AudioSnippet): boolean => {
  const favorites = getFavorites();
  const isFavorite = favorites.some(item => item.id === snippet.id);
  
  let newFavorites;
  if (isFavorite) {
    newFavorites = favorites.filter(item => item.id !== snippet.id);
  } else {
    newFavorites = [snippet, ...favorites];
  }
  
  setItem(STORAGE_KEYS.FAVORITES, newFavorites);
  return !isFavorite; // Return the new status
};

export const isFavorite = (snippetId: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === snippetId);
};

// API keys management
export const getGeminiApiKey = (): string => {
  return getItem<string>(STORAGE_KEYS.GEMINI_API_KEY, "");
};

export const setGeminiApiKey = (key: string): void => {
  setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
};

export const getElevenLabsApiKey = (): string => {
  return getItem<string>(STORAGE_KEYS.ELEVENLABS_API_KEY, "");
};

export const setElevenLabsApiKey = (key: string): void => {
  setItem(STORAGE_KEYS.ELEVENLABS_API_KEY, key);
};

// User settings management
export const getUserSettings = (): UserSettings => {
  return getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS, {
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Default Sarah voice
    voiceName: "Sarah",
  });
};

export const setUserSettings = (settings: UserSettings): void => {
  setItem(STORAGE_KEYS.USER_SETTINGS, settings);
};

// Usage statistics
export const getUsageStats = (): UsageStats => {
  return getItem<UsageStats>(STORAGE_KEYS.USAGE_STATS, {
    totalGenerated: 0,
    topicsPerSession: [],
    lastUsed: "",
    generationTimeAvg: 0,
  });
};

export const updateUsageStats = (): void => {
  const stats = getUsageStats();
  const history = getHistory();
  
  setItem(STORAGE_KEYS.USAGE_STATS, {
    ...stats,
    totalGenerated: history.length,
    lastUsed: new Date().toISOString(),
  });
};

export const trackTopicsPerSession = (count: number): void => {
  const stats = getUsageStats();
  const updatedStats = {
    ...stats,
    topicsPerSession: [...stats.topicsPerSession, count].slice(-10), // Keep last 10 sessions
  };
  setItem(STORAGE_KEYS.USAGE_STATS, updatedStats);
};

export const trackGenerationTime = (timeInMs: number): void => {
  const stats = getUsageStats();
  const currentAvg = stats.generationTimeAvg;
  const totalGenerated = stats.totalGenerated;
  
  // Calculate new average
  const newAvg = totalGenerated === 0 
    ? timeInMs 
    : (currentAvg * totalGenerated + timeInMs) / (totalGenerated + 1);
  
  setItem(STORAGE_KEYS.USAGE_STATS, {
    ...stats,
    generationTimeAvg: newAvg,
  });
};
