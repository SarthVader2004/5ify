
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, HelpCircle, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { setGeminiApiKey, setElevenLabsApiKey, getGeminiApiKey, getElevenLabsApiKey } from "@/services/storageService";

interface TopicInputProps {
  onSubmit: (topics: string[]) => void;
  isProcessing: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isProcessing }) => {
  const [singleTopic, setSingleTopic] = useState("");
  const [multipleTopics, setMultipleTopics] = useState("");
  const [activeTab, setActiveTab] = useState("single");
  const [apiKeysSet, setApiKeysSet] = useState({ gemini: !!getGeminiApiKey(), elevenLabs: !!getElevenLabsApiKey() });
  const [inputApiKeys, setInputApiKeys] = useState({ gemini: "", elevenLabs: "" });
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(!apiKeysSet.gemini || !apiKeysSet.elevenLabs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeysSet.gemini || !apiKeysSet.elevenLabs) {
      setShowApiKeyAlert(true);
      return;
    }

    let topicsToProcess: string[] = [];
    
    if (activeTab === "single") {
      if (singleTopic.trim()) {
        topicsToProcess = [singleTopic.trim()];
        setSingleTopic("");
      }
    } else {
      // Split by commas or new lines
      const lines = multipleTopics
        .split(/[\n,]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
        
      if (lines.length > 0) {
        topicsToProcess = lines;
        setMultipleTopics("");
      }
    }
    
    if (topicsToProcess.length > 0) {
      onSubmit(topicsToProcess);
    }
  };

  const saveApiKeys = () => {
    if (inputApiKeys.gemini) {
      setGeminiApiKey(inputApiKeys.gemini);
    }
    
    if (inputApiKeys.elevenLabs) {
      setElevenLabsApiKey(inputApiKeys.elevenLabs);
    }
    
    setApiKeysSet({
      gemini: !!inputApiKeys.gemini || !!getGeminiApiKey(),
      elevenLabs: !!inputApiKeys.elevenLabs || !!getElevenLabsApiKey()
    });
    
    if (!!inputApiKeys.gemini || !!getGeminiApiKey()) {
      if (!!inputApiKeys.elevenLabs || !!getElevenLabsApiKey()) {
        setShowApiKeyAlert(false);
      }
    }
    
    setInputApiKeys({ gemini: "", elevenLabs: "" });
  };

  return (
    <div className="w-full">
      {showApiKeyAlert && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="flex items-center gap-2">
            You need to {' '}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-yellow-500 p-0 h-auto underline">
                  set up your API keys
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-spotify-gray border-spotify-lightGray/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">API Keys Setup</DialogTitle>
                  <DialogDescription className="text-spotify-lightGray">
                    Enter your API keys to enable topic generation and text-to-speech conversion.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 mt-2">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gemini" className="text-white">Gemini API Key</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <HelpCircle className="h-4 w-4 text-spotify-lightGray" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-spotify-dark text-white">
                            <p className="max-w-xs">Get your Gemini API key from <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a></p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <Input
                        id="gemini"
                        placeholder="Enter your Gemini API key"
                        value={inputApiKeys.gemini}
                        onChange={(e) => setInputApiKeys({ ...inputApiKeys, gemini: e.target.value })}
                        className="spotify-input pr-8"
                        type="password"
                      />
                      <Lock className="absolute right-2 top-2.5 h-4 w-4 text-spotify-lightGray" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="elevenlabs" className="text-white">ElevenLabs API Key</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <HelpCircle className="h-4 w-4 text-spotify-lightGray" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-spotify-dark text-white">
                            <p className="max-w-xs">Get your ElevenLabs API key from <a href="https://elevenlabs.io/speech-synthesis" target="_blank" rel="noreferrer" className="underline">ElevenLabs</a></p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <Input
                        id="elevenlabs"
                        placeholder="Enter your ElevenLabs API key"
                        value={inputApiKeys.elevenLabs}
                        onChange={(e) => setInputApiKeys({ ...inputApiKeys, elevenLabs: e.target.value })}
                        className="spotify-input pr-8"
                        type="password"
                      />
                      <Lock className="absolute right-2 top-2.5 h-4 w-4 text-spotify-lightGray" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveApiKeys} className="spotify-button">Save API Keys</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {' '} before generating content.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="single" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4 bg-spotify-gray/60">
            <TabsTrigger value="single" className="w-full data-[state=active]:bg-green-500">Single Topic</TabsTrigger>
            <TabsTrigger value="multiple" className="w-full data-[state=active]:bg-green-500">Multiple Topics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <Input
              placeholder="Enter a learning topic (e.g. 'History of Coffee')"
              value={singleTopic}
              onChange={(e) => setSingleTopic(e.target.value)}
              className="spotify-input"
            />
          </TabsContent>
          
          <TabsContent value="multiple" className="space-y-4">
            <Textarea
              placeholder="Enter multiple topics, separated by commas or new lines"
              value={multipleTopics}
              onChange={(e) => setMultipleTopics(e.target.value)}
              className="min-h-[100px] spotify-input"
            />
          </TabsContent>
          
          <div className="flex mt-4">
            <Button 
              type="submit" 
              className="w-full spotify-button"
              disabled={isProcessing}
            >
              {isProcessing ? "Generating..." : "Generate Learning Snippets"}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
};

export default TopicInput;
