import { Card } from './ui/card';
import { Video, Eye, EyeOff } from 'lucide-react';
import type { AudioFile } from '../App';

interface VideoPreviewProps {
  file: AudioFile;
  isCensored?: boolean;
}

export function VideoPreview({ file, isCensored = false }: VideoPreviewProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {isCensored ? (
          <>
            <EyeOff className="w-4 h-4 text-violet-400" />
            <h4 className="text-slate-200 text-sm font-medium">Censored Video Preview</h4>
            <span className="ml-auto text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Safe for viewing
            </span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 text-violet-400" />
            <h4 className="text-slate-200 text-sm font-medium">Uncensored Video Preview</h4>
            <span className="ml-auto text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Original content
            </span>
          </>
        )}
      </div>
      
      <div className="bg-slate-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center space-y-3">
          <Video className="w-16 h-16 text-slate-700 mx-auto" />
          <div>
            <p className="text-slate-400 text-sm">
              {isCensored ? 'Censored' : 'Original'} video preview
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {file.name}
            </p>
          </div>
          {isCensored && (
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Profane content has been replaced with {file.file ? 'beep sound' : 'silence'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}