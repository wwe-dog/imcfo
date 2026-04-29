import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type ScreenTransitionVariant = "drilldown" | "tab";

interface ScreenTransitionProps {
  animateOnMount?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  transitionKey: string;
  variant?: ScreenTransitionVariant;
}

const getTransitionConfig = (variant: ScreenTransitionVariant) => {
  if (variant === "tab") {
    return {
      duration: 150,
      translateX: 0,
      translateY: 4,
    };
  }

  return {
    duration: 210,
    translateX: 12,
    translateY: 0,
  };
};

export default function ScreenTransition({
  animateOnMount = false,
  children,
  style,
  transitionKey,
  variant = "drilldown",
}: ScreenTransitionProps) {
  const progress = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const previousKey = useRef(transitionKey);
  const shouldAnimateOnMount = useRef(animateOnMount);
  const config = getTransitionConfig(variant);

  useEffect(() => {
    if (previousKey.current === transitionKey && !shouldAnimateOnMount.current) return;
    shouldAnimateOnMount.current = false;
    previousKey.current = transitionKey;
    progress.setValue(0);
    Animated.timing(progress, {
      duration: config.duration,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [config.duration, progress, transitionKey]);

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
    ],
  };

  return <Animated.View style={[styles.container, style, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
