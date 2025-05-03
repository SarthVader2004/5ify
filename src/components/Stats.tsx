
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsageStats } from "@/services/storageService";
import { History, Clock } from "lucide-react";

const formatTime = (ms: number): string => {
  if (!ms) return "0s";
  
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const Stats: React.FC = () => {
  const [stats, setStats] = React.useState(() => getUsageStats());

  React.useEffect(() => {
    // Refresh stats when component mounts
    setStats(getUsageStats());
    
    // Set up an interval to refresh stats periodically
    const interval = setInterval(() => {
      setStats(getUsageStats());
    }, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const avgTopicsPerSession = React.useMemo(() => {
    if (!stats.topicsPerSession.length) return 0;
    const sum = stats.topicsPerSession.reduce((a, b) => a + b, 0);
    return (sum / stats.topicsPerSession.length).toFixed(1);
  }, [stats.topicsPerSession]);

  const lastUsedDate = React.useMemo(() => {
    if (!stats.lastUsed) return "Never";
    try {
      const date = new Date(stats.lastUsed);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Unknown";
    }
  }, [stats.lastUsed]);

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-spotify-gray border-spotify-lightGray/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-spotify-lightGray flex items-center gap-2">
            <History size={16} />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-spotify-lightGray">Total Snippets Generated</span>
              <span className="font-medium">{stats.totalGenerated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-spotify-lightGray">Avg. Topics per Session</span>
              <span className="font-medium">{avgTopicsPerSession}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-spotify-gray border-spotify-lightGray/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-spotify-lightGray flex items-center gap-2">
            <Clock size={16} />
            Time Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-spotify-lightGray">Avg. Generation Time</span>
              <span className="font-medium">{formatTime(stats.generationTimeAvg)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-spotify-lightGray">Last Used</span>
              <span className="font-medium">{lastUsedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats;
