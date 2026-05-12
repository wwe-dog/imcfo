import { useEffect, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { Animated, Easing, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import AppIcon from "../components/AppIcon";
import type { AppIconName } from "../components/AppIcon";
import LiquidGlassVoiceInput from "../components/LiquidGlassVoiceInput";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account, Liability } from "../domain/models";
import {
  RecordRecognitionError,
  recognizeTransactionDraft,
  type CandidateTransactionDraft,
  type CandidateTransactionDirection,
  type CandidateTransactionType,
} from "../services/recordRecognitionService";
import { SpeechTranscriptionError, transcribeAudio } from "../services/speechTranscriptionService";

interface RecordScreenProps {
  accounts: Account[];
  liabilities: Liability[];
  onSave: (input: TransactionInput) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onOpenAssets: () => void;
  onOpenTransactions: () => void;
}

interface DraftEditState {
  accountId: string;
  amountText: string;
  categoryText: string;
  dateText: string;
  noteText: string;
  repaymentTargetKey: string;
}

interface RepaymentTargetOption {
  accountId?: string;
  isCreditCard: boolean;
  key: string;
  label: string;
  liabilityId?: string;
}

type VoiceInputState = "idle" | "recording" | "transcribing" | "result" | "recognizing" | "draftReady" | "recognitionError" | "error";

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
    case "recognizing":
      return "正在识别这笔交易...";
    case "draftReady":
      return "识别完成";
    case "recognitionError":
      return "识别失败";
    case "error":
      return "转写失败";
    case "idle":
    default:
      return "点击开始说话";
  }
};

const directionLabels: Record<CandidateTransactionDirection, string> = {
  expense: "支出",
  income: "收入",
  repayment: "还款",
  transfer: "转账",
  unknown: "待确认",
};

const transactionTypeLabels: Record<CandidateTransactionType, string> = {
  assetDecrease: "资产减少",
  assetIncrease: "资产增加",
  expense: "支出",
  income: "收入",
  investmentBuy: "投资买入",
  investmentSell: "投资卖出",
  liabilityDecrease: "负债减少",
  liabilityIncrease: "负债增加",
  repayment: "还款",
  transfer: "转账",
  unknown: "待确认",
};

const formatConfidence = (confidence: number): string => `${Math.round(confidence * 100)}%`;

const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = (): string => toLocalDateKey(new Date());

const toDateInput = (dateText: string | null): string | null => {
  if (!dateText) return null;
  const normalized = dateText.trim();
  if (!normalized) return null;
  if (normalized === "今天") return today();

  const baseDate = new Date();
  if (normalized === "昨天") {
    baseDate.setDate(baseDate.getDate() - 1);
    return toLocalDateKey(baseDate);
  }
  if (normalized === "明天") {
    baseDate.setDate(baseDate.getDate() + 1);
    return toLocalDateKey(baseDate);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  return null;
};

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

const getAccountNameTypeHint = (accountName: string): Account["type"] | null => {
  if (accountName.includes("支付宝")) return "alipay";
  if (accountName.includes("微信")) return "wechat";
  if (accountName.includes("银行卡") || accountName.includes("银行")) return "bank";
  return null;
};

const findAccountForDraft = (accounts: Account[], accountName: string): Account | null => {
  const normalizedName = accountName.trim();
  const enabledAccounts = accounts.filter(isAccountEnabled);
  const typeHint = getAccountNameTypeHint(normalizedName);

  return (
    enabledAccounts.find((account) => account.name.trim() === normalizedName) ??
    enabledAccounts.find((account) => account.name.includes(normalizedName) || normalizedName.includes(account.name)) ??
    (typeHint ? enabledAccounts.find((account) => account.type === typeHint) : undefined) ??
    null
  );
};

const parseEditableAmount = (amountText: string): number | null => {
  const normalized = amountText.replace(/[¥￥,\s]/g, "");
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const isRepaymentDraft = (draft: CandidateTransactionDraft): boolean =>
  draft.transactionType === "repayment" || draft.direction === "repayment";

const isCreditCardLiability = (liability: Liability, accounts: Account[]): boolean => {
  const linkedAccount = liability.accountId ? accounts.find((account) => account.id === liability.accountId) : undefined;
  return (
    linkedAccount?.type === "creditCard" ||
    liability.category === "creditCard" ||
    liability.category === "信用卡" ||
    liability.name.includes("信用卡")
  );
};

const getRepaymentTargetOptions = (accounts: Account[], liabilities: Liability[]): RepaymentTargetOption[] => {
  const enabledAccounts = accounts.filter(isAccountEnabled);
  const liabilityTargets = liabilities.map<RepaymentTargetOption>((liability) => ({
    accountId: liability.accountId,
    isCreditCard: isCreditCardLiability(liability, accounts),
    key: `liability:${liability.id}`,
    label: liability.name,
    liabilityId: liability.id,
  }));
  const liabilityAccountIds = new Set(liabilities.map((liability) => liability.accountId).filter(Boolean));
  const creditCardAccountTargets = enabledAccounts
    .filter((account) => account.type === "creditCard" && !liabilityAccountIds.has(account.id))
    .map<RepaymentTargetOption>((account) => ({
      accountId: account.id,
      isCreditCard: true,
      key: `account:${account.id}`,
      label: account.name,
    }));

  return [...liabilityTargets, ...creditCardAccountTargets];
};

const findRepaymentTargetForDraft = (
  draft: CandidateTransactionDraft,
  accounts: Account[],
  liabilities: Liability[],
): RepaymentTargetOption | null => {
  const options = getRepaymentTargetOptions(accounts, liabilities);
  const sourceText = `${draft.sourceText} ${draft.accountName ?? ""}`;
  return (
    options.find((option) => sourceText.includes(option.label)) ??
    options.find((option) => option.label.includes("招商") && sourceText.includes("招商")) ??
    options.find((option) => option.isCreditCard) ??
    options[0] ??
    null
  );
};

const createDraftEditState = (
  draft: CandidateTransactionDraft,
  accounts: Account[],
  liabilities: Liability[],
): DraftEditState => {
  const matchedAccount = draft.accountName ? findAccountForDraft(accounts, draft.accountName) : null;
  const defaultAccount =
    matchedAccount ??
    accounts.find((account) => isAccountEnabled(account) && account.type !== "creditCard") ??
    null;
  const defaultTarget = isRepaymentDraft(draft) ? findRepaymentTargetForDraft(draft, accounts, liabilities) : null;

  return {
    accountId: defaultAccount?.id ?? "",
    amountText: draft.amount === null ? "" : String(draft.amount),
    categoryText: draft.category ?? "",
    dateText: draft.dateText ?? "今天",
    noteText: draft.note ?? draft.sourceText,
    repaymentTargetKey: defaultTarget?.key ?? "",
  };
};

const getDraftDirection = (draft: CandidateTransactionDraft): CandidateTransactionDirection =>
  isRepaymentDraft(draft) ? "repayment" : draft.direction;

const simplePostableTransactionTypes: ReadonlySet<CandidateTransactionType> = new Set([
  "expense",
  "income",
]);

type ManagementActionKey = "accounts" | "assets" | "reports" | "transactions";

const managementActions: Array<{
  icon: AppIconName;
  key: ManagementActionKey;
  title: string;
}> = [
  { icon: "account", key: "accounts", title: "账户管理" },
  { icon: "transaction", key: "transactions", title: "记账记录" },
  { icon: "asset", key: "assets", title: "资产负债" },
  { icon: "reports", key: "reports", title: "报表中心" },
];

export default function RecordScreen({
  accounts,
  liabilities,
  onOpenAccounts,
  onOpenAssets,
  onOpenReports,
  onOpenTransactions,
  onSave,
}: RecordScreenProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [transcriptionText, setTranscriptionText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [lastDurationMs, setLastDurationMs] = useState(0);
  const [recordingTick, setRecordingTick] = useState(0);
  const [candidateDraft, setCandidateDraft] = useState<CandidateTransactionDraft | null>(null);
  const [draftEdit, setDraftEdit] = useState<DraftEditState | null>(null);
  const [isDraftSheetVisible, setIsDraftSheetVisible] = useState(false);
  const [draftErrorMessage, setDraftErrorMessage] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const audioRecorder = useAudioRecorder(voiceRecordingOptions);
  const pulseProgress = useRef(new Animated.Value(0)).current;
  const voiceStateRef = useRef<VoiceInputState>("idle");
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStartedAtRef = useRef(0);
  const isStoppingRef = useRef(false);
  const isSavingDraftRef = useRef(false);
  const lastSavedDraftSignatureRef = useRef<string | null>(null);
  const audioRecorderRef = useRef(audioRecorder);
  const recordScreenHeight = Math.max(640, windowHeight - 156);
  const draftSheetMaxHeight = Math.round(windowHeight * 0.74);

  audioRecorderRef.current = audioRecorder;

  const isWorking = voiceState === "recording" || voiceState === "transcribing" || voiceState === "recognizing";
  const isPrimaryActionDisabled = voiceState === "transcribing" || voiceState === "recognizing";
  const managementActionHandlers: Record<ManagementActionKey, () => void> = {
    accounts: onOpenAccounts,
    assets: onOpenAssets,
    reports: onOpenReports,
    transactions: onOpenTransactions,
  };
  const enabledPostingAccounts = accounts.filter(
    (account) => isAccountEnabled(account) && account.type !== "creditCard",
  );
  const repaymentTargetOptions = getRepaymentTargetOptions(accounts, liabilities);
  const selectedRepaymentTarget = draftEdit
    ? repaymentTargetOptions.find((option) => option.key === draftEdit.repaymentTargetKey) ?? null
    : null;
  const currentDraftDirection = candidateDraft ? getDraftDirection(candidateDraft) : "unknown";
  const isCurrentDraftRepayment = candidateDraft ? isRepaymentDraft(candidateDraft) : false;
  const shownDurationMs =
    voiceState === "recording"
      ? Math.min((recordingTick || Date.now()) - recordingStartedAtRef.current, maxVoiceDurationMs)
      : lastDurationMs;
  const statusText = getStatusText(voiceState);
  const shouldShowManagementPanel = !transcriptionText;
  const inputPrimaryText = voiceState === "idle" ? "自然语言记一笔…" : statusText;
  const inputSecondaryText =
    errorMessage
      ? errorMessage
      : voiceState === "recording"
      ? formatDuration(shownDurationMs)
      : voiceState === "idle"
        ? "点击开始说话"
        : transcriptionText
          ? "文本已生成，可继续识别"
          : "保持页面打开";
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
    setCandidateDraft(null);
    setDraftEdit(null);
    setIsDraftSheetVisible(false);
    setDraftErrorMessage("");
    setIsSavingDraft(false);
    isSavingDraftRef.current = false;
    lastSavedDraftSignatureRef.current = null;
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

  const getRecognitionErrorMessage = (error: unknown): string => {
    if (error instanceof RecordRecognitionError) {
      switch (error.code) {
        case "EMPTY_TEXT":
          return "请先完成语音转写";
        case "AMOUNT_MISSING":
          return "没有识别到金额，请手动修改";
        case "REMOTE_CONFIG_INVALID":
          return error.message;
        case "RECOGNITION_FAILED":
        default:
          return error.message || "暂时无法识别这段文本，请稍后重试";
      }
    }

    return "暂时无法识别这段文本，请稍后重试";
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
      setCandidateDraft(null);
      setDraftEdit(null);
      setIsDraftSheetVisible(false);
      setDraftErrorMessage("");
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

  const handleUseText = async () => {
    const text = transcriptionText.trim();
    if (!text) {
      setErrorMessage("请先完成语音转写");
      setState("recognitionError");
      return;
    }

    setState("recognizing");
    setErrorMessage("");
    setInfoMessage("");
    setCandidateDraft(null);
    setDraftEdit(null);
    setIsDraftSheetVisible(false);
    setDraftErrorMessage("");

    try {
      const draft = await recognizeTransactionDraft(text);
      setCandidateDraft(draft);
      setDraftEdit(createDraftEditState(draft, accounts, liabilities));
      setDraftErrorMessage("");
      setIsDraftSheetVisible(true);
      setState("draftReady");
    } catch (error) {
      setErrorMessage(getRecognitionErrorMessage(error));
      setState("recognitionError");
    }
  };

  const closeDraftSheet = () => {
    if (isSavingDraftRef.current) return;
    setIsDraftSheetVisible(false);
    setDraftErrorMessage("");
    setState("result");
  };

  const handleEditDraft = () => {
    if (isSavingDraftRef.current) return;
    setIsDraftSheetVisible(false);
    setDraftErrorMessage("");
    setInfoMessage("编辑字段将在下一步接入");
    setState("result");
  };

  const updateDraftEdit = (patch: Partial<DraftEditState>) => {
    setDraftEdit((current) => (current ? { ...current, ...patch } : current));
    setDraftErrorMessage("");
  };

  const buildTransactionInputFromDraft = (
    draft: CandidateTransactionDraft,
    editState: DraftEditState,
  ): TransactionInput => {
    const amount = parseEditableAmount(editState.amountText);
    if (amount === null || amount <= 0) {
      throw new Error("金额必须大于 0，请继续修改");
    }
    const direction = getDraftDirection(draft);
    if (direction === "unknown") {
      throw new Error("交易方向待确认，请继续修改");
    }
    if (draft.transactionType === "unknown") {
      throw new Error("交易类型待确认，请继续修改");
    }
    const category = editState.categoryText.trim();
    if (!category) {
      throw new Error("分类待确认，请继续修改");
    }
    const matchedAccount = accounts.find((account) => account.id === editState.accountId && isAccountEnabled(account));
    if (!matchedAccount) {
      throw new Error("账户待确认，请继续修改");
    }

    const date = toDateInput(editState.dateText);
    if (!date) {
      throw new Error("日期待确认，请继续修改");
    }

    const note = editState.noteText.trim() || draft.sourceText;
    if (isRepaymentDraft(draft)) {
      const repaymentTarget = repaymentTargetOptions.find((option) => option.key === editState.repaymentTargetKey);
      if (!repaymentTarget) {
        throw new Error("还款目标待确认，请选择信用卡或负债账户");
      }

      return {
        type: repaymentTarget.isCreditCard ? "creditCardRepayment" : "repayment",
        amount,
        category,
        accountId: matchedAccount.id,
        counterAccountId: repaymentTarget.accountId,
        date,
        note,
        relatedLiabilityId: repaymentTarget.liabilityId,
      };
    }

    if (!simplePostableTransactionTypes.has(draft.transactionType)) {
      throw new Error("该交易类型需要先选择对应科目后再入账");
    }

    return {
      type: draft.transactionType,
      amount,
      category,
      accountId: matchedAccount.id,
      date,
      note,
    };
  };

  const handleConfirmDraft = async () => {
    if (!candidateDraft || !draftEdit || isSavingDraftRef.current) return;

    setDraftErrorMessage("");
    setInfoMessage("");

    let transactionInput: TransactionInput;
    try {
      transactionInput = buildTransactionInputFromDraft(candidateDraft, draftEdit);
    } catch (error) {
      setDraftErrorMessage(error instanceof Error ? error.message : "这笔交易信息不完整，请继续修改");
      return;
    }

    const draftSignature = JSON.stringify(transactionInput);
    if (lastSavedDraftSignatureRef.current === draftSignature) {
      setInfoMessage("这笔交易已入账");
      setIsDraftSheetVisible(false);
      setState("result");
      return;
    }

    isSavingDraftRef.current = true;
    setIsSavingDraft(true);
    try {
      await onSave(transactionInput);
      lastSavedDraftSignatureRef.current = draftSignature;
      setIsDraftSheetVisible(false);
      setDraftErrorMessage("");
      setInfoMessage("已确认入账");
      setState("result");
    } catch {
      setDraftErrorMessage("保存失败，这笔记录没有入账，请稍后重试");
    } finally {
      isSavingDraftRef.current = false;
      setIsSavingDraft(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { height: recordScreenHeight, maxHeight: recordScreenHeight }]}>
      <View style={styles.screenContent}>
      <View pointerEvents="none" style={styles.gridLayer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`grid-${index}`} style={[styles.gridLine, { top: 28 + index * 72 }]} />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`grid-alt-${index}`} style={[styles.gridLineAlt, { top: 10 + index * 72 }]} />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={`hex-horizontal-${index}`} style={[styles.hexHorizontalLine, { top: 44 + index * 96 }]} />
        ))}
      </View>

      <View style={styles.wordmarkBlock}>
        <Text style={styles.wordmarkText}>IMCFO</Text>
      </View>

      <View style={styles.inputStage}>
        <Animated.View style={[styles.mainInputAnimated, isWorking ? { transform: [{ scale: micScale }] } : undefined]}>
          <LiquidGlassVoiceInput
            accessibilityLabel={statusText}
            disabled={isPrimaryActionDisabled}
            onPress={handleMicPress}
            placeholder={inputPrimaryText}
            style={styles.mainInputGlass}
            subtext={inputSecondaryText}
            tone={
              errorMessage
                ? "error"
                : voiceState === "recording"
                  ? "recording"
                  : voiceState === "transcribing"
                    ? "transcribing"
                    : "default"
            }
          />
        </Animated.View>

        {isWorking ? (
          <View style={styles.inputFeedbackRow}>
            <View style={[styles.statusDot, isWorking && styles.statusDotWorking]} />
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
        ) : null}
      </View>

      {shouldShowManagementPanel ? (
      <View style={styles.managementPanel}>
        {/* Liquid glass shortcut row */}
        <View style={styles.managementGrid}>
          {Array.from({ length: 6 }).map((_, index) => {
            const action = managementActions[index];

            if (!action) {
              return <View key={`empty-management-slot-${index}`} style={styles.managementActionPlaceholder} />;
            }

            return (
              <TouchableOpacity
                activeOpacity={0.78}
                key={action.key}
                onPress={managementActionHandlers[action.key]}
                style={styles.managementAction}
              >
                {/* Frosted glass button shell */}
                <View style={styles.managementGlassShell}>
                  <BlurView
                    experimentalBlurMethod="dimezisBlurView"
                    intensity={42}
                    style={StyleSheet.absoluteFill}
                    tint="dark"
                  />
                  <View pointerEvents="none" style={styles.managementGlassMist} />
                  <View pointerEvents="none" style={styles.managementGlassHighlight} />
                  <View pointerEvents="none" style={styles.managementGlassBottomGlow} />

                  {/* Icon */}
                  <View style={styles.managementIcon}>
                    <AppIcon color="#5EE7FF" name={action.icon} size={20} strokeWidth={1.85} />
                  </View>
                </View>

                {/* Label */}
                <Text numberOfLines={1} style={styles.managementActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
            <Pressable
              disabled={isPrimaryActionDisabled}
              onPress={() => void handleUseText()}
              style={[styles.primaryButton, isPrimaryActionDisabled && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>{voiceState === "recognizing" ? "识别中..." : "使用这段文本"}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal
        animationType="slide"
        onRequestClose={closeDraftSheet}
        transparent
        visible={isDraftSheetVisible && candidateDraft !== null}
      >
        <View style={styles.sheetOverlay}>
          <Pressable accessibilityLabel="关闭识别结果草稿" onPress={closeDraftSheet} style={styles.sheetBackdrop} />
          {candidateDraft ? (
            <View style={[styles.draftSheet, { height: draftSheetMaxHeight, maxHeight: draftSheetMaxHeight }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderCopy}>
                  <Text style={styles.sheetTitle}>识别结果草稿</Text>
                  <Text style={styles.sheetSubtitle}>请确认这笔交易是否正确</Text>
                </View>
                {candidateDraft.needsReview ? <Text style={styles.reviewBadge}>需确认</Text> : <Text style={styles.okBadge}>高置信</Text>}
              </View>

              <ScrollView
                contentContainerStyle={styles.sheetContentInner}
                showsVerticalScrollIndicator={false}
                style={styles.sheetContent}
              >
                <View style={styles.draftFieldList}>
                  <View style={styles.draftFieldRow}>
                    <Text style={styles.draftFieldLabel}>原文</Text>
                    <Text numberOfLines={2} style={styles.draftFieldValue}>
                      {candidateDraft.sourceText}
                    </Text>
                  </View>

                  {draftEdit ? (
                    <>
                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>金额</Text>
                        <TextInput
                          keyboardType="decimal-pad"
                          onChangeText={(amountText) => updateDraftEdit({ amountText })}
                          placeholder="输入金额"
                          placeholderTextColor="rgba(184, 207, 222, 0.42)"
                          selectTextOnFocus
                          style={[styles.draftTextInput, styles.draftValueAmount]}
                          value={draftEdit.amountText}
                        />
                      </View>

                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>方向</Text>
                        <Text
                          style={[
                            styles.draftFieldValue,
                            currentDraftDirection === "expense" && styles.draftValueExpense,
                            currentDraftDirection === "income" && styles.draftValueIncome,
                            currentDraftDirection === "repayment" && styles.draftValueAccent,
                          ]}
                        >
                          {directionLabels[currentDraftDirection]}
                        </Text>
                      </View>

                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>类型</Text>
                        <Text
                          style={[
                            styles.draftFieldValue,
                            candidateDraft.transactionType === "expense" && styles.draftValueExpense,
                            candidateDraft.transactionType === "income" && styles.draftValueIncome,
                            candidateDraft.transactionType === "repayment" && styles.draftValueAccent,
                          ]}
                        >
                          {transactionTypeLabels[candidateDraft.transactionType]}
                        </Text>
                      </View>

                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>分类</Text>
                        <TextInput
                          onChangeText={(categoryText) => updateDraftEdit({ categoryText })}
                          placeholder="输入分类"
                          placeholderTextColor="rgba(184, 207, 222, 0.42)"
                          style={[styles.draftTextInput, styles.draftValueAccent]}
                          value={draftEdit.categoryText}
                        />
                      </View>

                      <View style={styles.draftOptionBlock}>
                        <Text style={styles.draftOptionLabel}>账户</Text>
                        <View style={styles.optionChipWrap}>
                          {enabledPostingAccounts.map((account) => (
                            <Pressable
                              key={account.id}
                              onPress={() => updateDraftEdit({ accountId: account.id })}
                              style={[
                                styles.optionChip,
                                draftEdit.accountId === account.id && styles.optionChipSelected,
                              ]}
                            >
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.optionChipText,
                                  draftEdit.accountId === account.id && styles.optionChipTextSelected,
                                ]}
                              >
                                {account.name}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {isCurrentDraftRepayment ? (
                        <View style={styles.draftOptionBlock}>
                          <Text style={styles.draftOptionLabel}>还款目标</Text>
                          <View style={styles.optionChipWrap}>
                            {repaymentTargetOptions.length ? (
                              repaymentTargetOptions.map((target) => (
                                <Pressable
                                  key={target.key}
                                  onPress={() => updateDraftEdit({ repaymentTargetKey: target.key })}
                                  style={[
                                    styles.optionChip,
                                    draftEdit.repaymentTargetKey === target.key && styles.optionChipSelected,
                                  ]}
                                >
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.optionChipText,
                                      draftEdit.repaymentTargetKey === target.key && styles.optionChipTextSelected,
                                    ]}
                                  >
                                    {target.label}
                                  </Text>
                                </Pressable>
                              ))
                            ) : (
                              <Text style={styles.optionEmptyText}>暂无可选信用卡或负债</Text>
                            )}
                          </View>
                          {selectedRepaymentTarget ? (
                            <Text style={styles.optionHintText}>
                              将按{selectedRepaymentTarget.isCreditCard ? "信用卡还款" : "还款"}入账
                            </Text>
                          ) : null}
                        </View>
                      ) : null}

                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>日期</Text>
                        <TextInput
                          onChangeText={(dateText) => updateDraftEdit({ dateText })}
                          placeholder="今天或 YYYY-MM-DD"
                          placeholderTextColor="rgba(184, 207, 222, 0.42)"
                          style={styles.draftTextInput}
                          value={draftEdit.dateText}
                        />
                      </View>
                      <View style={styles.dateShortcutRow}>
                        {["今天", "昨天", "明天"].map((dateText) => (
                          <Pressable
                            key={dateText}
                            onPress={() => updateDraftEdit({ dateText })}
                            style={[styles.dateChip, draftEdit.dateText === dateText && styles.optionChipSelected]}
                          >
                            <Text
                              style={[
                                styles.optionChipText,
                                draftEdit.dateText === dateText && styles.optionChipTextSelected,
                              ]}
                            >
                              {dateText}
                            </Text>
                          </Pressable>
                        ))}
                      </View>

                      <View style={styles.draftFieldRow}>
                        <Text style={styles.draftFieldLabel}>备注</Text>
                        <TextInput
                          onChangeText={(noteText) => updateDraftEdit({ noteText })}
                          placeholder="输入备注"
                          placeholderTextColor="rgba(184, 207, 222, 0.42)"
                          style={styles.draftTextInput}
                          value={draftEdit.noteText}
                        />
                      </View>
                    </>
                  ) : null}

                  <View style={styles.draftFieldRow}>
                    <Text style={styles.draftFieldLabel}>置信度</Text>
                    <Text style={styles.draftFieldValue}>{formatConfidence(candidateDraft.confidence)}</Text>
                  </View>
                </View>

                <View style={styles.impactBox}>
                  <Text style={styles.impactLabel}>本笔影响</Text>
                  <Text style={styles.impactText}>{candidateDraft.impactPreview}</Text>
                </View>

                {draftErrorMessage ? (
                  <View style={styles.draftErrorBox}>
                    <Text style={styles.draftErrorText}>{draftErrorMessage}</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.sheetFooter}>
                <View style={styles.sheetActions}>
                  <Pressable disabled={isSavingDraft} onPress={handleEditDraft} style={[styles.sheetSecondaryButton, isSavingDraft && styles.buttonDisabled]}>
                    <Text style={styles.sheetSecondaryText}>继续修改</Text>
                  </Pressable>
                  <Pressable disabled={isSavingDraft} onPress={() => void handleConfirmDraft()} style={[styles.sheetPrimaryButton, isSavingDraft && styles.buttonDisabled]}>
                    <Text style={styles.sheetPrimaryText}>{isSavingDraft ? "入账中..." : "确认入账"}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
      </View>
    </SafeAreaView>
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
  buttonDisabled: {
    opacity: 0.62,
  },
  draftFieldLabel: {
    color: "rgba(184, 207, 222, 0.66)",
    fontSize: 12,
    fontWeight: "800",
    width: 62,
  },
  draftFieldList: {
    gap: 7,
  },
  draftFieldRow: {
    alignItems: "flex-start",
    backgroundColor: "rgba(3, 14, 24, 0.58)",
    borderColor: "rgba(195, 231, 255, 0.1)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  draftFieldValue: {
    color: "rgba(238, 248, 255, 0.94)",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "right",
  },
  draftOptionBlock: {
    backgroundColor: "rgba(3, 14, 24, 0.58)",
    borderColor: "rgba(195, 231, 255, 0.1)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  draftOptionLabel: {
    color: "rgba(184, 207, 222, 0.66)",
    fontSize: 12,
    fontWeight: "800",
  },
  draftTextInput: {
    color: "rgba(238, 248, 255, 0.94)",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    minHeight: 24,
    padding: 0,
    textAlign: "right",
  },
  draftValueAccent: {
    color: "#7DEBFF",
  },
  draftValueAmount: {
    color: "#5EE7FF",
    fontSize: 15,
  },
  draftValueExpense: {
    color: "#FF8EA7",
  },
  draftValueIncome: {
    color: "#75EFC8",
  },
  draftErrorBox: {
    backgroundColor: "rgba(255, 106, 138, 0.1)",
    borderColor: "rgba(255, 106, 138, 0.22)",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  draftErrorText: {
    color: "#FF8EA7",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  draftSheet: {
    backgroundColor: "rgba(5, 14, 23, 0.96)",
    borderColor: "rgba(195, 231, 255, 0.18)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    gap: 10,
    marginBottom: 96,
    marginHorizontal: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -18 },
    shadowOpacity: 0.38,
    shadowRadius: 30,
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
  dateChip: {
    alignItems: "center",
    backgroundColor: "rgba(3, 12, 20, 0.72)",
    borderColor: "rgba(197, 232, 255, 0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateShortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.32,
  },
  gridLine: {
    backgroundColor: "rgba(163, 213, 255, 0.055)",
    height: 1,
    left: -120,
    position: "absolute",
    right: -120,
    transform: [{ rotate: "-30deg" }],
  },
  gridLineAlt: {
    backgroundColor: "rgba(163, 213, 255, 0.045)",
    height: 1,
    left: -120,
    position: "absolute",
    right: -120,
    transform: [{ rotate: "30deg" }],
  },
  gridRail: {
    backgroundColor: "rgba(195, 231, 255, 0.045)",
    bottom: -80,
    position: "absolute",
    top: -80,
    transform: [{ rotate: "30deg" }],
    width: 1,
  },
  hexHorizontalLine: {
    backgroundColor: "rgba(163, 213, 255, 0.035)",
    height: 1,
    left: -30,
    position: "absolute",
    right: -30,
  },
  impactBox: {
    backgroundColor: "rgba(117, 239, 200, 0.08)",
    borderColor: "rgba(117, 239, 200, 0.16)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
    padding: 12,
  },
  impactLabel: {
    color: "rgba(117, 239, 200, 0.78)",
    fontSize: 12,
    fontWeight: "900",
  },
  impactText: {
    color: "rgba(238, 248, 255, 0.94)",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  infoText: {
    color: "#75EFC8",
    fontSize: 13,
    lineHeight: 20,
  },
  inputStage: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    marginTop: 34,
    minHeight: 108,
    paddingVertical: 0,
  },
  inputFeedbackRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 28,
  },
  mainInputBox: {
    alignItems: "center",
    backgroundColor: "rgba(248, 253, 255, 0.96)",
    borderColor: "rgba(197, 226, 239, 0.72)",
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 74,
    paddingHorizontal: 17,
    shadowColor: "#D7F7FF",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: "100%",
  },
  mainInputBoxRecording: {
    backgroundColor: "rgba(238, 253, 255, 0.98)",
    borderColor: "rgba(94, 231, 255, 0.46)",
    shadowOpacity: 0.22,
  },
  mainInputBoxTranscribing: {
    backgroundColor: "rgba(239, 255, 249, 0.98)",
    borderColor: "rgba(117, 239, 200, 0.48)",
  },
  mainInputBoxError: {
    backgroundColor: "rgba(255, 243, 247, 0.98)",
    borderColor: "rgba(255, 142, 167, 0.5)",
  },
  mainInputAnimated: {
    width: "100%",
  },
  mainInputCopy: {
    flex: 1,
    gap: 4,
  },
  mainInputGlass: {
    width: "100%",
  },
  mainInputIcon: {
    alignItems: "center",
    backgroundColor: "rgba(0, 143, 157, 0.1)",
    borderColor: "rgba(0, 143, 157, 0.18)",
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  mainInputSubtext: {
    color: "rgba(50, 72, 88, 0.64)",
    fontSize: 12,
    fontWeight: "700",
  },
  mainInputSubtextError: {
    color: "rgba(180, 52, 78, 0.9)",
    lineHeight: 17,
  },
  mainInputText: {
    color: "rgba(16, 31, 45, 0.96)",
    fontSize: 18,
    fontWeight: "900",
  },
  manualInputIcon: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  managementAction: {
    alignItems: "center",
    flexBasis: "16.66%",
    flexGrow: 0,
    flexShrink: 1,
    gap: 7,
    justifyContent: "center",
    minWidth: 0,
  },
  managementActionPlaceholder: {
    flexBasis: "16.66%",
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
  },
  managementActionTitle: {
    color: "rgba(247, 252, 255, 0.93)",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.16)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  managementGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  managementGlassBottomGlow: {
    backgroundColor: "rgba(61, 206, 255, 0.64)",
    bottom: -1,
    height: 2,
    left: 8,
    opacity: 1,
    position: "absolute",
    right: 8,
  },
  managementGlassHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    height: 1.2,
    left: 7,
    opacity: 0.65,
    position: "absolute",
    right: 7,
    top: 1,
  },
  managementGlassMist: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(178, 205, 238, 0.18)",
  },
  managementGlassShell: {
    alignItems: "center",
    alignSelf: "center",
    aspectRatio: 1.05,
    backgroundColor: "rgba(34, 49, 68, 0.56)",
    borderColor: "rgba(222, 242, 255, 0.56)",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    maxWidth: 48,
    minHeight: 45,
    overflow: "hidden",
    shadowColor: "#8EC8FF",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    width: "100%",
    elevation: 6,
  },
  managementIcon: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  managementPanel: {
    marginTop: 24,
    paddingHorizontal: 2,
  },
  okBadge: {
    backgroundColor: "rgba(117, 239, 200, 0.14)",
    borderColor: "rgba(117, 239, 200, 0.22)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#75EFC8",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  optionChip: {
    backgroundColor: "rgba(3, 12, 20, 0.72)",
    borderColor: "rgba(197, 232, 255, 0.12)",
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  optionChipSelected: {
    backgroundColor: "rgba(94, 231, 255, 0.16)",
    borderColor: "rgba(94, 231, 255, 0.36)",
  },
  optionChipText: {
    color: "rgba(222, 243, 255, 0.82)",
    fontSize: 12,
    fontWeight: "800",
  },
  optionChipTextSelected: {
    color: "#5EE7FF",
  },
  optionChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionEmptyText: {
    color: "#FF8EA7",
    fontSize: 12,
    fontWeight: "800",
  },
  optionHintText: {
    color: "rgba(117, 239, 200, 0.72)",
    fontSize: 12,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: "rgba(184, 207, 222, 0.82)",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  pageTitle: {
    color: "#EEF8FF",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  phaseBadge: {
    alignItems: "center",
    backgroundColor: "rgba(7, 17, 29, 0.64)",
    borderColor: "rgba(117, 239, 200, 0.14)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 13,
  },
  phaseText: {
    color: "rgba(221, 247, 255, 0.82)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
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
    gap: 8,
    marginBottom: 104,
    marginTop: 12,
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.26,
    shadowRadius: 28,
  },
  resultText: {
    color: "rgba(232, 247, 255, 0.94)",
    fontSize: 16,
    lineHeight: 25,
    minHeight: 34,
  },
  resultTitle: {
    color: "#EEF8FF",
    fontSize: 15,
    fontWeight: "900",
  },
  reviewBadge: {
    backgroundColor: "rgba(255, 195, 61, 0.12)",
    borderColor: "rgba(255, 195, 61, 0.24)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#FFC33D",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  screen: {
    backgroundColor: "#01050B",
    flex: 1,
    marginHorizontal: -18,
    marginTop: 0,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 104,
  },
  screenContent: {
    flex: 1,
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
  sheetActions: {
    flexDirection: "row",
    gap: 12,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.46)",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(195, 231, 255, 0.28)",
    borderRadius: 999,
    height: 4,
    width: 48,
  },
  sheetHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  sheetHeaderCopy: {
    flex: 1,
  },
  sheetContent: {
    flexShrink: 1,
  },
  sheetContentInner: {
    gap: 10,
    paddingBottom: 104,
  },
  sheetFooter: {
    borderTopColor: "rgba(195, 231, 255, 0.09)",
    borderTopWidth: 1,
    paddingBottom: 24,
    paddingTop: 12,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetPrimaryButton: {
    alignItems: "center",
    backgroundColor: "#5EE7FF",
    borderRadius: 16,
    flex: 1.2,
    justifyContent: "center",
    minHeight: 46,
  },
  sheetPrimaryText: {
    color: "#021018",
    fontSize: 14,
    fontWeight: "900",
  },
  sheetSecondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(3, 12, 20, 0.72)",
    borderColor: "rgba(199, 229, 255, 0.14)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  sheetSecondaryText: {
    color: "rgba(222, 238, 248, 0.88)",
    fontSize: 13,
    fontWeight: "800",
  },
  sheetSubtitle: {
    color: "rgba(184, 207, 222, 0.72)",
    fontSize: 13,
    lineHeight: 20,
  },
  sheetTitle: {
    color: "#EEF8FF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.2,
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
  timerText: {
    color: "rgba(184, 207, 222, 0.72)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  titleBlock: {
    alignItems: "center",
    gap: 6,
    marginTop: 16,
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
    height: 22,
    justifyContent: "center",
    opacity: 0.3,
  },
  waveformActive: {
    opacity: 1,
  },
  waveBar: {
    backgroundColor: "#5EE7FF",
    borderRadius: 999,
    height: 18,
    width: 3,
  },
  wordmarkBlock: {
    alignItems: "center",
    marginTop: 58,
  },
  wordmarkText: {
    color: "rgba(245, 250, 255, 0.96)",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 9,
    textShadowColor: "rgba(238, 248, 255, 0.34)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
});
