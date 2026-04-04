import { type ChangeEvent, type DragEvent, useCallback, useState } from "react";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

const SUPPORTED_EXTENSIONS = [
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".mp3",
  ".wav",
  ".flac",
  ".m4a",
  ".ogg",
  ".opus",
  ".aac",
  ".wma",
];

function isSupportedMediaFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/") ||
    SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  );
}

function partitionFiles(files: File[]) {
  const supportedFiles: File[] = [];
  const unsupportedFiles: File[] = [];

  files.forEach((file) => {
    if (isSupportedMediaFile(file)) {
      supportedFiles.push(file);
      return;
    }
    unsupportedFiles.push(file);
  });

  return { supportedFiles, unsupportedFiles };
}

export function FileUploadZone({
  onFilesAdded,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleValidatedFiles = useCallback(
    (files: File[]) => {
      const { supportedFiles, unsupportedFiles } = partitionFiles(files);

      if (unsupportedFiles.length > 0) {
        const rejectedNames = unsupportedFiles.map((file) => file.name).join(", ");
        toast.error("Unsupported file format", {
          description: `These files were skipped: ${rejectedNames}`,
        });
      }

      if (supportedFiles.length > 0) {
        onFilesAdded(supportedFiles);
      }
    },
    [onFilesAdded],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleValidatedFiles(droppedFiles);
    },
    [handleValidatedFiles],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        handleValidatedFiles(selectedFiles);
      }
      e.target.value = "";
    },
    [handleValidatedFiles],
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
              Supports: mp4, avi, mov, mkv, mp3, wav, flac, m4a, ogg, opus, aac, wma
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}