import { BlurView } from "expo-blur";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, View } from "react-native";
import AppIcon from "./AppIcon";

type LiquidGlassVoiceInputProps = {
  accessibilityLabel?: string;
  disabled?: boolean;
  onEditPress?: () => void;
  onPress?: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  subtext?: string;
  tone?: "default" | "error" | "recording" | "transcribing";
};

export default function LiquidGlassVoiceInput({
  accessibilityLabel,
  disabled = false,
  onEditPress,
  onPress,
  placeholder = "自然语言记一笔...",
  style,
  subtext = "点击开始说话",
  tone = "default",
}: LiquidGlassVoiceInputProps) {
  const [pressed, setPressed] = useState(false);
  const isError = tone === "error";
  const isRecording = tone === "recording";
  const isTranscribing = tone === "transcribing";

  const androidBlurProps = useMemo(
    () =>
      Platform.OS === "android"
        ? ({
            blurReductionFactor: 2.6,
            experimentalBlurMethod: "dimezisBlurView" as const,
          })
        : undefined,
    [],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.shadowShell, pressed && styles.shadowShellPressed, disabled && styles.disabled, style]}
    >
      <View
        style={[
          styles.cardClip,
          isRecording && styles.cardClipRecording,
          isTranscribing && styles.cardClipTranscribing,
          isError && styles.cardClipError,
        ]}
      >
        <BlurView intensity={52} style={StyleSheet.absoluteFill} tint="systemMaterialDark" {...androidBlurProps} />
        <View pointerEvents="none" style={styles.mistyWash} />
        <View pointerEvents="none" style={styles.innerTopHighlight} />
        <View pointerEvents="none" style={styles.innerBottomGlow} />

        <View style={styles.contentRow}>
          <View style={styles.micOuterGlow}>
            <View style={styles.micButton}>
              <AppIcon color={isError ? "#FF7FA0" : isTranscribing ? "#75EFC8" : "#33F6FF"} name="mic" size={29} strokeWidth={2.25} />
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text numberOfLines={1} style={[styles.placeholderText, isError && styles.placeholderTextError]}>
              {placeholder}
            </Text>
            <Text numberOfLines={isError ? 2 : 1} style={[styles.subtext, isError && styles.subtextError]}>
              {subtext}
            </Text>
          </View>

          {onEditPress ? (
            <Pressable
              hitSlop={12}
              onPress={(event) => {
                event.stopPropagation();
                onEditPress();
              }}
              style={styles.editButton}
            >
              <AppIcon color="rgba(232, 244, 255, 0.74)" name="edit" size={26} strokeWidth={1.75} />
            </Pressable>
          ) : (
            <View pointerEvents="none" style={styles.editButton}>
              <AppIcon color="rgba(232, 244, 255, 0.74)" name="edit" size={26} strokeWidth={1.75} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardClip: {
    backgroundColor: "rgba(34, 49, 68, 0.56)",
    borderColor: "rgba(222, 242, 255, 0.56)",
    borderRadius: 38,
    borderWidth: 1,
    minHeight: 82,
    overflow: "hidden",
  },
  cardClipError: {
    backgroundColor: "rgba(54, 18, 36, 0.62)",
    borderColor: "rgba(255, 147, 171, 0.52)",
  },
  cardClipRecording: {
    backgroundColor: "rgba(26, 58, 78, 0.62)",
    borderColor: "rgba(88, 236, 255, 0.62)",
  },
  cardClipTranscribing: {
    backgroundColor: "rgba(25, 58, 52, 0.62)",
    borderColor: "rgba(117, 239, 200, 0.58)",
  },
  contentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 17,
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  copyBlock: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  disabled: {
    opacity: 0.58,
  },
  editButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  innerBottomGlow: {
    backgroundColor: "rgba(61, 206, 255, 0.64)",
    bottom: -2,
    height: 2.5,
    left: 48,
    position: "absolute",
    right: 28,
  },
  innerTopHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    height: 1.2,
    left: 22,
    opacity: 0.65,
    position: "absolute",
    right: 22,
    top: 1,
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "rgba(36, 77, 100, 0.62)",
    borderColor: "rgba(113, 240, 255, 0.56)",
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  micOuterGlow: {
    alignItems: "center",
    backgroundColor: "rgba(73, 206, 255, 0.14)",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    shadowColor: "#36F7FF",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    width: 68,
    elevation: 6,
  },
  mistyWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(178, 205, 238, 0.18)",
  },
  placeholderText: {
    color: "rgba(247, 252, 255, 0.95)",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.2,
    textShadowColor: "rgba(255, 255, 255, 0.28)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  placeholderTextError: {
    color: "rgba(255, 235, 240, 0.96)",
  },
  shadowShell: {
    borderRadius: 38,
    shadowColor: "#8EC8FF",
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  shadowShellPressed: {
    transform: [{ scale: 0.992 }],
  },
  subtext: {
    color: "rgba(220, 232, 244, 0.62)",
    fontSize: 13,
    fontWeight: "700",
  },
  subtextError: {
    color: "rgba(255, 188, 202, 0.86)",
    lineHeight: 17,
  },
});
