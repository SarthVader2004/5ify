
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { formatTime } from "@/lib/api";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title: string;
  onEnded?: () => void;
  autoplay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, onEnded, autoplay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolume, setShowVolume] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolume = useRef(volume);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      };
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      
      // Set initial volume
      audio.volume = volume;
      
      // Clean up
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [onEnded]);
  
  useEffect(() => {
    if (autoplay && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Autoplay failed:", error);
      });
    }
  }, [autoplay, src]);

  useEffect(() => {
    // Update the audio element when the src changes
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      
      if (autoplay) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Autoplay failed:", error);
        });
      }
    }
  }, [src, autoplay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current;
        setVolume(previousVolume.current);
        setIsMuted(false);
      } else {
        previousVolume.current = volume;
        audioRef.current.volume = 0;
        setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const forward30 = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
    }
  };

  const backward15 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  return (
    <div className="w-full bg-spotify-gray rounded-lg p-4 mb-3 shadow-lg">
      <div className="text-sm font-medium mb-2 truncate text-white">{title}</div>
      
      <audio ref={audioRef} preload="metadata">
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-spotify-lightGray">{formatTime(currentTime)}</span>
        <span className="text-xs text-spotify-lightGray">{formatTime(duration)}</span>
      </div>
      
      <Slider
        value={[currentTime]}
        max={duration || 100}
        step={0.1}
        onValueChange={handleSeek}
        className="mt-1"
      />
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-4">
          <button 
            className="text-spotify-lightGray hover:text-white transition-colors"
            onClick={backward15}
            aria-label="Rewind 15 seconds"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black hover:bg-green-400 transition-colors"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </button>
          
          <button 
            className="text-spotify-lightGray hover:text-white transition-colors"
            onClick={forward30}
            aria-label="Forward 30 seconds"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="relative">
          <button 
            className="text-spotify-lightGray hover:text-white transition-colors"
            onClick={() => setShowVolume(!showVolume)}
            onBlur={() => setTimeout(() => setShowVolume(false), 200)}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 bg-spotify-dark p-3 rounded-md w-40 shadow-lg z-10">
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-spotify-lightGray hover:text-white">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
