
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Download, Headphones, Loader2, PlayCircle, Clock } from "lucide-react";
import { Topic } from "@/types";
import AudioPlayer from "./AudioPlayer";
import { formatTime } from "@/lib/api";

interface PlaylistProps {
  topics: Topic[];
  currentPlaying: string | null;
  setCurrentPlaying: (id: string | null) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ 
  topics, 
  currentPlaying, 
  setCurrentPlaying 
}) => {
  if (topics.length === 0) {
    return null;
  }

  const totalDuration = topics.reduce((acc, topic) => {
    return acc + (topic.duration || 0);
  }, 0);

  const readyTopics = topics.filter(
    topic => topic.audioUrl && !topic.isGenerating && !topic.isConverting
  );

  const handlePlayAll = () => {
    const firstTopic = readyTopics[0];
    if (firstTopic) {
      setCurrentPlaying(firstTopic.id);
    }
  };

  const handlePlayNext = (currentId: string) => {
    const currentIndex = topics.findIndex(t => t.id === currentId);
    if (currentIndex >= 0 && currentIndex < topics.length - 1) {
      const nextTopic = topics.slice(currentIndex + 1).find(
        topic => topic.audioUrl && !topic.isGenerating && !topic.isConverting
      );
      if (nextTopic) {
        setCurrentPlaying(nextTopic.id);
      } else {
        setCurrentPlaying(null);
      }
    } else {
      setCurrentPlaying(null);
    }
  };

  const handleDownload = (topic: Topic) => {
    if (topic.audioUrl) {
      const a = document.createElement('a');
      a.href = topic.audioUrl;
      a.download = `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Headphones size={18} className="text-green-500" />
          <h2 className="text-xl font-bold">Your Learning Playlist</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center text-sm text-spotify-lightGray">
            <Clock size={16} className="mr-1" />
            {formatTime(totalDuration)}
          </span>
          <Button 
            onClick={handlePlayAll}
            className="spotify-button flex items-center gap-2"
            size="sm"
            disabled={readyTopics.length === 0}
          >
            <PlayCircle size={16} />
            <span>Play All</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {topics.map((topic) => (
          <Card 
            key={topic.id}
            className={`${
              currentPlaying === topic.id ? 'border-green-500' : 'border-spotify-gray'
            } bg-spotify-gray hover:bg-spotify-gray/80 transition-all shadow-md`}
          >
            <CardContent className="p-4">
              {currentPlaying === topic.id && topic.audioUrl ? (
                <AudioPlayer 
                  src={topic.audioUrl} 
                  title={topic.title}
                  onEnded={() => handlePlayNext(topic.id)}
                  autoplay={true}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full ${topic.audioUrl ? 'bg-green-500/20' : 'bg-spotify-lightGray/10'} flex items-center justify-center`}>
                      {topic.isGenerating || topic.isConverting ? (
                        <Loader2 size={20} className="animate-spin text-spotify-lightGray" />
                      ) : topic.audioUrl ? (
                        <Headphones size={20} className="text-green-500" />
                      ) : (
                        <Headphones size={20} className="text-spotify-lightGray" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{topic.title}</h3>
                      {topic.isGenerating ? (
                        <p className="text-xs text-spotify-lightGray flex items-center">
                          <Loader2 size={12} className="animate-spin mr-1" />
                          Generating content...
                        </p>
                      ) : topic.isConverting ? (
                        <p className="text-xs text-spotify-lightGray flex items-center">
                          <Loader2 size={12} className="animate-spin mr-1" />
                          Converting to speech...
                        </p>
                      ) : topic.error ? (
                        <p className="text-xs text-red-500">{topic.error}</p>
                      ) : topic.duration ? (
                        <p className="text-xs text-spotify-lightGray flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTime(topic.duration)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {topic.audioUrl && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-transparent border-spotify-lightGray/20 hover:border-green-500 hover:bg-green-500/10"
                          onClick={() => handleDownload(topic)}
                        >
                          <Download size={16} className="text-white" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-transparent border-spotify-lightGray/20 hover:border-green-500 hover:bg-green-500/10"
                          onClick={() => setCurrentPlaying(topic.id)}
                        >
                          <Play size={16} className="text-white" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
