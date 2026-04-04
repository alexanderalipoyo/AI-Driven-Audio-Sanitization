import { Card } from './ui/card';
import { Mic, BookOpen, Radio, Archive, Music, Shrink } from 'lucide-react';

interface PresetCardsProps {
  onPresetSelect: (preset: string) => void;
  selectedPreset?: string;
}

const presets = [
  {
    id: 'podcast',
    name: 'Podcast',
    icon: Mic,
    description: 'MP3 128kbps, normalized',
    specs: 'Optimized for voice content',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'audiobook',
    name: 'Audiobook',
    icon: BookOpen,
    description: 'M4A 64kbps, normalized',
    specs: 'Small size, clear speech',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'streaming',
    name: 'Streaming',
    icon: Radio,
    description: 'Opus 128kbps',
    specs: 'Modern codec, efficient',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'archival',
    name: 'Archival',
    icon: Archive,
    description: 'FLAC lossless',
    specs: 'Perfect preservation',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'high-quality',
    name: 'High Quality',
    icon: Music,
    description: 'MP3 320kbps',
    specs: 'Near-CD quality',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'compressed',
    name: 'Compressed',
    icon: Shrink,
    description: 'Opus 96kbps',
    specs: 'Maximum compression',
    color: 'from-red-500 to-rose-500',
  },
];

export function PresetCards({ onPresetSelect, selectedPreset }: PresetCardsProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <div className="p-6">
        <h3 className="text-slate-100 mb-4">Quick Presets</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id;
            
            return (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset.id)}
                className={`
                  relative p-4 rounded-xl text-left transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-br ' + preset.color + ' shadow-lg scale-105' 
                    : 'bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-white/20' : 'bg-slate-800'}
                  `}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {preset.name}
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {preset.description}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-slate-600'}`}>
                      {preset.specs}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
