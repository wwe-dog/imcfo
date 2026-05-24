import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

export type ScreenTransitionDirection = "back" | "forward" | "neutral";
export type ScreenTransitionPhase = "enter" | "exit";
export type ScreenTransitionVariant = "drilldown" | "fullscreen" | "modal" | "sheet" | "tab";

interface ScreenTransitionProps {
  animateOnMount?: boolean;
  children: ReactNode;
  direction?: ScreenTransitionDirection;
  phase?: ScreenTransitionPhase;
  style?: StyleProp<ViewStyle>;
  transitionKey: string;
  variant?: ScreenTransitionVariant;
}

const getTransitionConfig = (
  variant: ScreenTransitionVariant,
  direction: ScreenTransitionDirection,
) => {
  if (variant === "tab") {
    return {
      duration: 120,
      scale: 1,
      translateX: 0,
      translateY: 4,
    };
  }

  if (variant === "modal") {
    return {
      duration: 120,
      scale: 0.99,
      translateX: 0,
      translateY: 0,
    };
  }

  if (variant === "sheet") {
    return {
      duration: 160,
      scale: 1,
      translateX: 0,
      translateY: 16,
    };
  }

  if (variant === "fullscreen") {
    return {
      duration: 150,
      scale: 1,
      translateX: 0,
      translateY: 6,
    };
  }

  if (direction === "back") {
    return {
      duration: 140,
      scale: 1,
      translateX: -8,
      translateY: 0,
    };
  }

  if (direction === "neutral") {
    return {
      duration: 120,
      scale: 1,
      translateX: 0,
      translateY: 4,
    };
  }

  return {
    duration: 160,
    scale: 1,
    translateX: 8,
    translateY: 0,
  };
};

export default function ScreenTransition({
  animateOnMount = false,
  children,
  direction = "forward",
  phase = "enter",
  style,
  transitionKey,
  variant = "drilldown",
}: ScreenTransitionProps) {
  const progress = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const previousPhase = useRef(phase);
  const previousKey = useRef(transitionKey);
  const shouldAnimateOnMount = useRef(animateOnMount);
  const config = getTransitionConfig(variant, direction);

  useEffect(() => {
    if (
      previousKey.current === transitionKey &&
      previousPhase.current === phase &&
      !shouldAnimateOnMount.current
    ) {
      return;
    }
    shouldAnimateOnMount.current = false;
    previousPhase.current = phase;
    previousKey.current = transitionKey;
    progress.setValue(phase === "exit" ? 1 : 0);
    Animated.timing(progress, {
      duration: config.duration,
      easing: Easing.out(Easing.cubic),
      toValue: phase === "exit" ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [config.duration, phase, progress, transitionKey]);

  const animatedStyle = {
    opacity: progress,
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [config.translateX, 0],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [config.translateY, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [config.scale, 1],
        }),
      },
    ],
  };

  return <Animated.View style={[styles.container, style, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
