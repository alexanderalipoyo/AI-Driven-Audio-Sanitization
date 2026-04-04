import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, X, Download, Trash2, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { AudioFile } from '../App';
import { WordSafetyReport } from './WordSafetyReport';
import { VideoPreview } from './VideoPreview';
import { ProfanityGraphs } from './ProfanityGraphs';

interface ProcessingQueueProps {
  files: AudioFile[];
  onStartProcessing: () => void;
  onRemoveFile: (id: string) => void;
  onClearCompleted: () => void;
  onToggleExpanded: (id: string) => void;
  onDownloadFile: (id: string) => void;
}

export function ProcessingQueue({ 
  files, 
  onStartProcessing, 
  onRemoveFile,
  onClearCompleted,
  onToggleExpanded,
  onDownloadFile,
}: ProcessingQueueProps) {
  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasCompletedFiles = files.some(f => f.status === 'completed');
  const isProcessing = files.some(f => f.status === 'processing');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-100">Processing Queue ({files.length})</h3>
          <div className="flex gap-2">
            {hasCompletedFiles && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Completed
              </Button>
            )}
            {hasPendingFiles && !isProcessing && (
              <Button
                size="sm"
                onClick={onStartProcessing}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Processing
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg bg-slate-950/50 border border-slate-800 overflow-hidden"
            >
              {/* Main File Card */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {file.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-500" />
                      </div>
                    )}
                    {file.status === 'processing' && (
                      <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    )}
                    {file.status === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)} • {file.status}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {file.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onToggleExpanded(file.id)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              {file.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDownloadFile(file.id)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveFile(file.id)}
                          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(file.status === 'processing' || file.status === 'completed') && (
                      <div className="space-y-1">
                        <Progress 
                          value={file.progress} 
                          className="h-1.5 bg-slate-800"
                        />
                        <p className="text-xs text-slate-500">
                          {Math.round(file.progress)}% complete
                        </p>
                      </div>
                    )}

                    {file.errorMessage && (
                      <p className="text-xs text-red-400 mt-2">{file.errorMessage}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Analysis Widgets */}
              {file.status === 'completed' && file.expanded && (
                <div className="border-t border-slate-800 bg-slate-950/80">
                  <div className="p-4 space-y-4">
                    {/* Word Safety Report */}
                    {file.safetyReport && (
                      <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 overflow-hidden">
                        <WordSafetyReport file={file} />
                      </div>
                    )}

                    {/* Uncensored Video Preview */}
                    <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 overflow-hidden">
                      <VideoPreview file={file} isCensored={false} />
                    </div>

                    {/* Censored Video Preview */}
                    <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 overflow-hidden">
                      <VideoPreview file={file} isCensored={true} />
                    </div>

                    {/* Profanity Analytics Dashboard */}
                    {file.safetyReport && (
                      <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 overflow-hidden">
                        <ProfanityGraphs file={file} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
