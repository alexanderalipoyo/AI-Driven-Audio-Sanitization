import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Card } from "./components/ui/card";
import { FileUploadZone } from "./components/FileUploadZone";
import { FormatSelector } from "./components/FormatSelector";
import { PresetCards } from "./components/PresetCards";
import { ProcessingQueue } from "./components/ProcessingQueue";
import { DownloadSection } from "./components/DownloadSection";
import { BatchProcessor } from "./components/BatchProcessor";
import { WordTimestamps } from "./components/WordTimestamps";
import { WordSafetyReport } from "./components/WordSafetyReport";
import { VideoPreview } from "./components/VideoPreview";
import { ProfanityGraphs } from "./components/ProfanityGraphs";
import {
  AudioWaveform,
  Settings,
  Sparkles,
} from "lucide-react";

export interface AudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  file?: File;
  url?: string;
  transcription?: {
    segments: Array<{
      words: Array<{
        start: number;
        end: number;
        word: string;
      }>;
    }>;
  };
  safetyReport?: Array<{
    word: string;
    start: number;
    end: number;
    is_profane: boolean;
    matched_profanity: string | null;
    matched_profanity_language: string;
  }>;
  expanded?: boolean;
}

export interface ConversionSettings {
  format: string;
  sensorType: "beep" | "silence";
  normalize: boolean;
  compress: boolean;
  compressionLevel: "low" | "medium" | "high" | "extreme";
  metadata: Record<string, string>;
  preset?: string;
}

export default function App() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: "mp4",
    sensorType: "beep",
    normalize: false,
    compress: false,
    compressionLevel: "medium",
    metadata: {},
  });

  const handleFilesAdded = (newFiles: File[]) => {
    const audioFiles: AudioFile[] = newFiles.map(
      (file, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
        file,
      }),
    );
    setFiles([...files, ...audioFiles]);
  };

  const handleUrlAdded = (url: string, filename: string) => {
    const audioFile: AudioFile = {
      id: `${Date.now()}-url`,
      name: filename,
      size: 0,
      type: "audio/unknown",
      status: "pending",
      progress: 0,
      url,
    };
    setFiles([...files, audioFile]);
  };

  const handleStartProcessing = () => {
    // Simulate processing
    files.forEach((file, index) => {
      if (file.status === "pending") {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: "processing" }
                : f,
            ),
          );

          // Simulate progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              
              // Generate sample transcription data when completed
              const sampleTranscription = {
                segments: [
                  {
                    words: [
                      { start: 0.00, end: 0.34, word: " Stop" },
                      { start: 0.34, end: 0.68, word: " the" },
                      { start: 0.68, end: 0.98, word: " damn" },
                      { start: 0.98, end: 1.60, word: " swearing." },
                      { start: 1.60, end: 2.10, word: " This" },
                      { start: 2.10, end: 2.34, word: " shit" },
                      { start: 2.34, end: 2.56, word: " is" },
                      { start: 2.56, end: 3.02, word: " terrible." },
                      { start: 3.02, end: 3.45, word: " Hell" },
                      { start: 3.45, end: 3.68, word: " no!" },
                    ]
                  }
                ]
              };
              
              // Generate sample safety report with some profane words
              const sampleSafetyReport = [
                {
                  word: "Stop",
                  start: 0.00,
                  end: 0.34,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "the",
                  start: 0.34,
                  end: 0.68,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "damn",
                  start: 0.68,
                  end: 0.98,
                  is_profane: true,
                  matched_profanity: "damn",
                  matched_profanity_language: "en",
                },
                {
                  word: "swearing.",
                  start: 0.98,
                  end: 1.60,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "This",
                  start: 1.60,
                  end: 2.10,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "shit",
                  start: 2.10,
                  end: 2.34,
                  is_profane: true,
                  matched_profanity: "shit",
                  matched_profanity_language: "en",
                },
                {
                  word: "is",
                  start: 2.34,
                  end: 2.56,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "terrible.",
                  start: 2.56,
                  end: 3.02,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
                {
                  word: "Hell",
                  start: 3.02,
                  end: 3.45,
                  is_profane: true,
                  matched_profanity: "hell",
                  matched_profanity_language: "en",
                },
                {
                  word: "no!",
                  start: 3.45,
                  end: 3.68,
                  is_profane: false,
                  matched_profanity: null,
                  matched_profanity_language: "",
                },
              ];
              
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? {
                        ...f,
                        status: "completed",
                        progress: 100,
                        transcription: sampleTranscription,
                        safetyReport: sampleSafetyReport,
                      }
                    : f,
                ),
              );
            } else {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? {
                        ...f,
                        progress: Math.min(progress, 100),
                      }
                    : f,
                ),
              );
            }
          }, 300);
        }, index * 500);
      }
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleClearCompleted = () => {
    setFiles(files.filter((f) => f.status !== "completed"));
  };

  const handleToggleExpanded = (id: string) => {
    setFiles(files.map((f) => 
      f.id === id ? { ...f, expanded: !f.expanded } : f
    ));
  };

  const handlePresetSelect = (preset: string) => {
    const presetSettings: Record<
      string,
      Partial<ConversionSettings>
    > = {
      podcast: {
        format: "mp4",
        normalize: true,
      },
      audiobook: {
        format: "mov",
        normalize: true,
      },
      streaming: { format: "mp4" },
      archival: { format: "mkv" },
      "high-quality": { format: "mp4" },
      compressed: {
        format: "avi",
        compress: true,
      },
    };

    if (presetSettings[preset]) {
      setSettings({
        ...settings,
        ...presetSettings[preset],
        preset,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <AudioWaveform className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-slate-100">AI-Driven Video Sanitization</h1>
              <p className="text-slate-400 text-sm">
                Combining OpenAI Whisper with VBW Blacklisting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="convert" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 hidden">
            <TabsTrigger
              value="convert"
              className="data-[state=active]:bg-violet-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Convert Files
            </TabsTrigger>
            <TabsTrigger
              value="download"
              className="data-[state=active]:bg-violet-600"
            >
              <AudioWaveform className="w-4 h-4 mr-2" />
              Download Audio
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className="data-[state=active]:bg-violet-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Batch Process
            </TabsTrigger>
          </TabsList>

          {/* Convert Tab */}
          <TabsContent value="convert" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Upload & Presets */}
              <div className="lg:col-span-2 space-y-6">
                <FileUploadZone
                  onFilesAdded={handleFilesAdded}
                />
                {/* Quick Presets hidden */}
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-6">
                <FormatSelector
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </div>
            </div>

            {/* Processing Queue */}
            {files.length > 0 && (
              <ProcessingQueue
                files={files}
                onStartProcessing={handleStartProcessing}
                onRemoveFile={handleRemoveFile}
                onClearCompleted={handleClearCompleted}
                onToggleExpanded={handleToggleExpanded}
              />
            )}
          </TabsContent>

          {/* Download Tab */}
          <TabsContent value="download">
            <DownloadSection
              settings={settings}
              onSettingsChange={setSettings}
              onUrlAdded={handleUrlAdded}
            />
          </TabsContent>

          {/* Batch Tab */}
          <TabsContent value="batch">
            <BatchProcessor
              settings={settings}
              onSettingsChange={setSettings}
              onFilesAdded={handleFilesAdded}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}