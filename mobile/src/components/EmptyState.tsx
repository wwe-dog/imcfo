import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import AppIcon from "./AppIcon";

interface EmptyStateProps {
  illustration: ImageSourcePropType;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

interface EmptyStateScreenProps extends EmptyStateProps {
  screenTitle: string;
  onBack: () => void;
  onCalendarPress?: () => void;
}

const BRAND_GRADIENT = ["#FF5DBB", "#8A5CFF", "#3B8BFF", "#00D2D9"];
const TEXT_PRIMARY = "rgba(255,255,255,0.92)";
const TEXT_SECONDARY = "rgba(255,255,255,0.55)";
const TEXT_TERTIARY = "rgba(255,255,255,0.45)";
const CHINESE_FONT = Platform.select({
  android: "HarmonyOS Sans SC",
  ios: "HarmonyOS Sans SC",
  default: undefined,
});
const LATIN_FONT = Platform.select({
  android: "Inter",
  ios: "Inter",
  default: undefined,
});

export function EmptyStateScreen({
  description,
  illustration,
  onBack,
  onCalendarPress,
  onPrimary,
  onSecondary,
  primaryLabel,
  screenTitle,
  secondaryLabel,
  title,
}: EmptyStateScreenProps) {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.screen, { minHeight: Math.max(620, height - 94) }]}>
      <AmbientBackground />
      <View style={styles.contentLayer}>
        <EmptyStateTopBar onBack={onBack} onCalendarPress={onCalendarPress} title={screenTitle} />
        <View style={styles.emptyCenter}>
          <EmptyState
            description={description}
            illustration={illustration}
            onPrimary={onPrimary}
            onSecondary={onSecondary}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
            title={title}
          />
        </View>
      </View>
    </View>
  );
}

export default function EmptyState({
  description,
  illustration,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
  title,
}: EmptyStateProps) {
  const { width } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const buttonWidth = Math.max(240, width - 48);

  return (
    <View style={styles.container}>
      {imageFailed ? (
        <InfinityPlaceholder />
      ) : (
        <Image
          onError={() => setImageFailed(true)}
          resizeMode="contain"
          source={illustration}
          style={styles.illustration}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable onPress={onPrimary} style={[styles.primaryButton, { width: buttonWidth }]}>
        <Svg height="52" style={StyleSheet.absoluteFill} width={buttonWidth}>
          <Defs>
            <LinearGradient id="emptyStateCta" x1="0" x2="1" y1="0.5" y2="0.5">
              {BRAND_GRADIENT.map((color, index) => (
                <Stop
                  key={color}
                  offset={`${(index / (BRAND_GRADIENT.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect fill="url(#emptyStateCta)" height="52" rx="26" width={buttonWidth} x="0" y="0" />
        </Svg>
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </Pressable>
      {secondaryLabel ? (
        <Pressable disabled={!onSecondary} onPress={onSecondary} style={styles.secondaryLink}>
          <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function EmptyStateTopBar({
  onBack,
  onCalendarPress,
  title,
}: {
  onBack: () => void;
  onCalendarPress?: () => void;
  title: string;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.topBarButton}>
        <AppIcon color="rgba(255,255,255,0.9)" name="back" size={21} strokeWidth={2.4} />
      </Pressable>
      <Text numberOfLines={1} style={styles.topBarTitle}>
        {title}
      </Text>
      <Pressable disabled={!onCalendarPress} onPress={onCalendarPress} style={styles.topBarButton}>
        <AppIcon color="rgba(255,255,255,0.9)" name="calendar" size={20} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function AmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobBottomRight]} />
    </View>
  );
}

function InfinityPlaceholder() {
  return (
    <View style={styles.placeholder}>
      <Svg height={70} viewBox="0 0 140 76" width={128}>
        <Defs>
          <LinearGradient id="placeholderGradient" x1="0" x2="1" y1="0.5" y2="0.5">
            {BRAND_GRADIENT.map((color, index) => (
              <Stop key={color} offset={`${(index / (BRAND_GRADIENT.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Path
          d="M22 38c0-16 11-27 27-27 12 0 21 7 31 20 10-13 19-20 31-20 16 0 27 11 27 27s-11 27-27 27c-12 0-21-7-31-20-10 13-19 20-31 20-16 0-27-11-27-27Z"
          fill="none"
          stroke="url(#placeholderGradient)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={10}
        />
        <Path
          d="M106 20h26v26"
          fill="none"
          stroke="#00D2D9"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={10}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#090C1D",
    marginHorizontal: -18,
    marginTop: -16,
    overflow: "hidden",
    paddingBottom: 116,
    paddingHorizontal: 24,
    paddingTop: 16,
    position: "relative",
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
  emptyCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 28,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
  },
  topBarButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  topBarTitle: {
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    fontFamily: CHINESE_FONT,
    fontSize: 17,
    fontWeight: "500",
    paddingHorizontal: 14,
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    width: "100%",
  },
  illustration: {
    height: 240,
    width: 240,
  },
  title: {
    color: TEXT_PRIMARY,
    fontFamily: CHINESE_FONT,
    fontSize: 24,
    fontWeight: "600",
    marginTop: 32,
    textAlign: "center",
  },
  description: {
    color: TEXT_SECONDARY,
    fontFamily: CHINESE_FONT,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 32,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 9999,
    height: 52,
    justifyContent: "center",
    marginTop: 40,
    overflow: "hidden",
  },
  primaryLabel: {
    color: "rgba(255,255,255,0.95)",
    fontFamily: LATIN_FONT,
    fontSize: 16,
    fontWeight: "500",
  },
  secondaryLink: {
    marginTop: 16,
    minHeight: 32,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  secondaryLabel: {
    color: TEXT_TERTIARY,
    fontFamily: CHINESE_FONT,
    fontSize: 14,
    textAlign: "center",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 60,
    borderWidth: StyleSheet.hairlineWidth,
    height: 120,
    justifyContent: "center",
    marginBottom: 60,
    marginTop: 60,
    width: 120,
  },
  blob: {
    borderRadius: 9999,
    position: "absolute",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  blobTopLeft: {
    backgroundColor: "rgba(0, 210, 217, 0.50)",
    height: 240,
    left: -60,
    opacity: 0.9,
    top: -80,
    width: 240,
  },
  blobBottomRight: {
    backgroundColor: "rgba(255, 93, 187, 0.50)",
    bottom: -70,
    height: 211,
    opacity: 0.85,
    right: -50,
    width: 211,
  },
});
