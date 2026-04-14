import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Pause, Play, Square, Trash2, Upload } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { toast } from "sonner";

interface VoiceRecorderPanelProps {
  onRecordingReady: (file: File) => void;
}

const NEVER_ALLOW_KEY = "voice-record-mic-choice";

type PermissionChoice = "undecided" | "allow-session" | "never";

export function VoiceRecorderPanel({ onRecordingReady }: VoiceRecorderPanelProps) {
  const [permissionChoice, setPermissionChoice] = useState<PermissionChoice>(() => {
    if (typeof window === "undefined") {
      return "undecided";
    }
    return localStorage.getItem(NEVER_ALLOW_KEY) === "never" ? "never" : "undecided";
  });
  const [isCheckingDevices, setIsCheckingDevices] = useState(true);
  const [noMicrophoneFound, setNoMicrophoneFound] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const accumulatedDurationMsRef = useRef(0);
  const activeSegmentStartMsRef = useRef<number | null>(null);

  const recordingMimeType = useMemo(() => {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
      return "audio/webm";
    }

    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      return "audio/webm";
    }
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      return "audio/mp4";
    }
    return "";
  }, []);

  const formatRecordingTime = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const clearWaveformLoop = () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const clearRecordingTimer = () => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const teardownAudioVisualization = () => {
    clearWaveformLoop();
    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const drawWaveform = () => {
    const analyser = analyserRef.current;
    const canvas = waveformCanvasRef.current;

    if (!analyser || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    const nextWidth = Math.floor(width * dpr);
    const nextHeight = Math.floor(height * dpr);
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const frequencyBins = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBins);
    analyser.getByteFrequencyData(frequencyData);

    const timeDomainData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeDomainData);

    const centerY = height / 2;
    const barGap = 1.5;
    const barWidth = 3;
    const barCount = Math.max(40, Math.floor(width / (barWidth + barGap)));

    context.clearRect(0, 0, width, height);

    const backgroundGradient = context.createLinearGradient(0, 0, 0, height);
    backgroundGradient.addColorStop(0, "rgba(7, 13, 28, 0.95)");
    backgroundGradient.addColorStop(0.5, "rgba(4, 11, 25, 0.95)");
    backgroundGradient.addColorStop(1, "rgba(2, 8, 20, 0.98)");
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(34, 211, 238, 0.26)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(width, centerY);
    context.stroke();

    const barGradient = context.createLinearGradient(0, 0, 0, height);
    barGradient.addColorStop(0, "#67e8f9");
    barGradient.addColorStop(0.5, "#22d3ee");
    barGradient.addColorStop(1, "#0e7490");

    context.shadowColor = "rgba(34, 211, 238, 0.55)";
    context.shadowBlur = 10;
    context.fillStyle = barGradient;

    for (let i = 0; i < barCount; i += 1) {
      const binStart = Math.floor((i / barCount) * frequencyBins);
      const binEnd = Math.floor(((i + 1) / barCount) * frequencyBins);
      let sum = 0;

      for (let j = binStart; j < binEnd; j += 1) {
        sum += frequencyData[j];
      }

      const avg = sum / Math.max(1, binEnd - binStart);
      const normalized = avg / 255;
      const minHalfHeight = 3;
      const maxHalfHeight = (height * 0.42);
      const halfHeight = minHalfHeight + normalized * (maxHalfHeight - minHalfHeight);
      const x = i * (barWidth + barGap);

      context.fillRect(x, centerY - halfHeight, barWidth, halfHeight);
      context.fillRect(x, centerY, barWidth, halfHeight);
    }

    context.shadowBlur = 0;

    // Overlay a flowing time-domain wave so motion comes from the waveform, not a moving marker.
    const waveGradient = context.createLinearGradient(0, 0, width, 0);
    waveGradient.addColorStop(0, "rgba(186, 230, 253, 0.22)");
    waveGradient.addColorStop(0.5, "rgba(125, 211, 252, 0.7)");
    waveGradient.addColorStop(1, "rgba(186, 230, 253, 0.22)");
    context.strokeStyle = waveGradient;
    context.lineWidth = 2.4;
    context.beginPath();

    const pointCount = Math.min(timeDomainData.length, Math.max(120, Math.floor(width)));
    for (let i = 0; i < pointCount; i += 1) {
      const sampleIndex = Math.floor((i / pointCount) * timeDomainData.length);
      const normalized = (timeDomainData[sampleIndex] - 128) / 128;
      const x = (i / (pointCount - 1)) * width;
      const y = centerY + normalized * (height * 0.28);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();

    animationFrameRef.current = window.requestAnimationFrame(drawWaveform);
  };

  const startWaveformLoop = () => {
    clearWaveformLoop();
    animationFrameRef.current = window.requestAnimationFrame(drawWaveform);
  };

  useEffect(() => {
    const checkMicrophoneAvailability = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setNoMicrophoneFound(true);
        setIsCheckingDevices(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some((device) => device.kind === "audioinput");
        setNoMicrophoneFound(!hasMic);
      } catch {
        // If enumeration fails, keep the recorder available and handle errors on access.
        setNoMicrophoneFound(false);
      } finally {
        setIsCheckingDevices(false);
      }
    };

    void checkMicrophoneAvailability();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      clearRecordingTimer();
      teardownAudioVisualization();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [previewUrl]);

  const startRecording = async () => {
    if (permissionChoice === "never") {
      toast.error("Microphone access is blocked by your selection.");
      return;
    }

    if (permissionChoice !== "allow-session") {
      toast.error("Allow microphone access first.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setNoMicrophoneFound(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setIsPaused(false);
      accumulatedDurationMsRef.current = 0;
      activeSegmentStartMsRef.current = Date.now();
      setRecordingElapsedMs(0);

      clearRecordingTimer();
      timerIntervalRef.current = window.setInterval(() => {
        const runningSegmentMs = activeSegmentStartMsRef.current
          ? Date.now() - activeSegmentStartMsRef.current
          : 0;
        setRecordingElapsedMs(accumulatedDurationMsRef.current + runningSegmentMs);
      }, 200);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const audioContext = new AudioCtx();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        const sourceNode = audioContext.createMediaStreamSource(stream);
        sourceNode.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        startWaveformLoop();
      }

      const recorder = new MediaRecorder(
        stream,
        recordingMimeType ? { mimeType: recordingMimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (activeSegmentStartMsRef.current) {
          accumulatedDurationMsRef.current += Date.now() - activeSegmentStartMsRef.current;
          activeSegmentStartMsRef.current = null;
        }

        clearRecordingTimer();
        setRecordingElapsedMs(accumulatedDurationMsRef.current);

        const type = recordingMimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `voice-recording-${Date.now()}.${extension}`, { type });

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        const nextPreviewUrl = URL.createObjectURL(blob);
        setPreviewUrl(nextPreviewUrl);
        setRecordedFile(file);

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        teardownAudioVisualization();
        setIsPaused(false);
        setIsRecording(false);
      };

      recorder.start();
      setPermissionChoice("allow-session");
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      const err = error as DOMException;

      if (err?.name === "NotFoundError") {
        setNoMicrophoneFound(true);
      }

      if (err?.name === "NotAllowedError") {
        toast.error("Microphone permission was denied by the browser.");
      } else {
        toast.error("Unable to start recording.");
      }
    }
  };

  const allowMicrophoneForSession = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNoMicrophoneFound(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionChoice("allow-session");
      toast.success("Microphone access allowed for this session.");
    } catch (error) {
      const err = error as DOMException;

      if (err?.name === "NotFoundError") {
        setNoMicrophoneFound(true);
        return;
      }

      if (err?.name === "NotAllowedError") {
        toast.error("Microphone permission was denied by the browser.");
      } else {
        toast.error("Unable to request microphone permission.");
      }
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }
    mediaRecorderRef.current.stop();
  };

  const togglePauseRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      return;
    }

    if (recorder.state === "recording") {
      recorder.pause();

      if (activeSegmentStartMsRef.current) {
        accumulatedDurationMsRef.current += Date.now() - activeSegmentStartMsRef.current;
        activeSegmentStartMsRef.current = null;
      }

      setRecordingElapsedMs(accumulatedDurationMsRef.current);
      setIsPaused(true);
      clearWaveformLoop();
      return;
    }

    if (recorder.state === "paused") {
      recorder.resume();
      activeSegmentStartMsRef.current = Date.now();
      setIsPaused(false);
      startWaveformLoop();
    }
  };

  const setNeverAllow = () => {
    localStorage.setItem(NEVER_ALLOW_KEY, "never");
    setPermissionChoice("never");

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearRecordingTimer();
    teardownAudioVisualization();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsPaused(false);
    activeSegmentStartMsRef.current = null;
    accumulatedDurationMsRef.current = 0;
    setRecordingElapsedMs(0);
  };

  const resetPermissionChoice = () => {
    localStorage.removeItem(NEVER_ALLOW_KEY);
    setPermissionChoice("undecided");
    toast.success("Microphone permission choice reset.");
  };

  const clearRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordedFile(null);
  };

  const addRecordingToQueue = () => {
    if (!recordedFile) {
      return;
    }
    onRecordingReady(recordedFile);
    toast.success("Recording added to queue");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="space-y-5 border-slate-800 bg-slate-900/70 p-6 lg:col-span-2">
        <div className="space-y-1">
          <h3 className="text-slate-100">Voice record</h3>
          <p className="text-sm text-slate-400">
            Record straight from your microphone and send the clip to the sanitizer queue.
          </p>
        </div>

        {isCheckingDevices ? (
          <p className="text-sm text-slate-400">Detecting microphone...</p>
        ) : noMicrophoneFound ? (
          <Alert className="border-amber-600/50 bg-amber-950/30 text-amber-200">
            <MicOff className="h-4 w-4" />
            <AlertTitle>Microphone unavailable</AlertTitle>
            <AlertDescription>No microphone found. Audio recording is unavailable.</AlertDescription>
          </Alert>
        ) : (
          <>
            {permissionChoice === "undecided" && (
              <Alert className="border-cyan-500/40 bg-cyan-950/20 text-cyan-100">
                <Mic className="h-4 w-4" />
                <AlertTitle className="text-center">Microphone permission</AlertTitle>
                <AlertDescription className="mt-2 flex flex-wrap justify-center gap-2 text-center">
                  <Button type="button" onClick={allowMicrophoneForSession} className="bg-cyan-600 hover:bg-cyan-500">
                    Allow this time
                  </Button>
                  <Button type="button" variant="outline" onClick={setNeverAllow}>
                    Never allow
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {permissionChoice === "never" ? (
              <Alert className="border-rose-500/40 bg-rose-950/20 text-rose-100">
                <MicOff className="h-4 w-4" />
                <AlertTitle className="text-center">Microphone access blocked</AlertTitle>
                <AlertDescription className="mt-3 flex flex-col items-center gap-3 text-center">
                  <p className="max-w-md">You selected "Never allow" for this site session.</p>
                  <div className="w-full flex justify-center">
                    <Button type="button" variant="outline" onClick={resetPermissionChoice} className="min-w-44">
                      Change permission
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : permissionChoice === "allow-session" ? (
              <div className="space-y-3">
                {!isRecording ? (
                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      onClick={startRecording}
                      className="h-14 w-14 rounded-full bg-violet-600 p-0 hover:bg-violet-500"
                      aria-label="Start recording"
                      title="Start recording"
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-200">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-100">
                        {isPaused ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </span>
                      <span>{isPaused ? "Paused" : "Recording"}</span>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-cyan-500/25 bg-slate-950/80 p-1">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_62%)]" />
                      <canvas
                        ref={waveformCanvasRef}
                        className="relative h-32 w-full rounded-lg border border-slate-800/80"
                        aria-label="Live recording waveform"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button
                        type="button"
                        onClick={togglePauseRecording}
                        variant="outline"
                        className="border-cyan-400/70 bg-cyan-500/10 font-semibold text-cyan-100 hover:bg-cyan-500/20 hover:text-white"
                      >
                        {isPaused ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        onClick={stopRecording}
                        className="bg-rose-600 font-semibold text-white shadow-sm shadow-rose-900/50 hover:bg-rose-500"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                        <span className="ml-2 rounded-full bg-rose-950/55 px-2 py-0.5 font-mono text-rose-100">
                          {formatRecordingTime(recordingElapsedMs)}
                        </span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {previewUrl && (
              <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-sm text-slate-300">Recording preview</p>
                <audio controls src={previewUrl} className="w-full" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={addRecordingToQueue} className="bg-emerald-600 hover:bg-emerald-500">
                    <Upload className="mr-2 h-4 w-4" />
                    Add to queue
                  </Button>
                  <Button type="button" variant="outline" onClick={clearRecording}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Card className="space-y-3 border-slate-800 bg-slate-900/70 p-6">
        <h4 className="text-slate-100">Permission options</h4>
        <p className="text-sm text-slate-400">
          Allow this time requests browser access once for recording.
        </p>
        <p className="text-sm text-slate-400">
          Never allow saves your choice locally and blocks recording in this app.
        </p>
      </Card>
    </div>
  );
}
