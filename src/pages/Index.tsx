
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopicInput from "@/components/TopicInput";
import Playlist from "@/components/Playlist";
import History from "@/components/History";
import SurpriseTopics from "@/components/SurpriseTopics";
import Stats from "@/components/Stats";
import { generateContent, textToSpeech, estimateAudioDuration } from "@/lib/api";
import { AudioSnippet, Topic } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  getHistory, 
  addToHistory, 
  clearHistory, 
  trackTopicsPerSession,
  trackGenerationTime
} from "@/services/storageService";

const Index = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [history, setHistory] = useState<AudioSnippet[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load history using our storage service
    setHistory(getHistory());
  }, []);

  const handleAddTopics = async (newTopics: string[]) => {
    if (newTopics.length === 0) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    // Track topics per session
    trackTopicsPerSession(newTopics.length);
    
    // Create topic objects with unique IDs
    const topicObjects: Topic[] = newTopics.map((title) => ({
      id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      isGenerating: true
    }));
    
    // Add new topics to the list
    setTopics(prev => [...prev, ...topicObjects]);
    
    // Process each topic sequentially
    for (const topic of topicObjects) {
      try {
        // Generate content
        const contentResult = await generateContent(topic.title);
        
        if (!contentResult.success || !contentResult.data) {
          throw new Error(contentResult.error || "Failed to generate content");
        }
        
        const content = contentResult.data;
        
        // Update topic with content and start converting to speech
        setTopics(prev => prev.map(t => 
          t.id === topic.id 
            ? { ...t, content, isGenerating: false, isConverting: true } 
            : t
        ));
        
        // Convert to speech
        const speechResult = await textToSpeech(content);
        
        if (!speechResult.success || !speechResult.data) {
          throw new Error(speechResult.error || "Failed to convert to speech");
        }
        
        const audioUrl = speechResult.data;
        const duration = estimateAudioDuration(content);
        
        // Update topic with audio URL
        setTopics(prev => prev.map(t => 
          t.id === topic.id 
            ? { 
                ...t, 
                audioUrl, 
                duration, 
                isConverting: false 
              } 
            : t
        ));
        
        // Add to history
        const audioSnippet: AudioSnippet = {
          id: topic.id,
          title: topic.title,
          content,
          audioUrl,
          duration
        };
        
        // Use our storage service to add to history
        const updatedHistory = addToHistory(audioSnippet);
        setHistory(updatedHistory);
        
        toast({
          title: "Snippet Generated",
          description: `Your learning snippet for "${topic.title}" is ready to play!`,
        });
        
      } catch (error) {
        console.error(`Error processing topic '${topic.title}':`, error);
        
        setTopics(prev => prev.map(t => 
          t.id === topic.id 
            ? { 
                ...t, 
                isGenerating: false, 
                isConverting: false,
                error: error instanceof Error ? error.message : "An unknown error occurred" 
              } 
            : t
        ));
        
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to generate "${topic.title}". Please try again.`,
        });
      }
    }

    // Track generation time
    const totalTime = Date.now() - startTime;
    trackGenerationTime(totalTime / newTopics.length); // Average time per topic
    
    setIsProcessing(false);
  };

  const handlePlaySnippet = (snippet: AudioSnippet) => {
    // Check if the snippet is already in the current topics
    const exists = topics.some(topic => topic.id === snippet.id);
    
    if (!exists) {
      // Add the snippet to the topics if it's not already there
      setTopics(prev => [snippet, ...prev]);
    }
    
    // Set as currently playing
    setCurrentPlaying(snippet.id);
  };

  const handleClearHistory = () => {
    setHistory([]);
    clearHistory();
    toast({
      title: "History Cleared",
      description: "Your history has been cleared successfully.",
    });
  };

  return (
    <div className="min-h-screen w-full dark spotify-gradient text-white">
      <div className="container mx-auto py-8 px-4">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Spotify for Learning</h1>
            <p className="text-spotify-lightGray">Generate personalized audio learning snippets</p>
          </div>
          <div className="mt-4 md:mt-0">
            <img 
              src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png" 
              alt="App Logo" 
              className="h-12 w-12 rounded-full"
            />
          </div>
        </header>
        
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="browse" className="w-full">Browse</TabsTrigger>
            <TabsTrigger value="library" className="w-full">Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-8">
            <Card className="bg-spotify-gray border-none">
              <CardContent className="pt-6">
                <TopicInput onSubmit={handleAddTopics} isProcessing={isProcessing} />
                <SurpriseTopics onSelectTopic={(topic) => handleAddTopics([topic])} />
                <Stats />
              </CardContent>
            </Card>
            
            {topics.length > 0 && (
              <Playlist 
                topics={topics}
                currentPlaying={currentPlaying}
                setCurrentPlaying={setCurrentPlaying}
              />
            )}
          </TabsContent>
          
          <TabsContent value="library">
            <Card className="bg-spotify-gray border-none p-6">
              <History 
                history={history} 
                onPlaySnippet={handlePlaySnippet}
                onClearHistory={handleClearHistory}
              />
              
              {history.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-spotify-lightGray">No learning snippets in your library yet.</p>
                  <p className="text-spotify-lightGray mt-2">Generate some snippets to get started!</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
