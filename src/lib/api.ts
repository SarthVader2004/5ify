
import { ApiResponse, Topic, SurpriseTopic } from "../types";
import { getUserSettings, getGeminiApiKey, getElevenLabsApiKey } from "../services/storageService";

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah voice

export const generateContent = async (topic: string): Promise<ApiResponse<string>> => {
  try {
    const key = getGeminiApiKey();
    if (!key) {
      return { success: false, error: "Gemini API key is missing" };
    }

    const prompt = `Create a concise, engaging podcast-style script (about 600 words) explaining "${topic}". 
    Structure it in three sections:
    1. What is it? - A clear, concise introduction
    2. Why does it matter? - The significance and relevance
    3. How does it work or affect us? - A deeper explanation
    
    Make it conversational, engaging, and easy to follow when listened to. 
    Use a friendly, informative tone like a well-researched podcast.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + key, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      const content = data.candidates[0].content.parts[0].text;
      return { success: true, data: content };
    }

    return { success: false, error: "No content generated" };
  } catch (error) {
    console.error("Error generating content:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate content" 
    };
  }
};

export const textToSpeech = async (text: string): Promise<ApiResponse<string>> => {
  try {
    const key = getElevenLabsApiKey();
    if (!key) {
      return { success: false, error: "ElevenLabs API key is missing" };
    }

    const settings = getUserSettings();
    const voiceId = settings.voiceId || DEFAULT_VOICE_ID;
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": key,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return { success: true, data: audioUrl };
  } catch (error) {
    console.error("Error converting text to speech:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to convert text to speech" 
    };
  }
};

export const estimateAudioDuration = (text: string): number => {
  // Average reading speed is about 150 words per minute
  const wordCount = text.split(/\s+/).length;
  const durationInMinutes = wordCount / 150;
  return Math.round(durationInMinutes * 60); // Convert to seconds
};

export const getSurpriseTopics = (): Array<SurpriseTopic> => {
  return [
    { id: "1", title: "The Fermi Paradox", category: "Space & Astronomy" },
    { id: "2", title: "Quantum Computing Basics", category: "Technology" },
    { id: "3", title: "History of Coffee", category: "Food & Culture" },
    { id: "4", title: "How Neural Networks Work", category: "Artificial Intelligence" },
    { id: "5", title: "Climate Change Tipping Points", category: "Environment" },
    { id: "6", title: "The Psychology of Habits", category: "Psychology" },
    { id: "7", title: "Rise of Cryptocurrency", category: "Finance" },
    { id: "8", title: "Evolution of Human Language", category: "Anthropology" },
    { id: "9", title: "How Dreams Work", category: "Neuroscience" },
    { id: "10", title: "History of Internet Memes", category: "Digital Culture" },
  ];
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
