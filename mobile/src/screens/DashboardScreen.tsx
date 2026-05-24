import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Line as SkiaLine,
  RoundedRect,
  Text as SkiaText,
  matchFont,
  rect,
  rrect,
  useFont,
  type SkFont,
  type Transforms3d,
} from "@shopify/react-native-skia";
import Svg, { Defs, LinearGradient, Path as SvgPath, Stop, Text as SvgText } from "react-native-svg";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import Skeleton from "../components/Skeleton";
import SkeletonCard, { SkeletonScreenShell } from "../components/SkeletonCard";
import ScreenTransition from "../components/ScreenTransition";
import type { Asset, Liability, ReportSummary, Transaction } from "../domain/models";
import { useRouteTransition } from "../hooks/useRouteTransition";
import {
  HOME_DASHBOARD_HARDCODED_SPEC,
  resolveHybridSphereGlassMaterial,
  type HomeHubAction,
  type HomeSphereCardRole,
  type HybridSphereGlassMaterial,
} from "./homeDashboardHardcodedSpec";
import OperatingAnalysisReportScreen from "./OperatingAnalysisReportScreen";
import ProfitabilityAnalysisScreen from "./ProfitabilityAnalysisScreen";

interface DashboardScreenProps {
  assets: Asset[];
  isLoading?: boolean;
  liabilities: Liability[];
  onOpenAccounts?: () => void;
  onOpenAssets?: () => void;
  onOpenRecord?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenTransactions?: () => void;
  onScrollEnabledChange?: (enabled: boolean) => void;
  summary: ReportSummary;
  transactions: Transaction[];
}

type DashboardRoute = "home" | "operationAnalysisReport" | "profitabilityAnalysis";
type HubAction = HomeHubAction;

const getDashboardRouteKey = (route: DashboardRoute): string => `dashboard-${route}`;
const getDashboardRouteDepth = (route: DashboardRoute): number =>
  route === "home" ? 0 : route === "operationAnalysisReport" ? 1 : 2;

const REFERENCE_VIEWPORT_WIDTH = HOME_DASHBOARD_HARDCODED_SPEC.referenceViewport.width;
const REFERENCE_VIEWPORT_HEIGHT = HOME_DASHBOARD_HARDCODED_SPEC.referenceViewport.height;
const TAP_MOVEMENT_THRESHOLD = HOME_DASHBOARD_HARDCODED_SPEC.interaction.tapMovementThreshold;
const PROTOTYPE_DRAG_FACTOR = HOME_DASHBOARD_HARDCODED_SPEC.interaction.dragFactor;
const PROTOTYPE_CARD_SIZE = HOME_DASHBOARD_HARDCODED_SPEC.sphere.cardSize;
const PROTOTYPE_CENTER_CARD_HEIGHT = HOME_DASHBOARD_HARDCODED_SPEC.sphere.centerCardHeight;
const PROTOTYPE_CENTER_CARD_WIDTH = HOME_DASHBOARD_HARDCODED_SPEC.sphere.centerCardWidth;
const PROTOTYPE_EXPANDED_ZOOM = HOME_DASHBOARD_HARDCODED_SPEC.sphere.expandedZoom;
const PROTOTYPE_RADIUS_FACTOR = HOME_DASHBOARD_HARDCODED_SPEC.sphere.radiusFactor;
const PROTOTYPE_PERSPECTIVE = HOME_DASHBOARD_HARDCODED_SPEC.sphere.perspective;
const PROTOTYPE_DEPTH_PROJECTION = HOME_DASHBOARD_HARDCODED_SPEC.sphere.depthProjection;
const PROTOTYPE_INITIAL_ROT_X: number = HOME_DASHBOARD_HARDCODED_SPEC.sphere.initialRotX;
const PROTOTYPE_INITIAL_ROT_Y: number = HOME_DASHBOARD_HARDCODED_SPEC.sphere.initialRotY;
const PROTOTYPE_INERTIA_DAMPING = HOME_DASHBOARD_HARDCODED_SPEC.interaction.dragDamping;
const PROTOTYPE_MAX_ROT_X = HOME_DASHBOARD_HARDCODED_SPEC.interaction.maxRotX;
const PROTOTYPE_MIN_ROT_X = HOME_DASHBOARD_HARDCODED_SPEC.interaction.minRotX;
const PROTOTYPE_STOP_SPEED = HOME_DASHBOARD_HARDCODED_SPEC.interaction.stopSpeed;
const PROTOTYPE_COLLAPSED_IDLE_STEP = HOME_DASHBOARD_HARDCODED_SPEC.interaction.collapsedIdleStep;
const PROTOTYPE_EXPANDED_IDLE_STEP = HOME_DASHBOARD_HARDCODED_SPEC.interaction.expandedIdleStep;
const EXPAND_TRANSITION_DURATION_MS = HOME_DASHBOARD_HARDCODED_SPEC.interaction.expandDurationMs;
const TAP_MAX_DURATION_MS = HOME_DASHBOARD_HARDCODED_SPEC.interaction.tapMaxDurationMs;
const NOTO_SANS_SC_FONT = require("../../assets/fonts/NotoSansSC-Regular.otf");

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
};

interface FunctionNode {
  action: HubAction;
  accent: string;
  glow: string;
  icon: AppIconName;
  id: string;
  label: string;
}

interface VisualNode {
  accent: string;
  action?: HubAction;
  glow: string;
  icon: AppIconName;
  id: string;
  label: string;
}

const functionNodes = HOME_DASHBOARD_HARDCODED_SPEC.sphere.functionNodes as readonly FunctionNode[];

const actionableModuleByPrototypeLabel: Record<string, FunctionNode> = {
  Account: functionNodes[1],
  Analysis: functionNodes[5],
  Assets: functionNodes[2],
  Forecast: functionNodes[6],
  Liabilities: functionNodes[2],
  Profile: functionNodes[7],
  Reports: functionNodes[4],
  Settings: functionNodes[7],
  Transactions: functionNodes[3],
  "Voice AI Input": functionNodes[0],
};

const functionNodeByAction = functionNodes.reduce<Record<HubAction, FunctionNode>>((map, node) => {
  map[node.action] = node;
  return map;
}, {} as Record<HubAction, FunctionNode>);

const createActionableVisualNode = (node: FunctionNode): VisualNode => ({
  accent: node.accent,
  action: node.action,
  glow: node.glow,
  icon: node.icon,
  id: node.id,
  label: node.label,
});

const createDecorativeVisualNode = (node: FunctionNode | VisualNode, id: string): VisualNode => ({
  accent: node.accent,
  glow: node.glow,
  icon: node.icon,
  id,
  label: "",
});

const supportBodyCardIds = HOME_DASHBOARD_HARDCODED_SPEC.sphere.supportBodyCardIds as readonly string[];

const getSphereCardRole = (card: OrbitCard): HomeSphereCardRole => {
  if (card.isPrimary) {
    return "centerHero";
  }

  if (card.visualNode.action) {
    return "mainFront";
  }

  return supportBodyCardIds.includes(card.id) ? "supportBody" : "ghost";
};

const getSphereCardScaleMultiplier = (role: HomeSphereCardRole) => {
  "worklet";

  if (role === "ghost") {
    return 0.94;
  }

  if (role === "supportBody") {
    return 0.98;
  }

  return 1;
};

const decorativeModuleByPrototypeLabel: Record<string, VisualNode> = {
  "Cash Flow": { accent: "#B8FF7C", glow: "rgba(184,255,124,0.24)", icon: "cashFlow", id: "decor-cash-flow", label: "" },
  Forecast: { accent: "#F9A8D4", glow: "rgba(249,168,212,0.2)", icon: "chart", id: "decor-forecast", label: "" },
  Insights: { accent: "#FDE68A", glow: "rgba(253,230,138,0.2)", icon: "data", id: "decor-insights", label: "" },
  Investments: { accent: "#8DF7FF", glow: "rgba(141,247,255,0.18)", icon: "securities", id: "decor-investments", label: "" },
  Projects: { accent: "#B59CFF", glow: "rgba(181,156,255,0.18)", icon: "manage", id: "decor-projects", label: "" },
  Reconciliation: { accent: "#C4F7FF", glow: "rgba(196,247,255,0.2)", icon: "reconcile", id: "decor-reconciliation", label: "" },
  Safeguards: { accent: "#A7F3D0", glow: "rgba(167,243,208,0.2)", icon: "success", id: "decor-safeguards", label: "" },
};

type CapturedCardTuple = readonly [
  index: number,
  prototypeLabel: string,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number,
  zIndex: number,
  className: string,
];

interface CapturedRect {
  centerX: number;
  centerY: number;
  height: number;
  opacity?: number;
  width: number;
  x: number;
  y: number;
}

interface OrbitCard {
  id: string;
  isPrimary: boolean;
  index: number;
  moduleName: string;
  point: {
    x: number;
    y: number;
    z: number;
  };
  visualNode: VisualNode;
}

interface ProjectedSphereCard {
  centerX: number;
  centerY: number;
  depth: number;
  height: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  width: number;
}

interface SkiaSphereProjection {
  labelOpacity: number;
  material: HybridSphereGlassMaterial;
  opacity: number;
  transform: Transforms3d;
}

interface SphereGestureState {
  downX: number;
  downY: number;
  grantAt: number;
  lastMoveAt: number;
  lastX: number;
  lastY: number;
  moved: boolean;
}

const capturedPrototypeGeometry = {
  collapsed: {
    logo: { x: 157.13, y: 91, width: 205.73, height: 61, centerX: 259.99, centerY: 121.5, opacity: 1 },
    sphereContainer: { x: 45, y: 357.5, width: 430, height: 430, centerX: 260, centerY: 572.5, opacity: 1 },
    hint: { x: 142.44, y: 803.5, width: 235.13, height: 20, centerX: 260, centerY: 813.5, opacity: 1 },
    cards: [
      [0, "Reports", 210.72, 574.24, 19.51, 19.51, 0.680334, 25, "sphere-card is-back"],
      [1, "Reconciliation", 265.17, 551.91, 19.65, 19.65, 0.682874, 29, "sphere-card is-back"],
      [2, "Safeguards", 286.66, 604.58, 20.59, 20.59, 0.678707, 98, "sphere-card is-back"],
      [3, "Profile", 243.74, 495.33, 20.51, 20.51, 0.66751, 100, "sphere-card is-back"],
      [4, "Assets", 189.52, 518.37, 20.99, 20.99, 0.663734, 133, "sphere-card is-back"],
      [5, "Analysis", 233.83, 626.98, 21.19, 21.19, 0.671754, 141, "sphere-card is-back"],
      [6, "Cash Flow", 315, 526.67, 21.48, 21.48, 0.666327, 163, "sphere-card is-back"],
      [7, "Projects", 338.75, 580.67, 22.5, 22.5, 0.663332, 237, "sphere-card is-back"],
      [8, "Transactions", 159.06, 597.32, 22.46, 22.46, 0.661082, 238, "sphere-card is-back"],
      [9, "Liabilities", 288.14, 468.14, 23.47, 23.47, 0.664621, 300, "sphere-card is-back"],
      [10, "Forecast", 187.01, 656.23, 23.77, 23.77, 0.659514, 329, "sphere-card is-back"],
      [11, "Account", 296.75, 658.84, 23.99, 23.99, 0.662719, 338, "sphere-card is-back"],
      [12, "Settings", 136.02, 539.65, 24.1, 24.1, 0.660948, 348, "sphere-card is-back"],
      [13, "Insights", 182.12, 458.62, 24.82, 24.82, 0.660294, 394, "sphere-card is-back"],
      [14, "Forecast", 352.59, 493.48, 25.56, 25.56, 0.661353, 438, "sphere-card is-back"],
      [15, "Investments", 244.96, 684.33, 25.75, 25.75, 0.66208, 449, "sphere-card is-back"],
      [16, "Investments", 235.29, 430.73, 25.67, 25.67, 0.658389, 450, "sphere-card is-back"],
      [17, "Settings", 349.98, 635.09, 25.77, 25.77, 0.660172, 453, "sphere-card is-back"],
      [18, "Insights", 382.36, 550.71, 26.89, 26.89, 0.658726, 521, "sphere-card is-back"],
      [19, "Liabilities", 120.09, 625.62, 27.68, 27.68, 0.656497, 569, "sphere-card is-back"],
      [20, "Projects", 127.85, 479.67, 27.79, 27.79, 0.657399, 574, "sphere-card is-back"],
      [21, "Transactions", 308.69, 424.78, 29.07, 29.07, 0.657624, 644, "sphere-card is-back"],
      [22, "Account", 91.48, 564.01, 29.79, 29.79, 0.654161, 686, "sphere-card is-back"],
      [23, "Cash Flow", 164.2, 692.43, 30.01, 30.01, 0.651403, 701, "sphere-card is-back"],
      [24, "Assets", 395.93, 607.17, 30.67, 30.67, 0.651453, 735, "sphere-card is-back"],
      [25, "Transactions", 332.52, 691.99, 31.08, 31.08, 0.650743, 756, "sphere-card"],
      [26, "Analysis", 364.43, 448.4, 31.48, 31.48, 0.651325, 776, "sphere-card"],
      [27, "Liabilities", 267.59, 717.76, 31.72, 31.72, 0.650942, 788, "sphere-card"],
      [28, "Forecast", 220.81, 391.66, 32.54, 32.54, 0.649613, 830, "sphere-card"],
      [29, "Cash Flow", 151.71, 417.49, 32.87, 32.87, 0.650429, 845, "sphere-card"],
      [30, "Investments", 407.89, 510.57, 33.46, 33.46, 0.646841, 876, "sphere-card"],
      [31, "Safeguards", 81.57, 501.06, 34.03, 34.03, 0.648766, 901, "sphere-card"],
      [32, "Profile", 107.65, 663.26, 34.49, 34.49, 0.646747, 924, "sphere-card"],
      [33, "Voice AI Input", 210.95, 723.87, 35.27, 35.27, 0.650057, 957, "sphere-card"],
      [34, "Reports", 382.58, 665.89, 35.87, 35.87, 0.642109, 991, "sphere-card"],
      [35, "Safeguards", 318.13, 389.66, 37.15, 37.15, 0.642257, 1047, "sphere-card"],
      [36, "Investments", 66.28, 596.02, 37.6, 37.6, 0.64496, 1064, "sphere-card"],
      [37, "Profile", 425.17, 569.82, 38.46, 38.46, 0.639719, 1104, "sphere-card"],
      [38, "Reconciliation", 101.31, 436.91, 38.89, 38.89, 0.645825, 1118, "sphere-card"],
      [39, "Assets", 148.63, 712.4, 39.93, 39.93, 0.643933, 1162, "sphere-card"],
      [40, "Analysis", 320.01, 723.85, 40.28, 40.28, 0.637365, 1181, "sphere-card"],
      [41, "Insights", 247.96, 363.43, 40.81, 40.81, 0.638925, 1201, "sphere-card"],
      [42, "Account", 403.67, 458.52, 40.85, 40.85, 0.638924, 1203, "sphere-card"],
      [43, "Profile", 172.38, 380.93, 41.28, 41.28, 0.647375, 1214, "sphere-card"],
      [44, "Analysis", 53.47, 528.62, 43.08, 43.08, 0.64658, 1284, "sphere-card"],
      [45, "Account", 251.41, 736.89, 43.85, 43.85, 0.647262, 1313, "sphere-card"],
      [46, "Reconciliation", 412.73, 631.81, 44.59, 44.59, 0.639015, 1346, "sphere-card"],
      [47, "Settings", 360.27, 400.66, 45.24, 45.24, 0.639712, 1369, "sphere-card"],
      [48, "Insights", 72.35, 638.62, 45.68, 45.68, 0.64963, 1379, "sphere-card"],
      [49, "Liabilities", 426.87, 519.35, 48.06, 48.06, 0.644211, 1466, "sphere-card is-front"],
      [50, "Reports", 72.73, 460.11, 48.62, 48.62, 0.657955, 1478, "sphere-card is-front"],
      [51, "Safeguards", 356.05, 688.97, 48.64, 48.64, 0.657995, 1479, "sphere-card is-front"],
      [52, "Projects", 117.13, 689.32, 49.77, 49.77, 0.661324, 1515, "sphere-card is-front"],
      [53, "Reconciliation", 277.6, 365.63, 49.99, 49.99, 0.657525, 1525, "sphere-card is-front"],
      [54, "Assets", 125.15, 390.33, 51.12, 51.12, 0.652128, 1565, "sphere-card is-front"],
      [55, "Forecast", 54.71, 567.14, 53.4, 53.4, 0.675696, 1627, "sphere-card is-front"],
      [56, "Reports", 204.36, 727.64, 54.01, 54.01, 0.668268, 1649, "sphere-card is-front"],
      [57, "Cash Flow", 404.21, 582.51, 55.46, 55.46, 0.686624, 1685, "sphere-card is-front"],
      [58, "Transactions", 386.42, 461.89, 55.89, 55.89, 0.689191, 1697, "sphere-card is-front"],
      [59, "Projects", 205.56, 366.52, 56.46, 56.46, 0.681258, 1718, "sphere-card is-front"],
      [60, "Settings", 282.29, 711.67, 57.1, 57.1, 0.691058, 1733, "sphere-card is-front"],
      [61, "Reports", 329.75, 403.42, 58.05, 58.05, 0.700506, 1757, "sphere-card is-front"],
      [62, "Projects", 355.76, 648.44, 60.36, 60.36, 0.718531, 1816, "sphere-card is-front"],
      [63, "Transactions", 67.35, 491.01, 61.29, 61.29, 0.709712, 1845, "sphere-card is-front"],
      [64, "Cash Flow", 83.28, 621.04, 62.46, 62.46, 0.720022, 1873, "sphere-card is-front"],
      [65, "Reconciliation", 147.28, 679.52, 63.45, 63.45, 0.733079, 1895, "sphere-card is-front"],
      [66, "Settings", 125.53, 418.67, 63.8, 63.8, 0.736577, 1903, "sphere-card is-front"],
      [67, "Forecast", 367.43, 522.97, 66.25, 66.25, 0.779148, 1952, "sphere-card is-front"],
      [68, "Safeguards", 237.5, 401.35, 67.81, 67.81, 0.790626, 1988, "sphere-card is-front"],
      [69, "Assets", 248.4, 664.76, 69.4, 69.4, 0.812095, 2021, "sphere-card is-front"],
      [70, "Analysis", 302.64, 457.48, 71.79, 71.79, 0.852099, 2066, "sphere-card is-front"],
      [71, "Insights", 314.22, 592.2, 72.49, 72.49, 0.863303, 2079, "sphere-card is-front"],
      [72, "Liabilities", 109.03, 541.51, 72.36, 72.36, 0.847375, 2081, "sphere-card is-front"],
      [73, "Account", 169.07, 464.37, 75.29, 75.29, 0.901649, 2133, "sphere-card is-front"],
      [74, "Profile", 179.49, 603.59, 76.01, 76.01, 0.914832, 2145, "sphere-card is-front"],
      [75, "Investments", 242.2, 526.1, 79.07, 79.07, 0.949864, 2195, "sphere-card is-front"],
    ] as readonly CapturedCardTuple[],
  },
  expanded: {
    logo: { x: 157.13, y: 91, width: 205.73, height: 61, centerX: 259.99, centerY: 121.5, opacity: 1 },
    sphereContainer: { x: 45, y: 357.5, width: 430, height: 430, centerX: 260, centerY: 572.5, opacity: 1 },
    hint: { x: 104.17, y: 857.5, width: 311.66, height: 20, centerX: 260, centerY: 867.5, opacity: 0.56 },
    cards: [
      [0, "Projects", 254.61, 582.92, 23.71, 23.71, 0.741891, 17, "sphere-card is-back"],
      [1, "Cash Flow", 226.22, 520.13, 24.25, 24.25, 0.74326, 53, "sphere-card is-back"],
      [2, "Insights", 315.53, 551.56, 24.72, 24.72, 0.736325, 90, "sphere-card is-back"],
      [3, "Safeguards", 192.23, 610.32, 25.2, 25.2, 0.733823, 121, "sphere-card is-back"],
      [4, "Forecast", 282.93, 486.71, 25.36, 25.36, 0.72914, 134, "sphere-card is-back"],
      [5, "Reconciliation", 164.09, 546.74, 25.73, 25.73, 0.729058, 157, "sphere-card is-back"],
      [6, "Settings", 281.4, 643.87, 25.7, 25.7, 0.724003, 159, "sphere-card is-back"],
      [7, "Assets", 343.98, 612.61, 26.73, 26.73, 0.722095, 232, "sphere-card is-back"],
      [8, "Account", 221.18, 673.6, 27.45, 27.45, 0.72345, 277, "sphere-card is-back"],
      [9, "Liabilities", 209.85, 450.09, 27.52, 27.52, 0.724998, 279, "sphere-card is-back"],
      [10, "Profile", 145.97, 476.37, 27.8, 27.8, 0.720054, 306, "sphere-card is-back"],
      [11, "Investments", 365.75, 511.76, 28.01, 28.01, 0.721577, 316, "sphere-card is-back"],
      [12, "Analysis", 137.7, 638.6, 29.13, 29.13, 0.724255, 382, "sphere-card is-back"],
      [13, "Analysis", 321.31, 440.85, 29.12, 29.12, 0.721617, 385, "sphere-card is-back"],
      [14, "Reports", 101.16, 572.47, 29.16, 29.16, 0.718877, 392, "sphere-card is-back"],
      [15, "Profile", 399.32, 574.69, 30.42, 30.42, 0.718333, 467, "sphere-card is-back"],
      [16, "Transactions", 259.31, 405.6, 30.76, 30.76, 0.721828, 482, "sphere-card is-back"],
      [17, "Transactions", 290.94, 707.69, 30.83, 30.83, 0.718777, 491, "sphere-card is-back"],
      [18, "Reports", 355.34, 675.25, 31.2, 31.2, 0.717257, 514, "sphere-card is-back"],
      [19, "Assets", 84.55, 500.04, 32.09, 32.09, 0.715929, 564, "sphere-card is-back"],
      [20, "Investments", 176.42, 707.58, 32.42, 32.42, 0.71972, 577, "sphere-card is-back"],
      [21, "Investments", 166.53, 398.45, 32.97, 32.97, 0.7145, 613, "sphere-card is-back"],
      [22, "Account", 392.55, 459.77, 33.28, 33.28, 0.713976, 630, "sphere-card is-back"],
      [23, "Forecast", 98.65, 677.6, 34.96, 34.96, 0.709853, 721, "sphere-card is-back"],
      [24, "Reconciliation", 413.48, 638.41, 35.22, 35.22, 0.709401, 734, "sphere-card is-back"],
      [25, "Liabilities", 231.84, 743.58, 35.8, 35.8, 0.712156, 759, "sphere-card"],
      [26, "Transactions", 55.08, 601.93, 35.96, 35.96, 0.709352, 770, "sphere-card"],
      [27, "Insights", 99.46, 423.8, 36.31, 36.31, 0.710052, 786, "sphere-card"],
      [28, "Safeguards", 306.38, 372.23, 36.31, 36.31, 0.71004, 786, "sphere-card"],
      [29, "Liabilities", 436.61, 525.58, 36.52, 36.52, 0.707093, 799, "sphere-card"],
      [30, "Analysis", 321.35, 742.41, 38.56, 38.56, 0.703734, 897, "sphere-card"],
      [31, "Settings", 376.04, 395.63, 39.11, 39.11, 0.702914, 922, "sphere-card"],
      [32, "Settings", 35.48, 524.39, 39.59, 39.59, 0.705097, 941, "sphere-card"],
      [33, "Forecast", 188.11, 352.2, 40.05, 40.05, 0.705958, 961, "sphere-card"],
      [34, "Safeguards", 384.62, 700.25, 41.82, 41.82, 0.708703, 1034, "sphere-card"],
      [35, "Cash Flow", 445.33, 589.44, 42.69, 42.69, 0.708126, 1071, "sphere-card"],
      [36, "Cash Flow", 108.25, 724.84, 42.79, 42.79, 0.70024, 1081, "sphere-card"],
      [37, "Projects", 48.65, 444.23, 44.02, 44.02, 0.702693, 1129, "sphere-card"],
      [38, "Transactions", 434.23, 466.79, 44.21, 44.21, 0.707503, 1133, "sphere-card"],
      [39, "Insights", 257.65, 330.3, 44.55, 44.55, 0.699267, 1152, "sphere-card"],
      [40, "Liabilities", 37.22, 640.31, 44.72, 44.72, 0.700835, 1158, "sphere-card"],
      [41, "Cash Flow", 110.12, 369.65, 46.55, 46.55, 0.704166, 1226, "sphere-card"],
      [42, "Account", 273.59, 764.53, 46.75, 46.75, 0.705957, 1233, "sphere-card"],
      [43, "Reconciliation", 325.25, 345.17, 48.94, 48.94, 0.705558, 1314, "sphere-card"],
      [44, "Projects", 426.74, 657.49, 49.38, 49.38, 0.707846, 1328, "sphere-card"],
      [45, "Account", 11.61, 555.93, 49.81, 49.81, 0.704591, 1346, "sphere-card"],
      [46, "Reports", 399.33, 399.95, 50.01, 50.01, 0.708582, 1350, "sphere-card"],
      [47, "Forecast", 454.4, 530.26, 51.88, 51.88, 0.711506, 1414, "sphere-card"],
      [48, "Profile", 180.12, 333.76, 52, 52, 0.713756, 1416, "sphere-card"],
      [49, "Profile", 63.08, 690.81, 52.74, 52.74, 0.709127, 1444, "sphere-card"],
      [50, "Assets", 145.09, 749.41, 53.37, 53.37, 0.712549, 1464, "sphere-card is-front"],
      [51, "Settings", 356.84, 729.76, 53.62, 53.62, 0.713129, 1472, "sphere-card is-front"],
      [52, "Safeguards", 25.25, 469.23, 55.21, 55.21, 0.717361, 1521, "sphere-card is-front"],
      [53, "Reconciliation", 81.46, 388.06, 57.63, 57.63, 0.728087, 1592, "sphere-card is-front"],
      [54, "Reports", 273.6, 757.02, 59.07, 59.07, 0.726576, 1637, "sphere-card is-front"],
      [55, "Insights", 434.75, 600.82, 60.15, 60.15, 0.736895, 1665, "sphere-card is-front"],
      [56, "Investments", 26.05, 600.2, 60.74, 60.74, 0.73996, 1681, "sphere-card is-front"],
      [57, "Projects", 286.05, 334.48, 60.67, 60.67, 0.734098, 1681, "sphere-card is-front"],
      [58, "Analysis", 424.09, 459.03, 60.83, 60.83, 0.740439, 1683, "sphere-card is-front"],
      [59, "Assets", 372.79, 679.7, 65.07, 65.07, 0.764499, 1793, "sphere-card is-front"],
      [60, "Safeguards", 358.54, 387.12, 65.15, 65.15, 0.765102, 1795, "sphere-card is-front"],
      [61, "Projects", 159.38, 720.82, 65.83, 65.83, 0.780132, 1808, "sphere-card is-front"],
      [62, "Assets", 177.46, 340.79, 65.74, 65.74, 0.75979, 1814, "sphere-card is-front"],
      [63, "Insights", 82.07, 658.02, 68.01, 68.01, 0.795648, 1860, "sphere-card is-front"],
      [64, "Analysis", 41.75, 506.85, 68.04, 68.04, 0.796005, 1861, "sphere-card is-front"],
      [65, "Reports", 99.34, 418.51, 70.77, 70.77, 0.827225, 1920, "sphere-card is-front"],
      [66, "Investments", 398.79, 529.16, 71.62, 71.62, 0.825149, 1942, "sphere-card is-front"],
      [67, "Reconciliation", 256.76, 703.47, 73.21, 73.21, 0.835607, 1978, "sphere-card is-front"],
      [68, "Settings", 236.03, 383.65, 76.46, 76.46, 0.877512, 2041, "sphere-card is-front"],
      [69, "Profile", 334.87, 612.77, 77.86, 77.86, 0.902165, 2066, "sphere-card is-front"],
      [70, "Forecast", 101.35, 561.37, 78.37, 78.37, 0.928285, 2069, "sphere-card is-front"],
      [71, "Account", 323.07, 450.98, 78.79, 78.79, 0.916378, 2083, "sphere-card is-front"],
      [72, "Cash Flow", 182.6, 633.3, 82.03, 82.03, 0.959767, 2142, "sphere-card is-front"],
      [73, "Transactions", 158.58, 463.63, 83.62, 83.62, 0.98, 2168, "sphere-card is-front"],
      [74, "Liabilities", 252.79, 535.39, 85.98, 85.98, 0.98, 2200, "sphere-card is-front"],
      [75, "Voice AI Input", 193.92, 514.68, 132.16, 115.64, 1, 4000, "sphere-card is-center is-front"],
    ] as readonly CapturedCardTuple[],
  },
} as const;

export default function DashboardScreen({
  assets,
  isLoading = false,
  liabilities,
  onOpenAccounts,
  onOpenAssets,
  onOpenRecord,
  onOpenReports,
  onOpenSettings,
  onOpenTransactions,
  onScrollEnabledChange,
  summary,
  transactions,
}: DashboardScreenProps) {
  const { direction, goBack, navigate, route, transitionKey } = useRouteTransition<DashboardRoute>(
    "home",
    getDashboardRouteKey,
    getDashboardRouteDepth,
  );

  useEffect(() => {
    onScrollEnabledChange?.(route !== "home");

    return () => {
      onScrollEnabledChange?.(true);
    };
  }, [onScrollEnabledChange, route]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (route === "operationAnalysisReport") {
    return (
      <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
        <OperatingAnalysisReportScreen
          assets={assets}
          liabilities={liabilities}
          onBack={() => goBack("home")}
          onOpenRecord={onOpenRecord}
          onOpenProfitabilityAnalysis={() => navigate("profitabilityAnalysis")}
          period={summary.period}
          transactions={transactions}
        />
      </ScreenTransition>
    );
  }

  if (route === "profitabilityAnalysis") {
    return (
      <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
        <ProfitabilityAnalysisScreen
          onBack={() => goBack("operationAnalysisReport")}
          period={summary.period}
          transactions={transactions}
        />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
    <FuturisticDashboardHome
      onOpenAccounts={onOpenAccounts}
      onOpenAssets={onOpenAssets}
      onOpenOperationReport={() => navigate("operationAnalysisReport")}
      onOpenProfitabilityAnalysis={() => navigate("profitabilityAnalysis")}
      onOpenRecord={onOpenRecord}
      onOpenReports={onOpenReports}
      onOpenSettings={onOpenSettings}
      onOpenTransactions={onOpenTransactions}
    />
    </ScreenTransition>
  );
}

function DashboardSkeleton() {
  return (
    <SkeletonScreenShell style={styles.dashboardSkeletonShell}>
      <View style={styles.dashboardSkeletonHeader}>
        <Svg height={28} viewBox="0 0 156 28" width={156}>
          <Defs>
            <LinearGradient id="dashboardSkeletonWordmark" x1="0" x2="1" y1="0.5" y2="0.5">
              <Stop offset="0%" stopColor="#FF5DBB" />
              <Stop offset="34%" stopColor="#8A5CFF" />
              <Stop offset="68%" stopColor="#3B8BFF" />
              <Stop offset="100%" stopColor="#00D2D9" />
            </LinearGradient>
          </Defs>
          <SvgText
            fill="url(#dashboardSkeletonWordmark)"
            fontSize={18}
            fontWeight="600"
            letterSpacing={4}
            textAnchor="middle"
            x={78}
            y={21}
          >
            IMCFO
          </SvgText>
        </Svg>
      </View>

      <Skeleton borderRadius={9999} delay={0} height={44} width="100%" />

      <SkeletonCard
        rows={[
          { delay: 0, height: 8, width: 50 },
          { delay: 100, height: 26, style: { marginTop: 7 }, width: 140 },
          { delay: 200, height: 8, style: { marginTop: 7 }, width: 90 },
        ]}
      >
        <View style={styles.dashboardSkeletonDivider} />
        <View style={styles.dashboardSkeletonStats}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.dashboardSkeletonStat}>
              <Skeleton delay={300 + item * 100} height={8} width="68%" />
              <Skeleton delay={380 + item * 100} height={13} style={styles.dashboardSkeletonStatValue} width="84%" />
            </View>
          ))}
        </View>
      </SkeletonCard>

      <SkeletonCard
        rows={[
          { delay: 0, height: 8, width: 56 },
          { delay: 120, height: 12, style: { marginTop: 12 }, width: "88%" },
          { delay: 220, height: 12, style: { marginTop: 8 }, width: "72%" },
        ]}
      />
    </SkeletonScreenShell>
  );
}

function FuturisticDashboardHome({
  onOpenAccounts,
  onOpenAssets,
  onOpenOperationReport,
  onOpenProfitabilityAnalysis,
  onOpenRecord,
  onOpenReports,
  onOpenSettings,
  onOpenTransactions,
}: {
  onOpenAccounts?: () => void;
  onOpenAssets?: () => void;
  onOpenOperationReport: () => void;
  onOpenProfitabilityAnalysis: () => void;
  onOpenRecord?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenTransactions?: () => void;
}) {
  const { height, width } = useWindowDimensions();
  const [isHubExpanded, setIsHubExpanded] = useState(false);

  const handleExpandHub = useCallback(() => {
    setIsHubExpanded(true);
  }, []);

  const handleCollapseHub = useCallback(() => {
    setIsHubExpanded(false);
  }, []);

  const handleHubAction = useCallback((node: FunctionNode) => {
    switch (node.action) {
      case "accounts":
        onOpenAccounts?.();
        return;
      case "assets":
        onOpenAssets?.();
        return;
      case "operation":
        onOpenOperationReport();
        return;
      case "profitability":
        onOpenProfitabilityAnalysis();
        return;
      case "record":
        onOpenRecord?.();
        return;
      case "reports":
        onOpenReports?.();
        return;
      case "settings":
        onOpenSettings?.();
        return;
      case "transactions":
        onOpenTransactions?.();
        return;
    }
  }, [
    onOpenAccounts,
    onOpenAssets,
    onOpenOperationReport,
    onOpenProfitabilityAnalysis,
    onOpenRecord,
    onOpenReports,
    onOpenSettings,
    onOpenTransactions,
  ]);

  const geometryScale = width / REFERENCE_VIEWPORT_WIDTH;
  const contentHeight = REFERENCE_VIEWPORT_HEIGHT * geometryScale;

  return (
    <View style={[styles.root, { minHeight: Math.max(690, height - 128, contentHeight * 0.76) }]}>
      <TechSpaceBackground height={Math.max(720, height, contentHeight)} width={width} />
      {isHubExpanded ? <Pressable onPress={handleCollapseHub} style={styles.collapseLayer} /> : null}
      <CapturedGeometryLayer
        isExpanded={isHubExpanded}
        onCollapse={handleCollapseHub}
        onExpand={handleExpandHub}
        onPressNode={handleHubAction}
        scale={geometryScale}
      />
    </View>
  );
}

function TechSpaceBackground({ height, width }: { height: number; width: number }) {
  const hexPaths = useMemo(() => {
    const size = 84;
    const hexHeight = Math.sqrt(3) * size;
    const rows = Math.ceil(height / (hexHeight * 0.5)) + 3;
    const columns = Math.ceil(width / (size * 1.5)) + 3;
    const result: string[] = [];

    for (let row = -1; row < rows; row += 1) {
      for (let column = -1; column < columns; column += 1) {
        const cx = column * size * 1.5 + (row % 2 ? size * 0.75 : 0);
        const cy = row * hexHeight * 0.5;
        const points = Array.from({ length: 6 }, (_, pointIndex) => {
          const angle = (Math.PI / 3) * pointIndex + Math.PI / 6;
          return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
        });
        result.push(`M ${points.join(" L ")} Z`);
      }
    }

    return result;
  }, [height, width]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height={height} pointerEvents="none" style={StyleSheet.absoluteFill} width={width}>
        {hexPaths.map((path, index) => (
          <SvgPath key={`hex-${index}`} d={path} fill="none" opacity={0.1} stroke="#626872" strokeWidth={0.9} />
        ))}
        <SvgPath d={`M 0 0 H ${width} V ${height} H 0 Z`} fill="rgba(0,0,0,0.18)" />
      </Svg>
    </View>
  );
}

function MetallicLogo({ geometry, scale }: { geometry: CapturedRect; scale: number }) {
  const logoTypeStyle = {
    fontSize: 48 * scale,
    letterSpacing: 9.6 * scale,
    lineHeight: 61 * scale,
  };

  return (
    <View
      pointerEvents="none"
      style={[
        styles.logoWrap,
        {
          height: geometry.height * scale,
          left: geometry.x * scale,
          minWidth: 0,
          top: geometry.y * scale,
          width: geometry.width * scale,
        },
      ]}
    >
      <Text maxFontSizeMultiplier={1} style={[styles.logoShadow, logoTypeStyle, { top: 4 * scale }]}>
        IMCFO
      </Text>
      <Text maxFontSizeMultiplier={1} style={[styles.logoText, logoTypeStyle]}>
        IMCFO
      </Text>
      <Text maxFontSizeMultiplier={1} style={[styles.logoHighlight, logoTypeStyle, { top: -1 * scale }]}>
        IMCFO
      </Text>
    </View>
  );
}

function createPrototypeOrbitCards(): OrbitCard[] {
  const usedActions = new Set<HubAction>();

  return HOME_DASHBOARD_HARDCODED_SPEC.sphere.cards.map((cardSpec, index): OrbitCard => {
    const isPrimary = cardSpec.sourceLabel === "Voice AI Input";
    const moduleName = cardSpec.sourceLabel;
    const actionableNode = actionableModuleByPrototypeLabel[moduleName];
    const decorativeNode = decorativeModuleByPrototypeLabel[moduleName] ?? decorativeModuleByPrototypeLabel.Insights;
    let visualNode: VisualNode;

    if (actionableNode && !usedActions.has(actionableNode.action)) {
      usedActions.add(actionableNode.action);
      visualNode = createActionableVisualNode(actionableNode);
    } else if (actionableNode) {
      visualNode = createDecorativeVisualNode(actionableNode, `decor-${actionableNode.id}-${index}`);
    } else {
      visualNode = createDecorativeVisualNode(decorativeNode, `decor-${decorativeNode.id}-${index}`);
    }

    return {
      id: cardSpec.id,
      index,
      isPrimary,
      moduleName,
      point: cardSpec.point,
      visualNode,
    };
  });
}

function projectOrbitCard(
  card: OrbitCard,
  rotX: number,
  rotY: number,
  expandedProgress: number,
  scale: number,
  stageWidth: number,
  stageHeight: number,
): ProjectedSphereCard {
  const centerX = stageWidth / 2;
  const centerY = stageHeight / 2;
  const radius = Math.min(stageWidth, stageHeight) * PROTOTYPE_RADIUS_FACTOR;
  const sphereZoom = 1 + (PROTOTYPE_EXPANDED_ZOOM - 1) * expandedProgress;
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const point = card.point;
  const y1 = point.y * cosX - point.z * sinX;
  const z1 = point.y * sinX + point.z * cosX;
  const rotatedX = point.x * cosY + z1 * sinY;
  const rotatedZ = -point.x * sinY + z1 * cosY;
  const projected = PROTOTYPE_PERSPECTIVE / (PROTOTYPE_PERSPECTIVE - rotatedZ * PROTOTYPE_DEPTH_PROJECTION);
  const depth = clamp((rotatedZ + 1) / 2, 0, 1);
  const centerProgress = card.isPrimary ? smoothstep(0.02, 1, expandedProgress) : 0;
  const orbitCenterX = centerX + rotatedX * radius * projected;
  const orbitCenterY = centerY + y1 * radius * projected;
  const radial = clamp(Math.hypot(orbitCenterX - centerX, orbitCenterY - centerY) / (radius * 1.08), 0, 1);
  const centerSolid = 1 - smoothstep(0.22, 0.42, radial);
  const centerFactor = Math.pow(1 - smoothstep(0.08, 1, radial), 0.56);
  const frontFactor = Math.pow(depth, 1.18);
  const visibility = clamp((0.26 + frontFactor * 0.74) * (0.32 + centerFactor * 0.82), 0, 1);
  const focusBoost = centerFactor * depth * (0.1 + expandedProgress * 0.01);
  const compactScale = 0.38 + depth * 0.6 + centerFactor * 0.055;
  const expandedScale = 0.4 + depth * 0.5 + centerFactor * 0.05;
  const orbitScale = (compactScale + (expandedScale - compactScale) * expandedProgress) * projected;
  const minOpacity = 0.56 + expandedProgress * 0.06;
  const maxOpacity = 0.96 + expandedProgress * 0.02;
  const orbitOpacity = clamp(
    minOpacity + visibility * 0.34 + focusBoost * 0.3 + centerSolid * 0.02,
    minOpacity,
    maxOpacity,
  );
  const targetWidth = (PROTOTYPE_CARD_SIZE + (PROTOTYPE_CENTER_CARD_WIDTH - PROTOTYPE_CARD_SIZE) * centerProgress) * scale;
  const targetHeight = (PROTOTYPE_CARD_SIZE + (PROTOTYPE_CENTER_CARD_HEIGHT - PROTOTYPE_CARD_SIZE) * centerProgress) * scale;
  const frameWidth = (card.isPrimary ? PROTOTYPE_CENTER_CARD_WIDTH : PROTOTYPE_CARD_SIZE) * scale;
  const frameHeight = (card.isPrimary ? PROTOTYPE_CENTER_CARD_HEIGHT : PROTOTYPE_CARD_SIZE) * scale;
  const sampleCenterX = orbitCenterX + (centerX - orbitCenterX) * centerProgress;
  const sampleCenterY = orbitCenterY + (centerY - orbitCenterY) * centerProgress;
  const sampleScale = orbitScale + (1 - orbitScale) * centerProgress;
  const sampleOpacity = orbitOpacity + (1 - orbitOpacity) * centerProgress;
  const sampleDepth = rotatedZ + (2 - rotatedZ) * centerProgress;
  const zoomedCenterX = centerX + (sampleCenterX - centerX) * sphereZoom;
  const zoomedCenterY = centerY + (sampleCenterY - centerY) * sphereZoom;
  const scaleX = sampleScale * sphereZoom * (targetWidth / frameWidth);
  const scaleY = sampleScale * sphereZoom * (targetHeight / frameHeight);

  return {
    centerX: zoomedCenterX,
    centerY: zoomedCenterY,
    depth: sampleDepth,
    height: frameHeight * scaleY,
    opacity: sampleOpacity,
    scaleX,
    scaleY,
    width: frameWidth * scaleX,
  };
}

function getOrbitCardProjectedDepth(card: OrbitCard, rotX: number, rotY: number) {
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const point = card.point;
  const z1 = point.y * sinX + point.z * cosX;

  return -point.x * sinY + z1 * cosY;
}

function CapturedGeometryLayer({
  isExpanded,
  onCollapse,
  onExpand,
  onPressNode,
  scale,
}: {
  isExpanded: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  onPressNode: (node: FunctionNode) => void;
  scale: number;
}) {
  const collapsedGeometry = capturedPrototypeGeometry.collapsed;
  const expandedGeometry = capturedPrototypeGeometry.expanded;
  const stage = collapsedGeometry.sphereContainer;
  const hintGeometry = isExpanded ? expandedGeometry.hint : collapsedGeometry.hint;
  const hintText = isExpanded ? "拖动旋转 / 点击空白处收起" : "拖动旋转 / 点击展开";
  const stageWidth = stage.width * scale;
  const stageHeight = stage.height * scale;
  const stageFrame = {
    height: stageHeight,
    left: stage.x * scale,
    top: stage.y * scale,
    width: stageWidth,
  };
  const orbitCards = useMemo(createPrototypeOrbitCards, []);
  const [drawOrderAngles, setDrawOrderAngles] = useState({
    rotX: PROTOTYPE_INITIAL_ROT_X,
    rotY: PROTOTYPE_INITIAL_ROT_Y,
  });
  const drawOrderUpdateAtRef = useRef(0);
  const renderedOrbitCards = useMemo(
    () => {
      const sortedCards = [...orbitCards].sort(
        (a, b) =>
          getOrbitCardProjectedDepth(a, drawOrderAngles.rotX, drawOrderAngles.rotY) -
          getOrbitCardProjectedDepth(b, drawOrderAngles.rotX, drawOrderAngles.rotY),
      );

      return isExpanded ? sortedCards.filter((card) => !card.isPrimary) : sortedCards;
    },
    [drawOrderAngles.rotX, drawOrderAngles.rotY, isExpanded, orbitCards],
  );
  const fallbackLabelFont = useMemo(() => matchFont({ fontSize: 7 * scale, fontWeight: "700" }), [scale]);
  const fallbackCenterLabelFont = useMemo(() => matchFont({ fontSize: 11 * scale, fontWeight: "700" }), [scale]);
  const loadedLabelFont = useFont(NOTO_SANS_SC_FONT, 7 * scale);
  const loadedCenterLabelFont = useFont(NOTO_SANS_SC_FONT, 11 * scale);
  const labelFont = loadedLabelFont ?? fallbackLabelFont;
  const centerLabelFont = loadedCenterLabelFont ?? fallbackCenterLabelFont;
  const rotX = useSharedValue(PROTOTYPE_INITIAL_ROT_X);
  const rotY = useSharedValue(PROTOTYPE_INITIAL_ROT_Y);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);
  const dragging = useSharedValue(0);
  const expandedTarget = useSharedValue(isExpanded ? 1 : 0);
  const expandProgress = useSharedValue(isExpanded ? 1 : 0);
  const idleHoldUntil = useSharedValue(0);
  const canvasOverscan = Math.max(72 * scale, stageWidth * 0.18);
  const canvasFrame = {
    height: stageHeight + canvasOverscan * 2,
    left: -canvasOverscan,
    top: -canvasOverscan,
    width: stageWidth + canvasOverscan * 2,
  };
  const gestureRef = useRef<SphereGestureState>({
    downX: 0,
    downY: 0,
    grantAt: 0,
    lastMoveAt: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  useEffect(() => {
    const now = performance.now();
    expandedTarget.value = isExpanded ? 1 : 0;
    expandProgress.value = withTiming(isExpanded ? 1 : 0, { duration: EXPAND_TRANSITION_DURATION_MS });
    idleHoldUntil.value = now + 180;
  }, [expandProgress, expandedTarget, idleHoldUntil, isExpanded]);

  useFrameCallback((frame) => {
    "worklet";

    if (dragging.value > 0.5) {
      return;
    }

    const dt = Math.min(34, Math.max(8, frame.timeSincePreviousFrame ?? 16.67));
    const speed = Math.abs(velocityX.value) + Math.abs(velocityY.value);

    if (speed > PROTOTYPE_STOP_SPEED) {
      const nextRotX = rotX.value + velocityX.value * dt;
      rotX.value = Math.max(PROTOTYPE_MIN_ROT_X, Math.min(PROTOTYPE_MAX_ROT_X, nextRotX));
      rotY.value += velocityY.value * dt;
      velocityX.value *= PROTOTYPE_INERTIA_DAMPING;
      velocityY.value *= PROTOTYPE_INERTIA_DAMPING;
    } else if (frame.timestamp > idleHoldUntil.value) {
      velocityX.value = 0;
      velocityY.value = 0;
      rotY.value += expandedTarget.value > 0.5 ? PROTOTYPE_EXPANDED_IDLE_STEP : PROTOTYPE_COLLAPSED_IDLE_STEP;
      const nextRotX = rotX.value + Math.sin(frame.timestamp * 0.00033) * 0.00028;
      rotX.value = Math.max(PROTOTYPE_MIN_ROT_X, Math.min(PROTOTYPE_MAX_ROT_X, nextRotX));
    }
  }, true);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: (_, gesture) => Math.hypot(gesture.dx, gesture.dy) > 4,
        onMoveShouldSetPanResponder: (_, gesture) => Math.hypot(gesture.dx, gesture.dy) > 4,
        onPanResponderGrant: (_, gesture) => {
          const now = performance.now();
          const gestureState = gestureRef.current;
          dragging.value = 1;
          gestureState.grantAt = now;
          gestureState.downX = gesture.x0;
          gestureState.downY = gesture.y0;
          gestureState.lastX = gesture.moveX || gesture.x0;
          gestureState.lastY = gesture.moveY || gesture.y0;
          gestureState.lastMoveAt = now;
          gestureState.moved = Math.hypot(gesture.dx, gesture.dy) > 1;
          velocityX.value = 0;
          velocityY.value = 0;
          idleHoldUntil.value = now + 100000;
        },
        onPanResponderMove: (_, gesture) => {
          const gestureState = gestureRef.current;
          const now = performance.now();
          const nextX = gesture.moveX;
          const nextY = gesture.moveY;
          const dx = nextX - gestureState.lastX;
          const dy = nextY - gestureState.lastY;
          const distance = Math.hypot(gesture.dx, gesture.dy);
          const dt = Math.max(8, now - gestureState.lastMoveAt);

          if (distance > TAP_MOVEMENT_THRESHOLD) {
            gestureState.moved = true;
          }

          if (gestureState.moved) {
            rotY.value += dx * PROTOTYPE_DRAG_FACTOR;
            rotX.value = clamp(rotX.value - dy * PROTOTYPE_DRAG_FACTOR, PROTOTYPE_MIN_ROT_X, PROTOTYPE_MAX_ROT_X);
            velocityY.value = (dx / dt) * PROTOTYPE_DRAG_FACTOR;
            velocityX.value = (-dy / dt) * PROTOTYPE_DRAG_FACTOR;

            if (now - drawOrderUpdateAtRef.current > 90) {
              drawOrderUpdateAtRef.current = now;
              setDrawOrderAngles({ rotX: rotX.value, rotY: rotY.value });
            }
          }

          gestureState.lastX = nextX;
          gestureState.lastY = nextY;
          gestureState.lastMoveAt = now;
        },
        onPanResponderRelease: (_, gesture) => {
          const now = performance.now();
          const gestureState = gestureRef.current;
          const touchDuration = now - gestureState.grantAt;
          const wasDrag = gestureState.moved || Math.hypot(gesture.dx, gesture.dy) > TAP_MOVEMENT_THRESHOLD;
          const wasTap = !wasDrag && touchDuration <= TAP_MAX_DURATION_MS;
          dragging.value = 0;
          gestureState.moved = false;
          setDrawOrderAngles({ rotX: rotX.value, rotY: rotY.value });
          idleHoldUntil.value = now + (wasDrag ? 450 : 180);

          if (wasTap) {
            if (!isExpanded) {
              onExpand();
            } else {
              const localX = gesture.x0 - stageFrame.left;
              const localY = gesture.y0 - stageFrame.top;
              let hitTarget: { depth: number; node: FunctionNode } | null = null;

              for (const card of orbitCards) {
                const node = card.visualNode.action ? functionNodeByAction[card.visualNode.action] : undefined;

                if (!node) {
                  continue;
                }

                const projected = projectOrbitCard(card, rotX.value, rotY.value, expandProgress.value, scale, stageWidth, stageHeight);

                if (
                  projected.opacity > 0.48 &&
                  Math.abs(localX - projected.centerX) <= projected.width / 2 &&
                  Math.abs(localY - projected.centerY) <= projected.height / 2 &&
                  (!hitTarget || projected.depth > hitTarget.depth)
                ) {
                  hitTarget = { depth: projected.depth, node };
                }
              }

              if (hitTarget) {
                onPressNode(hitTarget.node);
              } else {
                onCollapse();
              }
            }
          }
        },
        onPanResponderTerminate: () => {
          const now = performance.now();
          dragging.value = 0;
          gestureRef.current.moved = false;
          setDrawOrderAngles({ rotX: rotX.value, rotY: rotY.value });
          idleHoldUntil.value = now + 240;
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [
      dragging,
      drawOrderUpdateAtRef,
      expandProgress,
      idleHoldUntil,
      isExpanded,
      onCollapse,
      onExpand,
      onPressNode,
      orbitCards,
      rotX,
      rotY,
      scale,
      stageFrame.left,
      stageFrame.top,
      stageHeight,
      stageWidth,
      velocityX,
      velocityY,
    ],
  );

  return (
    <>
      <MetallicLogo geometry={collapsedGeometry.logo} scale={scale} />
      <View {...panResponder.panHandlers} style={[styles.capturedSphereStage, stageFrame]}>
        <Canvas style={[styles.capturedSphereCanvas, canvasFrame]}>
          <Group transform={[{ translateX: canvasOverscan }, { translateY: canvasOverscan }]}>
            {renderedOrbitCards.map((orbitCard) => (
              <SkiaSphereCard
                centerLabelFont={centerLabelFont}
                expandProgress={expandProgress}
                isExpanded={isExpanded}
                key={`skia-sphere-card-${orbitCard.index}`}
                labelFont={labelFont}
                orbitCard={orbitCard}
                rotX={rotX}
                rotY={rotY}
                scale={scale}
                stageHeight={stageHeight}
                stageWidth={stageWidth}
              />
            ))}
          </Group>
        </Canvas>
      </View>
      {isExpanded ? (
        <CenterVoiceGlassHero
          height={PROTOTYPE_CENTER_CARD_HEIGHT * PROTOTYPE_EXPANDED_ZOOM * 1.02 * scale}
          interactionEnabled={isExpanded}
          onPress={() => onPressNode(functionNodeByAction.record)}
          width={PROTOTYPE_CENTER_CARD_WIDTH * PROTOTYPE_EXPANDED_ZOOM * 1.02 * scale}
          x={stageFrame.left + stageWidth / 2}
          y={stageFrame.top + stageHeight / 2}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.capturedHint,
          {
            height: hintGeometry.height * scale,
            left: hintGeometry.x * scale,
            opacity: hintGeometry.opacity,
            top: hintGeometry.y * scale,
            width: hintGeometry.width * scale,
          },
        ]}
      >
        <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.hintText}>
          {hintText}
        </Text>
      </View>
    </>
  );
}

function CenterVoiceGlassHero({
  height,
  interactionEnabled,
  onPress,
  width,
  x,
  y,
}: {
  height: number;
  interactionEnabled: boolean;
  onPress: () => void;
  width: number;
  x: number;
  y: number;
}) {
  const borderRadius = 24;

  return (
    <Pressable
      onPress={onPress}
      pointerEvents={interactionEnabled ? "auto" : "none"}
      style={[
        styles.centerVoiceHero,
        {
          borderRadius,
          height,
          left: x - width / 2,
          top: y - height / 2,
          width,
        },
      ]}
    >
      <BlurView
        blurReductionFactor={1.2}
        experimentalBlurMethod="dimezisBlurView"
        intensity={96}
        style={StyleSheet.absoluteFillObject}
        tint="light"
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(244, 255, 252, 0.48)",
            borderRadius,
          },
        ]}
      />
      <View pointerEvents="none" style={[styles.centerVoiceHeroHighlight, { borderRadius }]} />
      <View style={styles.centerVoiceHeroContent}>
        <AppIcon color="#00AFC0" name="mic" size={32} />
        <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.centerVoiceHeroText}>
          自然语言记一笔
        </Text>
      </View>
    </Pressable>
  );
}

function SkiaSphereCard({
  centerLabelFont,
  expandProgress,
  isExpanded,
  labelFont,
  orbitCard,
  rotX,
  rotY,
  scale,
  stageHeight,
  stageWidth,
}: {
  centerLabelFont: SkFont;
  expandProgress: SharedValue<number>;
  isExpanded: boolean;
  labelFont: SkFont;
  orbitCard: OrbitCard;
  rotX: SharedValue<number>;
  rotY: SharedValue<number>;
  scale: number;
  stageHeight: number;
  stageWidth: number;
}) {
  const visualNode = orbitCard.visualNode;
  const actionableNode = visualNode.action ? functionNodeByAction[visualNode.action] : undefined;
  const isCenterCard = orbitCard.isPrimary && isExpanded;
  const frameWidth = (orbitCard.isPrimary ? PROTOTYPE_CENTER_CARD_WIDTH : PROTOTYPE_CARD_SIZE) * scale;
  const frameHeight = (orbitCard.isPrimary ? PROTOTYPE_CENTER_CARD_HEIGHT : PROTOTYPE_CARD_SIZE) * scale;
  const radius = (isCenterCard ? 18 : 12) * scale;
  const cardX = -frameWidth / 2;
  const cardY = -frameHeight / 2;
  const iconSize = (isCenterCard ? 38 : 31) * scale;
  const label = visualNode.label;
  const activeLabelFont = isCenterCard ? centerLabelFont : labelFont;
  const labelWidth = label ? activeLabelFont.measureText(label).width : 0;
  const labelBaseline = isCenterCard ? frameHeight / 2 - 18 * scale : frameHeight / 2 - 6 * scale;
  const iconOffsetY = isCenterCard ? -15 * scale : isExpanded && actionableNode ? -7 * scale : 0;
  const cardClip = rrect(rect(cardX, cardY, frameWidth, frameHeight), radius, radius);
  const cardRole = getSphereCardRole(orbitCard);
  const scaleMultiplier = getSphereCardScaleMultiplier(cardRole);
  const iconRenderSize = iconSize;
  const materialStrokeWidth = StyleSheet.hairlineWidth * scale;
  const iconStrokeWidth = (isCenterCard ? 2.45 : actionableNode ? 2.28 : 1.95) * scale;
  const hasActionableLabel = Boolean(actionableNode);
  const cardProjection = useDerivedValue<SkiaSphereProjection>(() => {
    const progress = Math.max(0, Math.min(1, expandProgress.value));
    const centerX = stageWidth / 2;
    const centerY = stageHeight / 2;
    const radiusValue = Math.min(stageWidth, stageHeight) * PROTOTYPE_RADIUS_FACTOR;
    const sphereZoom = 1 + (PROTOTYPE_EXPANDED_ZOOM - 1) * progress;
    const cosX = Math.cos(rotX.value);
    const sinX = Math.sin(rotX.value);
    const cosY = Math.cos(rotY.value);
    const sinY = Math.sin(rotY.value);
    const point = orbitCard.point;
    const y1 = point.y * cosX - point.z * sinX;
    const z1 = point.y * sinX + point.z * cosX;
    const rotatedX = point.x * cosY + z1 * sinY;
    const rotatedZ = -point.x * sinY + z1 * cosY;
    const projected = PROTOTYPE_PERSPECTIVE / (PROTOTYPE_PERSPECTIVE - rotatedZ * PROTOTYPE_DEPTH_PROJECTION);
    const depth = Math.max(0, Math.min(1, (rotatedZ + 1) / 2));
    let centerProgress = 0;

    if (orbitCard.isPrimary) {
      const centerProgressX = Math.max(0, Math.min(1, (progress - 0.02) / 0.98));
      centerProgress = centerProgressX * centerProgressX * (3 - 2 * centerProgressX);
    }

    const orbitCenterX = centerX + rotatedX * radiusValue * projected;
    const orbitCenterY = centerY + y1 * radiusValue * projected;
    const radial = Math.max(0, Math.min(1, Math.hypot(orbitCenterX - centerX, orbitCenterY - centerY) / (radiusValue * 1.08)));
    const centerStepX = Math.max(0, Math.min(1, (radial - 0.08) / 0.92));
    const centerFactor = Math.pow(1 - centerStepX * centerStepX * (3 - 2 * centerStepX), 0.56);
    const compactScale = 0.38 + depth * 0.6 + centerFactor * 0.055;
    const expandedScale = 0.4 + depth * 0.5 + centerFactor * 0.05;
    const orbitScale = (compactScale + (expandedScale - compactScale) * progress) * projected;
    const targetWidth = (PROTOTYPE_CARD_SIZE + (PROTOTYPE_CENTER_CARD_WIDTH - PROTOTYPE_CARD_SIZE) * centerProgress) * scale;
    const targetHeight = (PROTOTYPE_CARD_SIZE + (PROTOTYPE_CENTER_CARD_HEIGHT - PROTOTYPE_CARD_SIZE) * centerProgress) * scale;
    const sampleCenterX = orbitCenterX + (centerX - orbitCenterX) * centerProgress;
    const sampleCenterY = orbitCenterY + (centerY - orbitCenterY) * centerProgress;
    const sampleScale = (orbitScale + (1 - orbitScale) * centerProgress) * scaleMultiplier;
    const projectedZ = rotatedZ + (2 - rotatedZ) * centerProgress;
    const zoomedCenterX = centerX + (sampleCenterX - centerX) * sphereZoom;
    const zoomedCenterY = centerY + (sampleCenterY - centerY) * sphereZoom;
    const material = resolveHybridSphereGlassMaterial({
      accentColor: visualNode.accent,
      projectedX: zoomedCenterX,
      projectedY: zoomedCenterY,
      role: cardRole,
      rotatedZ: projectedZ,
      sphereCenterX: centerX,
      sphereCenterY: centerY,
      sphereRadius: radiusValue,
    });
    const scaleX = sampleScale * sphereZoom * (targetWidth / frameWidth);
    const scaleY = sampleScale * sphereZoom * (targetHeight / frameHeight);
    let labelOpacity = 0;

    if (hasActionableLabel) {
      const labelProgress = Math.max(0, Math.min(1, (progress - 0.68) / 0.32));
      labelOpacity = labelProgress * labelProgress * (3 - 2 * labelProgress);
    }

    return {
      labelOpacity,
      material,
      opacity: material.cardOpacity,
      transform: [{ translateX: zoomedCenterX }, { translateY: zoomedCenterY }, { scaleX }, { scaleY }],
    };
  });
  const cardTransform = useDerivedValue<Transforms3d>(() => cardProjection.value.transform);
  const cardOpacity = useDerivedValue(() => cardProjection.value.opacity);
  const bodyColor = useDerivedValue(() => cardProjection.value.material.bodyColor);
  const borderColor = useDerivedValue(() => cardProjection.value.material.edgeColor);
  const glassTintColor = useDerivedValue(() => cardProjection.value.material.glassTintColor);
  const highlightColor = useDerivedValue(() => cardProjection.value.material.highlightColor);
  const iconColor = useDerivedValue(() => cardProjection.value.material.iconColor);
  const iconGlowColor = useDerivedValue(() => cardProjection.value.material.iconGlowColor);
  const iconOpacity = useDerivedValue(() => cardProjection.value.material.iconOpacity);
  const shadowBlur = useDerivedValue(() => cardProjection.value.material.shadowRadius * scale);
  const shadowColor = useDerivedValue(() => `rgba(0, 0, 0, ${Number(cardProjection.value.material.shadowOpacity.toFixed(3))})`);
  const labelOpacity = useDerivedValue(() => cardProjection.value.labelOpacity);

  return (
    <Group opacity={cardOpacity} transform={cardTransform}>
      <RoundedRect
        color={shadowColor}
        height={frameHeight}
        r={radius}
        width={frameWidth}
        x={cardX + (isCenterCard ? 4.5 : 2.6) * scale}
        y={cardY + (isCenterCard ? 8 : 4.2) * scale}
      >
        <BlurMask blur={shadowBlur} style="normal" />
      </RoundedRect>
      <Group clip={cardClip}>
        <RoundedRect color={bodyColor} height={frameHeight} r={radius} width={frameWidth} x={cardX} y={cardY} />
        <RoundedRect color={glassTintColor} height={frameHeight} r={radius} width={frameWidth} x={cardX} y={cardY} />
        <RoundedRect color={highlightColor} height={frameHeight} r={radius} width={frameWidth} x={cardX} y={cardY} />
      </Group>
      <RoundedRect
        color={borderColor}
        height={frameHeight}
        r={radius}
        style="stroke"
        strokeWidth={materialStrokeWidth}
        width={frameWidth}
        x={cardX}
        y={cardY}
      />
      <Circle color={iconGlowColor} cx={0} cy={iconOffsetY} r={iconRenderSize * 0.58}>
        <BlurMask blur={4 * scale} style="normal" />
      </Circle>
      <Group opacity={iconOpacity}>
        <SkiaSphereIcon
          color={iconColor}
          icon={visualNode.icon}
          size={iconRenderSize}
          strokeWidth={iconStrokeWidth}
          y={iconOffsetY}
        />
      </Group>
      {actionableNode && isExpanded ? (
        <SkiaText
          color={isCenterCard ? "rgba(18,31,39,0.94)" : "rgba(18,35,56,0.86)"}
          font={activeLabelFont}
          opacity={labelOpacity}
          text={label}
          x={-labelWidth / 2}
          y={labelBaseline}
        />
      ) : null}
    </Group>
  );
}

function SkiaSphereIcon({
  color,
  icon,
  size,
  strokeWidth,
  y = 0,
}: {
  color: string | SharedValue<string>;
  icon: AppIconName;
  size: number;
  strokeWidth: number;
  y?: number;
}) {
  const s = size / 2;
  const strokeProps = { color, strokeCap: "round" as const, strokeWidth, style: "stroke" as const };

  if (icon === "mic") {
    return (
      <Group transform={[{ translateY: y }]}>
        <RoundedRect {...strokeProps} height={s * 1.25} r={s * 0.32} width={s * 0.55} x={-s * 0.275} y={-s * 0.78} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.58, y: -s * 0.02 }} p2={{ x: -s * 0.58, y: s * 0.2 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.58, y: -s * 0.02 }} p2={{ x: s * 0.58, y: s * 0.2 }} />
        <SkiaLine {...strokeProps} p1={{ x: 0, y: s * 0.46 }} p2={{ x: 0, y: s * 0.82 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.45, y: s * 0.82 }} p2={{ x: s * 0.45, y: s * 0.82 }} />
        <Circle color={color} cx={s * 0.75} cy={-s * 0.52} r={s * 0.11} />
      </Group>
    );
  }

  if (icon === "wallet") {
    return (
      <Group transform={[{ translateY: y }]}>
        <RoundedRect {...strokeProps} height={s * 1.05} r={s * 0.18} width={s * 1.45} x={-s * 0.72} y={-s * 0.48} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.42, y: -s * 0.48 }} p2={{ x: s * 0.5, y: -s * 0.48 }} />
        <Circle color={color} cx={s * 0.42} cy={s * 0.05} r={s * 0.1} />
      </Group>
    );
  }

  if (icon === "asset") {
    return (
      <Group transform={[{ translateY: y }]}>
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.72, y: -s * 0.1 }} p2={{ x: 0, y: -s * 0.68 }} />
        <SkiaLine {...strokeProps} p1={{ x: 0, y: -s * 0.68 }} p2={{ x: s * 0.72, y: -s * 0.1 }} />
        <RoundedRect {...strokeProps} height={s * 0.9} r={s * 0.1} width={s * 1.05} x={-s * 0.52} y={-s * 0.1} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.15, y: s * 0.8 }} p2={{ x: -s * 0.15, y: s * 0.28 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.15, y: s * 0.8 }} p2={{ x: s * 0.15, y: s * 0.28 }} />
      </Group>
    );
  }

  if (icon === "transaction") {
    return (
      <Group transform={[{ translateY: y }]}>
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.72, y: -s * 0.34 }} p2={{ x: s * 0.56, y: -s * 0.34 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.24, y: -s * 0.66 }} p2={{ x: s * 0.56, y: -s * 0.34 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.24, y: -s * 0.02 }} p2={{ x: s * 0.56, y: -s * 0.34 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.72, y: s * 0.36 }} p2={{ x: -s * 0.56, y: s * 0.36 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.24, y: s * 0.04 }} p2={{ x: -s * 0.56, y: s * 0.36 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.24, y: s * 0.68 }} p2={{ x: -s * 0.56, y: s * 0.36 }} />
      </Group>
    );
  }

  if (icon === "reports") {
    return (
      <Group transform={[{ translateY: y }]}>
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.6, y: s * 0.7 }} p2={{ x: s * 0.62, y: s * 0.7 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.42, y: s * 0.7 }} p2={{ x: -s * 0.42, y: -s * 0.12 }} />
        <SkiaLine {...strokeProps} p1={{ x: 0, y: s * 0.7 }} p2={{ x: 0, y: -s * 0.58 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.42, y: s * 0.7 }} p2={{ x: s * 0.42, y: -s * 0.28 }} />
      </Group>
    );
  }

  if (icon === "chart" || icon === "cashFlow") {
    return (
      <Group transform={[{ translateY: y }]}>
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.72, y: s * 0.54 }} p2={{ x: -s * 0.18, y: s * 0.12 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.18, y: s * 0.12 }} p2={{ x: s * 0.18, y: s * 0.2 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.18, y: s * 0.2 }} p2={{ x: s * 0.7, y: -s * 0.48 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.38, y: -s * 0.48 }} p2={{ x: s * 0.7, y: -s * 0.48 }} />
        <SkiaLine {...strokeProps} p1={{ x: s * 0.7, y: -s * 0.48 }} p2={{ x: s * 0.7, y: -s * 0.16 }} />
      </Group>
    );
  }

  if (icon === "profile") {
    return (
      <Group transform={[{ translateY: y }]}>
        <Circle {...strokeProps} cx={0} cy={-s * 0.38} r={s * 0.32} />
        <RoundedRect {...strokeProps} height={s * 0.7} r={s * 0.32} width={s * 1.12} x={-s * 0.56} y={s * 0.16} />
      </Group>
    );
  }

  if (icon === "success" || icon === "reconcile") {
    return (
      <Group transform={[{ translateY: y }]}>
        <Circle {...strokeProps} cx={0} cy={0} r={s * 0.72} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.34, y: s * 0.02 }} p2={{ x: -s * 0.08, y: s * 0.3 }} />
        <SkiaLine {...strokeProps} p1={{ x: -s * 0.08, y: s * 0.3 }} p2={{ x: s * 0.42, y: -s * 0.34 }} />
      </Group>
    );
  }

  if (icon === "manage" || icon === "securities" || icon === "data") {
    return (
      <Group transform={[{ translateY: y }]}>
        <RoundedRect {...strokeProps} height={s * 0.44} r={s * 0.08} width={s * 1.16} x={-s * 0.58} y={-s * 0.58} />
        <RoundedRect {...strokeProps} height={s * 0.44} r={s * 0.08} width={s * 1.16} x={-s * 0.58} y={-s * 0.12} />
        <RoundedRect {...strokeProps} height={s * 0.44} r={s * 0.08} width={s * 1.16} x={-s * 0.58} y={s * 0.34} />
      </Group>
    );
  }

  return (
    <Group transform={[{ translateY: y }]}>
      <Circle {...strokeProps} cx={0} cy={0} r={s * 0.72} />
      <SkiaLine {...strokeProps} p1={{ x: -s * 0.36, y: 0 }} p2={{ x: s * 0.36, y: 0 }} />
    </Group>
  );
}

const styles = StyleSheet.create({
  collapseLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  dashboardSkeletonShell: {
    marginHorizontal: 0,
    marginTop: 0,
    minHeight: 690,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  dashboardSkeletonHeader: {
    alignItems: "center",
    paddingBottom: 4,
  },
  dashboardSkeletonDivider: {
    backgroundColor: "rgba(255,255,255,0.10)",
    height: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  dashboardSkeletonStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  dashboardSkeletonStat: {
    flex: 1,
    gap: 7,
  },
  dashboardSkeletonStatValue: {
    marginTop: 0,
  },
  centerVoiceHero: {
    alignItems: "center",
    elevation: 14,
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#A8FFF4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    zIndex: 30,
  },
  centerVoiceHeroContent: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  centerVoiceHeroHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.34)",
    height: "42%",
    left: 12,
    position: "absolute",
    right: 12,
    top: 8,
  },
  centerVoiceHeroText: {
    color: "rgba(12, 28, 30, 0.9)",
    fontSize: 14,
    fontWeight: "700",
  },
  capturedHint: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 2,
  },
  capturedSphereCanvas: {
    position: "absolute",
  },
  capturedSphereStage: {
    overflow: "visible",
    position: "absolute",
    zIndex: 3,
  },
  hintText: {
    color: "rgba(202,211,225,0.62)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.96,
    textAlign: "center",
    textShadowColor: "rgba(160,180,220,0.18)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },










  logoHighlight: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 48,
    fontWeight: "500",
    letterSpacing: 9.6,
    lineHeight: 62,
    position: "absolute",
    textShadowColor: "rgba(255,255,255,0.24)",
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 8,
    top: -1,
  },
  logoShadow: {
    color: "rgba(70,76,84,0.64)",
    fontSize: 48,
    fontWeight: "500",
    letterSpacing: 9.6,
    lineHeight: 62,
    position: "absolute",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
    top: 4,
  },
  logoText: {
    color: "rgba(246,249,255,0.94)",
    fontSize: 48,
    fontWeight: "500",
    letterSpacing: 9.6,
    lineHeight: 62,
    textShadowColor: "rgba(255,255,255,0.32)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  logoWrap: {
    alignItems: "center",
    height: 72,
    justifyContent: "center",
    minWidth: 310,
    position: "absolute",
    zIndex: 2,
  },
  root: {
    alignItems: "center",
    backgroundColor: "#050609",
    flex: 1,
    overflow: "hidden",
    paddingHorizontal: 0,
    paddingTop: 0,
    position: "relative",
  },



});


