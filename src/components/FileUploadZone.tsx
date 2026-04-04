import { useCallback, useState } from "react";
import { Card } from "./ui/card";
import { Upload, File, X } from "lucide-react";

interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function FileUploadZone({
  onFilesAdded,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(
        e.dataTransfer.files,
      ).filter(
        (file) =>
          file.type.startsWith("audio/") ||
          file.type.startsWith("video/") ||
          [
            ".mp3",
            ".wav",
            ".flac",
            ".m4a",
            ".ogg",
            ".opus",
            ".aac",
            ".wma",
          ].some((ext) =>
            file.name.toLowerCase().endsWith(ext),
          ),
      );

      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles);
      }
    },
    [onFilesAdded],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onFilesAdded(selectedFiles);
      }
      e.target.value = "";
    },
    [onFilesAdded],
  );

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <div className="p-6">
        <h3 className="text-slate-100 mb-4">
          Upload Media Files
        </h3>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all
            ${
              isDragging
                ? "border-violet-500 bg-violet-500/10"
                : "border-slate-700 bg-slate-950/50 hover:border-slate-600"
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
              p-4 rounded-full transition-colors
              ${isDragging ? "bg-violet-500/20" : "bg-slate-800"}
            `}
            >
              <Upload
                className={`w-8 h-8 ${isDragging ? "text-violet-400" : "text-slate-400"}`}
              />
            </div>

            <div>
              <p className="text-slate-300 mb-2">
                Drag and drop media files here
              </p>
              <p className="text-slate-500 text-sm">
                or click to browse
              </p>
            </div>

            <label className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer transition-colors">
              Choose Files
              <input
                type="file"
                multiple
                accept="audio/*,video/*,.mp3,.wav,.flac,.m4a,.ogg,.opus,.aac,.wma"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>

            <p className="text-slate-600 text-xs">
              Supports: mp4 ,avi ,mov ,mkv
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}