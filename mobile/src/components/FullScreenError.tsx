import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import AppIcon from "./AppIcon";

interface ErrorAction {
  label: string;
  onPress: () => void;
}

interface FullScreenErrorProps {
  title: string;
  description: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
}

const AMBER = "#fbbf24";
const BRAND_GRADIENT = ["#FF5DBB", "#8A5CFF", "#3B8BFF", "#00D2D9"];

export default function FullScreenError({
  description,
  primaryAction,
  secondaryAction,
  title,
}: FullScreenErrorProps) {
  const { height, width } = useWindowDimensions();
  const buttonWidth = Math.max(240, width - 48);

  return (
    <View style={[styles.screen, { minHeight: height }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobBottomRight]} />
      </View>

      <View style={styles.wordmark}>
        <Svg height={30} viewBox="0 0 180 30" width={180}>
          <Defs>
            <LinearGradient id="fullScreenErrorWordmark" x1="0" x2="1" y1="0.5" y2="0.5">
              {BRAND_GRADIENT.map((color, index) => (
                <Stop key={color} offset={`${(index / (BRAND_GRADIENT.length - 1)) * 100}%`} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <SvgText
            fill="url(#fullScreenErrorWordmark)"
            fontSize={18}
            fontWeight="600"
            letterSpacing={4}
            textAnchor="middle"
            x={90}
            y={22}
          >
            IMCFO
          </SvgText>
        </Svg>
      </View>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <AppIcon color={AMBER} name="warning" size={26} strokeWidth={2.1} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Pressable accessibilityRole="button" onPress={primaryAction.onPress} style={[styles.primaryButton, { width: buttonWidth }]}>
          <Svg height="52" style={StyleSheet.absoluteFill} width={buttonWidth}>
            <Defs>
              <LinearGradient id="fullScreenErrorCta" x1="0" x2="1" y1="0.5" y2="0.5">
                {BRAND_GRADIENT.map((color, index) => (
                  <Stop
                    key={color}
                    offset={`${(index / (BRAND_GRADIENT.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </LinearGradient>
            </Defs>
            <Rect fill="url(#fullScreenErrorCta)" height="52" rx="26" width={buttonWidth} x="0" y="0" />
          </Svg>
          <Text style={styles.primaryLabel}>{primaryAction.label}</Text>
        </Pressable>
        {secondaryAction ? (
          <Pressable accessibilityRole="button" onPress={secondaryAction.onPress} style={styles.secondaryLink}>
            <Text style={styles.secondaryLabel}>{secondaryAction.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    borderRadius: 9999,
    position: "absolute",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 50,
  },
  blobBottomRight: {
    backgroundColor: "rgba(255, 93, 187, 0.50)",
    bottom: -70,
    height: 211,
    opacity: 0.85,
    right: -50,
    width: 211,
  },
  blobTopLeft: {
    backgroundColor: "rgba(0, 210, 217, 0.50)",
    height: 240,
    left: -60,
    opacity: 0.9,
    top: -80,
    width: 240,
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 36,
    zIndex: 1,
  },
  description: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    paddingHorizontal: 32,
    textAlign: "center",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.30)",
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 9999,
    height: 52,
    justifyContent: "center",
    marginTop: 32,
    overflow: "hidden",
  },
  primaryLabel: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "600",
  },
  screen: {
    backgroundColor: "#090C1D",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  secondaryLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
  },
  secondaryLink: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  title: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  wordmark: {
    alignItems: "center",
    left: 0,
    paddingTop: 52,
    position: "absolute",
    right: 0,
    zIndex: 2,
  },
});
