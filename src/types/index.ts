
export interface Topic {
  id: string;
  title: string;
  content?: string;
  audioUrl?: string;
  duration?: number;
  isGenerating?: boolean;
  isConverting?: boolean;
  error?: string;
}

export interface AudioSnippet extends Topic {
  content: string;
  audioUrl: string;
  duration: number;
}

export interface SurpriseTopic {
  id: string;
  title: string;
  category: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserSettings {
  voiceId: string;
  voiceName: string;
}
