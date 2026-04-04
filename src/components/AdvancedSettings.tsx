import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Volume2, Minimize2, Tag } from 'lucide-react';
import { useState } from 'react';
import type { ConversionSettings } from '../App';
import { Input } from './ui/input';

interface AdvancedSettingsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

export function AdvancedSettings({ settings, onSettingsChange }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <div className="p-6 space-y-4">
        <h3 className="text-slate-100">Advanced Options</h3>

        {/* Normalize */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <div>
              <Label className="text-slate-300 cursor-pointer">Normalize Audio</Label>
              <p className="text-xs text-slate-500">Equalize volume levels</p>
            </div>
          </div>
          <Switch
            checked={settings.normalize}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, normalize: checked })
            }
          />
        </div>

        {/* Compress */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-3">
            <Minimize2 className="w-4 h-4 text-violet-400" />
            <div>
              <Label className="text-slate-300 cursor-pointer">Enable Compression</Label>
              <p className="text-xs text-slate-500">Reduce file size</p>
            </div>
          </div>
          <Switch
            checked={settings.compress}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, compress: checked })
            }
          />
        </div>

        {/* Compression Level */}
        {settings.compress && (
          <div className="space-y-2 pl-7">
            <Label className="text-slate-300">Compression Level</Label>
            <Select
              value={settings.compressionLevel}
              onValueChange={(value: 'low' | 'medium' | 'high' | 'extreme') => 
                onSettingsChange({ ...settings, compressionLevel: value })
              }
            >
              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="low" className="text-slate-200 focus:bg-slate-800">
                  Low - Minimal quality loss
                </SelectItem>
                <SelectItem value="medium" className="text-slate-200 focus:bg-slate-800">
                  Medium - Balanced
                </SelectItem>
                <SelectItem value="high" className="text-slate-200 focus:bg-slate-800">
                  High - Smaller files
                </SelectItem>
                <SelectItem value="extreme" className="text-slate-200 focus:bg-slate-800">
                  Extreme - Maximum compression
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Metadata Editor */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-violet-400" />
                <div className="text-left">
                  <Label className="text-slate-300 cursor-pointer">Edit Metadata</Label>
                  <p className="text-xs text-slate-500">Add title, artist, album, etc.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-3 pl-7">
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs">Title</Label>
              <Input
                placeholder="Track title"
                className="bg-slate-950 border-slate-700 text-slate-200"
                value={settings.metadata.title || ''}
                onChange={(e) => 
                  onSettingsChange({ 
                    ...settings, 
                    metadata: { ...settings.metadata, title: e.target.value }
                  })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs">Artist</Label>
              <Input
                placeholder="Artist name"
                className="bg-slate-950 border-slate-700 text-slate-200"
                value={settings.metadata.artist || ''}
                onChange={(e) => 
                  onSettingsChange({ 
                    ...settings, 
                    metadata: { ...settings.metadata, artist: e.target.value }
                  })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs">Album</Label>
              <Input
                placeholder="Album name"
                className="bg-slate-950 border-slate-700 text-slate-200"
                value={settings.metadata.album || ''}
                onChange={(e) => 
                  onSettingsChange({ 
                    ...settings, 
                    metadata: { ...settings.metadata, album: e.target.value }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs">Year</Label>
              <Input
                placeholder="2025"
                className="bg-slate-950 border-slate-700 text-slate-200"
                value={settings.metadata.year || ''}
                onChange={(e) => 
                  onSettingsChange({ 
                    ...settings, 
                    metadata: { ...settings.metadata, year: e.target.value }
                  })
                }
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
