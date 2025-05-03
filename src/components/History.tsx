
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioSnippet } from "@/types";
import { Clock, Play } from "lucide-react";
import { formatTime } from "@/lib/api";

interface HistoryProps {
  history: AudioSnippet[];
  onPlaySnippet: (snippet: AudioSnippet) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onPlaySnippet, onClearHistory }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recently Generated</h2>
        <Button 
          variant="outline" 
          size="sm"
          className="text-spotify-lightGray border-spotify-lightGray hover:text-spotify-DEFAULT hover:border-spotify-DEFAULT"
          onClick={onClearHistory}
        >
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {history.map((snippet) => (
          <Card 
            key={snippet.id} 
            className="bg-spotify-gray border-spotify-gray hover:border-spotify-DEFAULT transition-all"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-spotify-DEFAULT/10 flex items-center justify-center">
                    <Clock size={16} className="text-spotify-lightGray" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{snippet.title}</h3>
                    <p className="text-xs text-spotify-lightGray">{formatTime(snippet.duration)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-spotify-DEFAULT"
                  onClick={() => onPlaySnippet(snippet)}
                >
                  <Play size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default History;
