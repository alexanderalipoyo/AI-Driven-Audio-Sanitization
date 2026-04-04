import type { AudioFile } from '../App';

interface WordTimestampsProps {
  file: AudioFile;
}

export function WordTimestamps({ file }: WordTimestampsProps) {
  if (!file.transcription) {
    return null;
  }

  const allWords = file.transcription.segments.flatMap(segment => segment.words);

  return (
    <div className="flex flex-wrap gap-2">
      {allWords.map((word, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 text-xs"
        >
          <span className="text-slate-500 font-mono">
            [{word.start.toFixed(2)}s → {word.end.toFixed(2)}s]
          </span>
          <span className="text-slate-300">{word.word}</span>
        </span>
      ))}
    </div>
  );
}