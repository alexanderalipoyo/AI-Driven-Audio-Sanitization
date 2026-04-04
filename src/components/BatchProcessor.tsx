import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { FolderOpen, FileText, Info, Upload } from 'lucide-react';
import type { ConversionSettings } from '../App';
import { FormatSelector } from './FormatSelector';
import { AdvancedSettings } from './AdvancedSettings';

interface BatchProcessorProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  onFilesAdded: (files: File[]) => void;
}

export function BatchProcessor({ settings, onSettingsChange, onFilesAdded }: BatchProcessorProps) {
  const [batchUrls, setBatchUrls] = useState('');
  const [recursive, setRecursive] = useState(false);

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file =>
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.opus', '.aac', '.wma'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );
    if (files.length > 0) {
      onFilesAdded(files);
    }
    e.target.value = '';
  };

  const handleBatchUrlsProcess = () => {
    const urls = batchUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    console.log('Processing batch URLs:', urls);
    setBatchUrls('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Batch Options */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <FolderOpen className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-100">Batch Folder Processing</h3>
                <p className="text-sm text-slate-400">Convert entire folders at once</p>
              </div>
            </div>

            <Alert className="bg-slate-950/50 border-slate-800">
              <Info className="h-4 w-4 text-violet-400" />
              <AlertDescription className="text-slate-400">
                Select a folder to process all audio files within it. Enable recursive mode to include subfolders.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                <div>
                  <Label className="text-slate-300 cursor-pointer">Recursive Processing</Label>
                  <p className="text-xs text-slate-500">Include all subfolders</p>
                </div>
                <Switch checked={recursive} onCheckedChange={setRecursive} />
              </div>

              <label className="block">
                <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl text-center hover:border-slate-600 transition-colors cursor-pointer bg-slate-950/50">
                  <FolderOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 mb-2">Select Folder</p>
                  <p className="text-slate-500 text-sm">
                    {recursive ? 'All files in folder and subfolders' : 'All files in folder'}
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFolderUpload}
                    accept="audio/*,video/*,.mp3,.wav,.flac,.m4a,.ogg,.opus,.aac,.wma"
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Batch URL Processing */}
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-slate-100">Batch URL Download</h3>
                <p className="text-sm text-slate-400">Download multiple URLs at once</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">URLs (one per line)</Label>
              <Textarea
                placeholder="https://www.youtube.com/watch?v=...&#10;https://soundcloud.com/...&#10;https://vimeo.com/..."
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                className="bg-slate-950 border-slate-700 text-slate-200 min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                {batchUrls.split('\n').filter(url => url.trim()).length} URLs entered
              </p>
            </div>

            <Button
              onClick={handleBatchUrlsProcess}
              disabled={!batchUrls.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Process Batch URLs
            </Button>
          </div>
        </Card>

        {/* Batch Processing Tips */}
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="p-6 space-y-3">
            <h4 className="text-slate-100">Batch Processing Features</h4>
            
            <div className="space-y-2">
              {[
                { title: 'Parallel Processing', desc: 'Convert multiple files simultaneously' },
                { title: 'Consistent Settings', desc: 'Same format and quality for all files' },
                { title: 'Progress Tracking', desc: 'Monitor each file individually' },
                { title: 'Auto-Resume', desc: 'Continue from interruptions' },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-2" />
                  <div>
                    <p className="text-slate-200 text-sm">{feature.title}</p>
                    <p className="text-slate-500 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Settings */}
      <div className="space-y-6">
        <FormatSelector settings={settings} onSettingsChange={onSettingsChange} />
        <AdvancedSettings settings={settings} onSettingsChange={onSettingsChange} />
      </div>
    </div>
  );
}
