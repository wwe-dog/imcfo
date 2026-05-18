import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import AppIcon from "./AppIcon";
import {
  recognizeTransactionDraft,
  type CandidateTransactionDraft,
} from "../services/recordRecognitionService";
import { transcribeAudio } from "../services/speechTranscriptionService";

type RecordingScreenProps = {
  onCancel: () => void;
  onDraftReady: (draft: CandidateTransactionDraft, transcriptionText: string) => void;
};

const maxVoiceDurationMs = 30_000;

const voiceRecordingOptions: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  bitRate: 64_000,
  isMeteringEnabled: true,
  numberOfChannels: 1,
  sampleRate: 16_000,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    sampleRate: 16_000,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    sampleRate: 16_000,
  },
  web: {
    bitsPerSecond: 64_000,
    mimeType: "audio/webm",
  },
};

const waveBaseHeights = [16, 24, 12, 32, 20, 35, 22, 28, 14, 26, 18];

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
};

export function RecordingScreen({ onCancel, onDraftReady }: RecordingScreenProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useRef(new RNAnimated.Value(screenHeight)).current;
  const recorder = useAudioRecorder(voiceRecordingOptions);
  const recordingStartedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStoppingRef = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusLabel, setStatusLabel] = useState("正在聆听...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    timerRef.current = null;
    maxTimerRef.current = null;
  };

  const closeAfterAnimation = (afterClose: () => void) => {
    RNAnimated.spring(translateY, {
      damping: 20,
      stiffness: 180,
      toValue: screenHeight,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) afterClose();
    });
  };

  const stopAudioMode = async () => {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  };

  const cancelRecording = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    stopTimers();
    try {
      await recorder.stop();
    } catch {
      // Recorder can already be stopped when permission/start failed.
    }
    try {
      await stopAudioMode();
    } catch {
      // Audio mode reset is best effort on cancellation.
    }
    closeAfterAnimation(onCancel);
  };

  const finishRecording = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    stopTimers();
    setStatusLabel("正在识别...");

    const measuredDurationMs = recordingStartedAtRef.current
      ? Date.now() - recordingStartedAtRef.current
      : elapsedSeconds * 1000;

    try {
      await recorder.stop();
      await stopAudioMode();
      const recordingUri = recorder.uri;
      if (!recordingUri) {
        throw new Error("没有获取到录音文件，请重试。");
      }

      const transcription = await transcribeAudio({
        durationMs: Math.max(650, measuredDurationMs),
        uri: recordingUri,
      });
      const draft = await recognizeTransactionDraft(transcription.text);
      closeAfterAnimation(() => onDraftReady(draft, transcription.text));
    } catch (error) {
      isStoppingRef.current = false;
      const message =
        error instanceof Error ? error.message : "录音识别失败，请重试。";
      setErrorMessage(message);
      setStatusLabel("识别失败");
    }
  };

  useEffect(() => {
    RNAnimated.spring(translateY, {
      damping: 20,
      stiffness: 180,
      toValue: 0,
      useNativeDriver: true,
    }).start();

    const startRecording = async () => {
      try {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          throw new Error("需要麦克风权限才能录音。");
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });

        await recorder.prepareToRecordAsync(voiceRecordingOptions);
        recordingStartedAtRef.current = Date.now();
        recorder.record();
        timerRef.current = setInterval(() => {
          if (!recordingStartedAtRef.current) return;
          setElapsedSeconds(
            Math.floor((Date.now() - recordingStartedAtRef.current) / 1000),
          );
        }, 1000);
        maxTimerRef.current = setTimeout(() => {
          void finishRecording();
        }, maxVoiceDurationMs);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "录音启动失败，请重试。";
        setErrorMessage(message);
        setStatusLabel("录音不可用");
      }
    };

    void startRecording();

    return () => {
      stopTimers();
    };
    // recorder is intentionally stable for this mounted overlay instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandText = useMemo(
    () => (
      <Svg height={48} width={180}>
        <Defs>
          <LinearGradient id="wordmarkGradient" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0%" stopColor="#FF5DBB" />
            <Stop offset="42%" stopColor="#8A5CFF" />
            <Stop offset="72%" stopColor="#3B8BFF" />
            <Stop offset="100%" stopColor="#00D2D9" />
          </LinearGradient>
        </Defs>
        <SvgText
          fill="url(#wordmarkGradient)"
          fontSize={30}
          fontWeight="700"
          letterSpacing={8}
          x={90}
          y={34}
          textAnchor="middle"
        >
          IMCFO
        </SvgText>
      </Svg>
    ),
    [],
  );

  return (
    <RNAnimated.View
      style={[
        styles.screen,
        {
          paddingBottom: Math.max(insets.bottom, 18),
          paddingTop: Math.max(insets.top, 12),
          transform: [{ translateY }],
        },
      ]}
    >
      <View pointerEvents="none" style={styles.topBlob} />
      <View pointerEvents="none" style={styles.bottomBlob} />

      <View style={styles.wordmark}>{brandText}</View>
      <Text style={styles.statusLabel}>{statusLabel}</Text>

      <View style={styles.centerPanel}>
        <View style={styles.waveform}>
          {waveBaseHeights.map((height, index) => (
            <WaveformBar baseHeight={height} index={index} key={index} />
          ))}
        </View>
        <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>
        <Text style={styles.hint}>松手结束录音</Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={cancelRecording} style={styles.cancelButton}>
          <Text style={styles.cancelText}>取消</Text>
        </Pressable>
        <Pressable onPress={finishRecording} style={styles.doneButton}>
          <Text style={styles.doneText}>完成录音</Text>
        </Pressable>
      </View>
    </RNAnimated.View>
  );
}

function WaveformBar({ baseHeight, index }: { baseHeight: number; index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 100,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420 }),
          withTiming(0, { duration: 520 }),
        ),
        -1,
        true,
      ),
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [baseHeight, 35]),
  }));

  return (
    <Animated.View style={[styles.waveClip, animatedStyle]}>
      <Svg height={35} width={3}>
        <Defs>
          <LinearGradient id={`waveGradient-${index}`} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#00D2D9" />
            <Stop offset="100%" stopColor="#8A5CFF" />
          </LinearGradient>
        </Defs>
        <Rect
          fill={`url(#waveGradient-${index})`}
          height={35}
          rx={1.5}
          width={3}
          x={0}
          y={0}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#090C1D",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 100,
  },
  topBlob: {
    backgroundColor: "rgba(0,210,217,0.50)",
    borderRadius: 120,
    height: 240,
    left: -96,
    opacity: 0.5,
    position: "absolute",
    shadowColor: "#00D2D9",
    shadowOpacity: 0.7,
    shadowRadius: 50,
    top: 40,
    width: 240,
  },
  bottomBlob: {
    backgroundColor: "rgba(255,93,187,0.50)",
    borderRadius: 106,
    bottom: 80,
    height: 211,
    opacity: 0.45,
    position: "absolute",
    right: -86,
    shadowColor: "#FF5DBB",
    shadowOpacity: 0.68,
    shadowRadius: 50,
    width: 211,
  },
  wordmark: {
    alignItems: "center",
    marginTop: 16,
  },
  statusLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  centerPanel: {
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    height: 44,
    justifyContent: "center",
  },
  waveClip: {
    alignItems: "center",
    borderRadius: 2,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 3,
  },
  timer: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    marginTop: 24,
  },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    marginTop: 8,
  },
  errorText: {
    color: "#f87171",
    fontSize: 11,
    marginTop: 14,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    borderWidth: 0.5,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  cancelText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: "#8A5CFF",
    borderRadius: 999,
    flex: 2,
    justifyContent: "center",
    minHeight: 48,
    shadowColor: "#8A5CFF",
    shadowOpacity: 0.32,
    shadowRadius: 16,
  },
  doneText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "500",
  },
});
