
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSurpriseTopics } from "@/lib/api";
import { SurpriseTopic } from "@/types";
import { Sparkles, PlusCircle, Heart } from "lucide-react";
import { isFavorite, toggleFavorite, getHistory } from "@/services/storageService";

interface SurpriseTopicsProps {
  onSelectTopic: (topic: string) => void;
}

const SurpriseTopics: React.FC<SurpriseTopicsProps> = ({ onSelectTopic }) => {
  const [topics, setTopics] = React.useState<SurpriseTopic[]>([]);
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  
  React.useEffect(() => {
    // Get surprise topics
    const surpriseTopics = getSurpriseTopics();
    
    // Get user history to generate personalized recommendations
    const history = getHistory();
    const userInterests = new Set<string>();
    
    // Extract categories from history
    history.forEach(snippet => {
      // Look for category keywords in the content
      const content = snippet.content.toLowerCase();
      const categories = [
        "space", "astronomy", "technology", "science", "food", "culture", 
        "ai", "artificial intelligence", "environment", "climate", "psychology", 
        "finance", "language", "neuroscience", "digital"
      ];
      
      categories.forEach(category => {
        if (content.includes(category)) {
          userInterests.add(category);
        }
      });
    });
    
    // Sort topics to prioritize those matching user interests
    const sortedTopics = [...surpriseTopics].sort((a, b) => {
      const aCategory = a.category.toLowerCase();
      const bCategory = b.category.toLowerCase();
      
      // Check if categories match user interests
      const aMatches = Array.from(userInterests).some(interest => 
        aCategory.includes(interest) || a.title.toLowerCase().includes(interest)
      );
      
      const bMatches = Array.from(userInterests).some(interest => 
        bCategory.includes(interest) || b.title.toLowerCase().includes(interest)
      );
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
    
    setTopics(sortedTopics);
    
    // Initialize favorites
    const favoritesMap: Record<string, boolean> = {};
    sortedTopics.forEach(topic => {
      favoritesMap[topic.id] = isFavorite(topic.id);
    });
    setFavorites(favoritesMap);
  }, []);

  const handleToggleFavorite = (topic: SurpriseTopic, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create an audio snippet-like object for the favorite
    const snippetLike = {
      id: topic.id,
      title: topic.title,
      content: '',
      audioUrl: '',
      duration: 0
    };
    
    const newStatus = toggleFavorite(snippetLike);
    setFavorites(prev => ({
      ...prev,
      [topic.id]: newStatus
    }));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-green-500" />
        <h3 className="text-lg font-semibold">Surprise Me</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {topics.slice(0, 6).map((topic) => (
          <Card 
            key={topic.id} 
            className="bg-spotify-gray border-spotify-lightGray/10 hover:border-green-500 transition-all duration-200 shadow-md hover:bg-spotify-gray/80 cursor-pointer"
            onClick={() => onSelectTopic(topic.title)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-green-400">{topic.category}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`p-1 hover:bg-transparent ${favorites[topic.id] ? 'text-green-500' : 'text-spotify-lightGray'}`}
                    onClick={(e) => handleToggleFavorite(topic, e)}
                  >
                    <Heart size={14} fill={favorites[topic.id] ? "currentColor" : "none"} />
                  </Button>
                </div>
                <span className="font-medium text-white">{topic.title}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs self-end hover:text-green-500 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTopic(topic.title);
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Add to Queue</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurpriseTopics;
