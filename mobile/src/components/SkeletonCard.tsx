import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Skeleton from "./Skeleton";

export interface SkeletonRowConfig {
  width: number | string;
  height: number;
  borderRadius?: number;
  delay?: number;
  style?: ViewStyle;
}

interface SkeletonCardProps {
  rows?: SkeletonRowConfig[];
  style?: ViewStyle;
  children?: ReactNode;
}

const defaultRows: SkeletonRowConfig[] = [
  { delay: 0, height: 8, width: 50 },
  { delay: 100, height: 26, style: { marginTop: 7 }, width: 140 },
  { delay: 200, height: 8, style: { marginTop: 7 }, width: 90 },
];

export default function SkeletonCard({ children, rows = defaultRows, style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      {rows.map((row, index) => (
        <Skeleton
          borderRadius={row.borderRadius}
          delay={row.delay}
          height={row.height}
          key={`${row.width}-${row.height}-${index}`}
          style={row.style}
          width={row.width}
        />
      ))}
      {children}
    </View>
  );
}

export function SkeletonScreenShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.screenShell, style]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobBottomRight]} />
      </View>
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  screenShell: {
    backgroundColor: "#090C1D",
    marginHorizontal: -18,
    marginTop: -16,
    minHeight: 620,
    overflow: "hidden",
    paddingBottom: 116,
    paddingHorizontal: 24,
    paddingTop: 20,
    position: "relative",
  },
  contentLayer: {
    gap: 16,
    zIndex: 1,
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
