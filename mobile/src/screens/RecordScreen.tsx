import { useEffect, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from "expo-audio";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import AppIcon from "../components/AppIcon";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability } from "../domain/models";
import { SpeechTranscriptionError, transcribeAudio } from "../services/speechTranscriptionService";

interface RecordScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  onSave: (input: TransactionInput) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onOpenAssets: () => void;
  onOpenTransactions: () => void;
}

type VoiceInputState = "idle" | "recording" | "transcribing" | "result" | "error";

const maxVoiceDurationMs = 30_000;
const samplePhrases = ["今天午餐 32 元，用支付宝", "工资到账 5800", "信用卡还款 2000"];
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

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.min(30, Math.floor(durationMs / 1000)));
  return `00:${String(totalSeconds).padStart(2, "0")}`;
};

const getStatusText = (state: VoiceInputState): string => {
  switch (state) {
    case "recording":
      return "正在聆听...";
    case "transcribing":
      return "正在转写...";
    case "result":
      return "转写完成";
    case "error":
      return "转写失败";
    case "idle":
    default:
      return "点击开始说话";
  }
};

export default function RecordScreen(_props: RecordScreenProps) {
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [recordingTick, setRecordingTick] = useState(0);
  const audioRecorder = useAudioRecorder(voiceRecordingOptions);
  const pulseProgress = useRef(new Animated.Value(0)).current;
  const voiceStateRef = useRef<VoiceInputState>("idle");
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartedAtRef = useRef(0);
  const isStoppingRef = useRef(false);
  const audioRecorderRef = useRef(audioRecorder);

  audioRecorderRef.current = audioRecorder;

  const isWorking = voiceState === "recording" || voiceState === "transcribing";
  const shownDurationMs =
    voiceState === "recording"
      ? Math.min((recordingTick || Date.now()) - recordingStartedAtRef.current, maxVoiceDurationMs)
      : lastDurationMs;
  const statusText = getStatusText(voiceState);
  const pulseScale = pulseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.18],
  });
  const pulseOpacity = pulseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.16, 0.62],
  });
  const micScale = pulseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.045],
  });
  const waveScale = pulseProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 1],
  });

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    if (voiceState !== "recording") return undefined;

    const timer = setInterval(() => {
      setRecordingTick(Date.now());
    }, 250);

    return () => clearInterval(timer);
  }, [voiceState]);

  useEffect(() => {
    if (!isWorking) {
      pulseProgress.stopAnimation();
      pulseProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseProgress, {
          duration: voiceState === "recording" ? 760 : 1200,
          easing: Easing.inOut(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulseProgress, {
          duration: voiceState === "recording" ? 760 : 1200,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isWorking, pulseProgress, voiceState]);

  useEffect(
    () => () => {
      clearRecordingTimeout();
      const recorder = audioRecorderRef.current;
      if (voiceStateRef.current === "recording") {
        void recorder.stop().catch(() => undefined);
      }
    },
    [],
  );

  const clearRecordingTimeout = () => {
    if (!recordingTimeoutRef.current) return;
    clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
  };

  const setState = (nextState: VoiceInputState) => {
    voiceStateRef.current = nextState;
    setVoiceState(nextState);
  };

  const resetVoiceInput = () => {
    clearRecordingTimeout();
    setState("idle");
    setTranscriptionText("");
    setErrorMessage("");
    setInfoMessage("");
    setLastDurationMs(0);
    setRecordingTick(0);
    recordingStartedAtRef.current = 0;
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof SpeechTranscriptionError) {
      switch (error.code) {
        case "CONFIG_MISSING":
          return "未配置 ASR endpoint，请检查 mobile/.env。";
        case "AUDIO_TOO_SHORT":
          return "音频过短，请至少说一句完整内容。";
        case "AUDIO_TOO_LARGE":
          return "音频过大，请缩短后重试。";
        case "NETWORK_ERROR":
          return "网络请求失败，请稍后重试。";
        case "ASR_EMPTY_RESULT":
          return "转写失败：没有识别到有效内容，请重新录音。";
        case "ASR_PROVIDER_ERROR":
          return `云函数返回错误：${error.message}`;
        default:
          return "转写失败，请重新录音。";
      }
    }

    return "转写失败，请重新录音。";
  };

  const transcribeRecording = async (recordingUri: string, durationMs: number) => {
    setState("transcribing");
    setErrorMessage("");
    setInfoMessage("");

    try {
      const result = await transcribeAudio({
        durationMs,
        uri: recordingUri,
      });
      setTranscriptionText(result.text);
      setLastDurationMs(result.durationMs);
      setState("result");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setState("error");
    }
  };

  const stopRecording = async () => {
    if (voiceStateRef.current !== "recording" || isStoppingRef.current) return;

    isStoppingRef.current = true;
    clearRecordingTimeout();
    const recorder = audioRecorderRef.current;
    const measuredDurationMs = Math.min(
      Math.max(Date.now() - recordingStartedAtRef.current, 0),
      maxVoiceDurationMs,
    );
    setLastDurationMs(measuredDurationMs);
    setState("transcribing");

    try {
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });

      const recordingUri = recorder.uri;
      if (!recordingUri) {
        throw new SpeechTranscriptionError("ASR_EMPTY_RESULT", "没有生成录音文件，请重新录音。");
      }

      await transcribeRecording(recordingUri, measuredDurationMs);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setState("error");
    } finally {
      isStoppingRef.current = false;
    }
  };

  const startRecording = async () => {
    if (voiceStateRef.current === "recording" || voiceStateRef.current === "transcribing") return;

    resetVoiceInput();
    isStoppingRef.current = false;

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("麦克风权限被拒绝，请在系统设置中开启。");
        setState("error");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
      const recorder = audioRecorderRef.current;
      await recorder.prepareToRecordAsync(voiceRecordingOptions);
      recordingStartedAtRef.current = Date.now();
      setRecordingTick(recordingStartedAtRef.current);
      recorder.record();
      setState("recording");

      recordingTimeoutRef.current = setTimeout(() => {
        void stopRecording();
      }, maxVoiceDurationMs);
    } catch {
      setErrorMessage("无法启动麦克风，请检查系统录音权限后重试。");
      setState("error");
    }
  };

  const handleMicPress = () => {
    if (voiceStateRef.current === "recording") {
      void stopRecording();
      return;
    }

    if (voiceStateRef.current === "transcribing") return;
    void startRecording();
  };

  const fillSamplePhrase = (phrase: string) => {
    clearRecordingTimeout();
    setTranscriptionText(phrase);
    setErrorMessage("");
    setInfoMessage("");
    setLastDurationMs(0);
    setState("result");
  };

  const handleUseText = () => {
    if (!transcriptionText.trim()) return;
    setInfoMessage("文本已生成，下一步将接入智能识别");
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.gridLayer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`grid-${index}`} style={[styles.gridLine, { top: 36 + index * 58 }]} />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={`rail-${index}`} style={[styles.gridRail, { left: `${index * 24}%` }]} />
        ))}
      </View>

      <View style={styles.topBar}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>IMCFO</Text>
        </View>
        <Text style={styles.phaseText}>SPEECH TO TEXT</Text>
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.titleMark} />
        <View style={styles.titleCopy}>
          <Text style={styles.pageTitle}>智能记一笔</Text>
          <Text style={styles.pageSubtitle}>说一句生活话，先转成文字</Text>
        </View>
        <View style={styles.hudLine} />
      </View>

      <View style={styles.inputStage}>
        <View style={[styles.statusPill, isWorking && styles.statusPillWorking]}>
          <View style={[styles.statusDot, isWorking && styles.statusDotWorking]} />
          <Text style={[styles.statusText, isWorking && styles.statusTextWorking]}>{statusText}</Text>
        </View>

        <View style={styles.micWrap}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.outerPulse,
              isWorking && {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.innerPulse,
              isWorking && {
                opacity: pulseOpacity,
                transform: [{ scale: micScale }],
              },
            ]}
          />
          <Animated.View style={isWorking ? { transform: [{ scale: micScale }] } : undefined}>
            <Pressable
              accessibilityLabel={statusText}
              disabled={voiceState === "transcribing"}
              onPress={handleMicPress}
              style={[
                styles.micButton,
                voiceState === "recording" && styles.micButtonRecording,
                voiceState === "transcribing" && styles.micButtonTranscribing,
              ]}
            >
              <AppIcon color={voiceState === "transcribing" ? "#75EFC8" : "#EEF8FF"} name="mic" size={42} />
            </Pressable>
          </Animated.View>
        </View>

        <View style={[styles.waveform, isWorking && styles.waveformActive]}>
          {[0, 1, 2, 3, 4].map((item) => (
            <Animated.View
              key={item}
              style={[
                styles.waveBar,
                {
                  opacity: isWorking ? 1 : 0.25,
                  transform: [{ scaleY: isWorking ? waveScale : 0.42 }],
                },
              ]}
            />
          ))}
        </View>

        <Text style={styles.timerText}>{formatDuration(shownDurationMs)}</Text>
      </View>

      <View style={styles.sampleWrap}>
        {samplePhrases.map((phrase) => (
          <Pressable key={phrase} onPress={() => fillSamplePhrase(phrase)} style={styles.sampleChip}>
            <Text style={styles.sampleText}>{phrase}</Text>
          </Pressable>
        ))}
      </View>

      {errorMessage ? (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>提示</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {transcriptionText ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>转写结果</Text>
          <Text style={styles.resultText}>{transcriptionText}</Text>
          {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}
          <View style={styles.resultActions}>
            <Pressable onPress={resetVoiceInput} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>重新录音</Text>
            </Pressable>
            <Pressable onPress={handleUseText} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>使用这段文本</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.footerMeta}>
        <Text style={styles.footerText}>LIQUID CFO INPUT</Text>
        <Text style={styles.footerText}>ASR ONLY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBadge: {
    alignItems: "center",
    backgroundColor: "rgba(7, 17, 29, 0.72)",
    borderColor: "rgba(199, 232, 255, 0.13)",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 94,
  },
  brandText: {
    color: "rgba(238, 248, 255, 0.94)",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 3,
  },
  errorText: {
    color: "#FF8EA7",
    fontSize: 14,
    lineHeight: 22,
  },
  footerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  footerText: {
    color: "rgba(151, 177, 194, 0.42)",
    fontSize: 11,
    fontWeight: "700",
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.46,
  },
  gridLine: {
    backgroundColor: "rgba(94, 231, 255, 0.08)",
    height: 1,
    left: -24,
    position: "absolute",
    right: -24,
    transform: [{ rotate: "-18deg" }],
  },
  gridRail: {
    backgroundColor: "rgba(138, 125, 255, 0.05)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1,
  },
  hudLine: {
    backgroundColor: "rgba(94, 231, 255, 0.48)",
    flex: 1,
    height: 1,
    marginTop: 19,
  },
  infoText: {
    color: "#75EFC8",
    fontSize: 13,
    lineHeight: 20,
  },
  innerPulse: {
    backgroundColor: "rgba(138, 125, 255, 0.08)",
    borderColor: "rgba(138, 125, 255, 0.18)",
    borderRadius: 72,
    borderWidth: 1,
    height: 144,
    position: "absolute",
    width: 144,
  },
  inputStage: {
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
    minHeight: 336,
    paddingVertical: 18,
  },
  messageCard: {
    backgroundColor: "rgba(255, 106, 138, 0.1)",
    borderColor: "rgba(255, 106, 138, 0.2)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    marginTop: 16,
    padding: 14,
  },
  messageTitle: {
    color: "#EEF8FF",
    fontSize: 14,
    fontWeight: "900",
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "rgba(13, 27, 40, 0.96)",
    borderColor: "rgba(207, 241, 255, 0.18)",
    borderRadius: 54,
    borderWidth: 1,
    height: 108,
    justifyContent: "center",
    shadowColor: "#5EE7FF",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 34,
    width: 108,
  },
  micButtonRecording: {
    backgroundColor: "rgba(15, 45, 61, 0.98)",
    borderColor: "rgba(94, 231, 255, 0.5)",
    shadowOpacity: 0.28,
  },
  micButtonTranscribing: {
    backgroundColor: "rgba(20, 48, 42, 0.98)",
    borderColor: "rgba(117, 239, 200, 0.46)",
  },
  micWrap: {
    alignItems: "center",
    height: 196,
    justifyContent: "center",
    width: 196,
  },
  outerPulse: {
    backgroundColor: "rgba(94, 231, 255, 0.055)",
    borderColor: "rgba(94, 231, 255, 0.16)",
    borderRadius: 98,
    borderWidth: 1,
    height: 196,
    position: "absolute",
    width: 196,
  },
  pageSubtitle: {
    color: "rgba(184, 207, 222, 0.82)",
    fontSize: 14,
    lineHeight: 22,
  },
  pageTitle: {
    color: "#EEF8FF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  phaseText: {
    color: "rgba(151, 177, 194, 0.56)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#5EE7FF",
    borderRadius: 15,
    flex: 1.15,
    justifyContent: "center",
    minHeight: 44,
  },
  primaryButtonText: {
    color: "#021018",
    fontSize: 14,
    fontWeight: "900",
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: "rgba(5, 14, 23, 0.82)",
    borderColor: "rgba(195, 231, 255, 0.13)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    marginTop: 18,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.26,
    shadowRadius: 28,
  },
  resultText: {
    color: "rgba(232, 247, 255, 0.94)",
    fontSize: 16,
    lineHeight: 25,
    minHeight: 46,
  },
  resultTitle: {
    color: "#EEF8FF",
    fontSize: 15,
    fontWeight: "900",
  },
  sampleChip: {
    backgroundColor: "rgba(3, 12, 20, 0.72)",
    borderColor: "rgba(197, 232, 255, 0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 39,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  sampleText: {
    color: "rgba(222, 243, 255, 0.9)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  sampleWrap: {
    alignItems: "center",
    gap: 10,
  },
  screen: {
    backgroundColor: "#02060C",
    borderColor: "rgba(200, 230, 255, 0.08)",
    borderRadius: 28,
    borderWidth: 1,
    marginHorizontal: -18,
    marginTop: -16,
    minHeight: 760,
    overflow: "hidden",
    padding: 22,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(3, 12, 20, 0.78)",
    borderColor: "rgba(199, 229, 255, 0.16)",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryButtonText: {
    color: "rgba(222, 238, 248, 0.88)",
    fontSize: 14,
    fontWeight: "800",
  },
  statusDot: {
    backgroundColor: "rgba(180, 206, 222, 0.62)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusDotWorking: {
    backgroundColor: "#75EFC8",
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: "rgba(5, 14, 23, 0.72)",
    borderColor: "rgba(94, 231, 255, 0.12)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 35,
    paddingHorizontal: 14,
  },
  statusPillWorking: {
    backgroundColor: "rgba(117, 239, 200, 0.07)",
    borderColor: "rgba(117, 239, 200, 0.24)",
  },
  statusText: {
    color: "rgba(214, 235, 247, 0.9)",
    fontSize: 13,
    fontWeight: "800",
  },
  statusTextWorking: {
    color: "#75EFC8",
  },
  timerText: {
    color: "rgba(184, 207, 222, 0.72)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  titleBlock: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 13,
    marginTop: 34,
  },
  titleCopy: {
    gap: 7,
  },
  titleMark: {
    backgroundColor: "#5EE7FF",
    borderRadius: 999,
    height: 62,
    marginTop: 5,
    shadowColor: "#5EE7FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    width: 3,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  waveform: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    height: 26,
    justifyContent: "center",
    opacity: 0.3,
  },
  waveformActive: {
    opacity: 1,
  },
  waveBar: {
    backgroundColor: "#5EE7FF",
    borderRadius: 999,
    height: 23,
    width: 4,
  },
});
