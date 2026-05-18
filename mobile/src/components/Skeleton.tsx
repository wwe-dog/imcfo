import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  type DimensionValue,
  type ViewStyle,
} from "react-native";

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  delay?: number;
  style?: ViewStyle;
}

export default function Skeleton({
  borderRadius = 6,
  delay = 0,
  height,
  style,
  width,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 450,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.72,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 450,
          easing: Easing.inOut(Easing.ease),
          toValue: 0.35,
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

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          borderRadius,
          height,
          opacity,
          width: width as DimensionValue,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
