import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

const DOT_COLORS = [
  "rgba(255,93,187,0.85)",
  "rgba(138,92,255,0.85)",
  "rgba(0,210,217,0.85)",
];

export default function AppLoadingScreen() {
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.screen, { minHeight: Math.max(620, height - 94) }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobBottomRight]} />
      </View>
      <View style={styles.center}>
        <Svg height={30} viewBox="0 0 180 30" width={180}>
          <Defs>
            <LinearGradient id="wordmarkGradient" x1="0" x2="1" y1="0.5" y2="0.5">
              <Stop offset="0%" stopColor="#FF5DBB" />
              <Stop offset="34%" stopColor="#8A5CFF" />
              <Stop offset="68%" stopColor="#3B8BFF" />
              <Stop offset="100%" stopColor="#00D2D9" />
            </LinearGradient>
          </Defs>
          <SvgText
            fill="url(#wordmarkGradient)"
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
        <Text style={styles.tagline}>循环增长 · 洞察财务 · 掌控人生</Text>
        <View style={styles.dotRow}>
          {DOT_COLORS.map((color, index) => (
            <LoadingDot color={color} delay={index * 300} key={color} />
          ))}
        </View>
      </View>
    </View>
  );
}

function LoadingDot({ color, delay }: { color: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.25,
          useNativeDriver: true,
        }),
      ]),
    );
    const timer = setTimeout(() => pulse.start(), delay);

    return () => {
      clearTimeout(timer);
      pulse.stop();
      opacity.stopAnimation();
    };
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />;
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#090C1D",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    paddingBottom: 116,
    position: "relative",
  },
  center: {
    alignItems: "center",
    zIndex: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    marginTop: 8,
  },
  dotRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 28,
  },
  dot: {
    borderRadius: 2.5,
    height: 5,
    width: 5,
  },
  blob: {
    borderRadius: 9999,
    position: "absolute",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
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
