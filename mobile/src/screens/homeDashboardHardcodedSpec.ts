import type { AppIconName } from "../components/AppIcon";

export type HomeHubAction = "accounts" | "assets" | "operation" | "profitability" | "record" | "reports" | "settings" | "transactions";
export type HomeSphereCardRole = "centerHero" | "ghost" | "mainFront" | "supportBody";
export type SphereCardRole = HomeSphereCardRole;
export type SphereBlurMode = "hero" | "none";

export type HybridSphereGlassMaterial = {
  depth01: number;
  center01: number;
  side01: number;
  vertical01: number;
  strength01: number;

  blurMode: SphereBlurMode;
  backdropBlur: number;

  cardOpacity: number;
  bodyColor: string;
  glassTintColor: string;
  edgeColor: string;
  highlightColor: string;

  shadowOpacity: number;
  shadowRadius: number;

  iconColor: string;
  iconOpacity: number;
  iconGlowColor: string;
  iconGlowOpacity: number;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.max(min, Math.min(max, value));
};

const lerp = (from: number, to: number, t: number) => {
  "worklet";
  return from + (to - from) * t;
};

const rgba = (rgb: Rgb, alpha: number) => {
  "worklet";
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${Number(alpha.toFixed(3))})`;
};

const hexToRgb = (hex: string): Rgb => {
  "worklet";
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : clean;
  const value = parseInt(normalized.slice(0, 6), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => {
  "worklet";
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
};

const saturateRgb = (rgb: Rgb, amount: number): Rgb => {
  "worklet";
  const gray = (rgb.r + rgb.g + rgb.b) / 3;

  return {
    r: clamp(gray + (rgb.r - gray) * amount, 0, 255),
    g: clamp(gray + (rgb.g - gray) * amount, 0, 255),
    b: clamp(gray + (rgb.b - gray) * amount, 0, 255),
  };
};

export const resolveHybridSphereGlassMaterial = ({
  accentColor,
  projectedX,
  projectedY,
  role,
  rotatedZ,
  sphereCenterX,
  sphereCenterY,
  sphereRadius,
}: {
  projectedX: number;
  projectedY: number;
  rotatedZ: number;
  sphereCenterX: number;
  sphereCenterY: number;
  sphereRadius: number;
  role: SphereCardRole;
  accentColor: string;
}): HybridSphereGlassMaterial => {
  "worklet";
  const safeRadius = Math.max(1, sphereRadius);
  const depth01 = clamp((rotatedZ + 1) / 2, 0, 1);
  const dx = projectedX - sphereCenterX;
  const dy = projectedY - sphereCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const center01 = 1 - clamp(distance / safeRadius, 0, 1);
  const side01 = clamp(dx / safeRadius, -1, 1);
  const vertical01 = clamp(dy / safeRadius, -1, 1);
  const horizontalFocus01 = 1 - Math.abs(side01);
  const verticalLight01 = (1 - vertical01) / 2;
  const strength01 = clamp(0.65 * depth01 + 0.25 * center01 + 0.1 * horizontalFocus01, 0, 1);
  const bodyPresence01 = clamp(0.52 + strength01 * 0.48, 0, 1);
  const blurMode: SphereBlurMode = role === "centerHero" ? "hero" : "none";
  const backdropBlur = 0;
  const backBody: Rgb = { r: 64, g: 80, b: 82 };
  const frontBody: Rgb = { r: 154, g: 176, b: 169 };
  const leftTint: Rgb = { r: 70, g: 112, b: 118 };
  const rightTint: Rgb = { r: 90, g: 82, b: 122 };
  const topLight: Rgb = { r: 180, g: 202, b: 194 };
  const depthRgb = mixRgb(backBody, frontBody, bodyPresence01);
  const sideTintRgb = side01 < 0 ? leftTint : rightTint;
  const sideTintAmount = Math.abs(side01) * 0.08;
  const bodyRgb = mixRgb(mixRgb(depthRgb, sideTintRgb, sideTintAmount), topLight, verticalLight01 * 0.06);
  const bodyAlpha = clamp(lerp(0.84, 0.98, strength01), 0.84, 0.98);
  const tintAlpha = lerp(0.045, 0.13, strength01) + center01 * 0.025 + verticalLight01 * 0.012;
  const edgeAlpha = lerp(0.035, 0.09, strength01);
  const highlightAlpha = lerp(0.07, 0.18, strength01) + center01 * 0.025 + verticalLight01 * 0.018;
  const cardOpacity = clamp(lerp(0.72, 1, strength01), 0.72, 1);
  const accentRgb = hexToRgb(accentColor);
  const iconRgb = saturateRgb(accentRgb, lerp(1.16, 1.58, strength01));
  const iconOpacity = clamp(lerp(0.5, 1, strength01), 0.5, 1);
  const iconGlowOpacity = lerp(0.04, 0.17, strength01);

  return {
    backdropBlur,
    blurMode,
    bodyColor: rgba(bodyRgb, bodyAlpha),
    cardOpacity,
    center01,
    depth01,
    edgeColor: rgba({ r: 255, g: 255, b: 255 }, edgeAlpha),
    glassTintColor: rgba({ r: 255, g: 255, b: 255 }, tintAlpha),
    highlightColor: rgba({ r: 255, g: 255, b: 255 }, highlightAlpha),
    iconColor: rgba(iconRgb, iconOpacity),
    iconGlowColor: rgba(iconRgb, iconGlowOpacity),
    iconGlowOpacity,
    iconOpacity,
    shadowOpacity: lerp(0.08, 0.28, strength01),
    shadowRadius: lerp(6, 18, strength01),
    side01,
    strength01,
    vertical01,
  };
};

export interface HomeDashboardFunctionNodeSpec {
  action: HomeHubAction;
  accent: string;
  glow: string;
  icon: AppIconName;
  id: string;
  label: string;
}

export interface HomeDashboardSphereCardSpec {
  action?: HomeHubAction;
  accent: string;
  depth: number;
  glow: string;
  height: number;
  icon: AppIconName;
  id: string;
  isPrimary?: boolean;
  label: string;
  opacity: number;
  point: {
    x: number;
    y: number;
    z: number;
  };
  role: HomeSphereCardRole;
  scale: number;
  sourceLabel: string;
  width: number;
  zIndex: number;
}

export const HOME_DASHBOARD_HARDCODED_SPEC = {
  referenceViewport: {
    height: 1157,
    width: 520,
  },
  interaction: {
    collapseDurationMs: 560,
    collapsedIdleStep: 0.0017,
    dragDamping: 0.942,
    dragFactor: 0.0062,
    expandedIdleStep: 0.0012,
    expandDurationMs: 560,
    maxRotX: 0.68,
    minRotX: -0.68,
    snapTimingMs: 180,
    stopSpeed: 0.00006,
    tapMaxDurationMs: 180,
    tapMovementThreshold: 7,
  },
  sphere: {
    cardSize: 56,
    centerCardHeight: 98,
    centerCardWidth: 112,
    depthProjection: 0.74,
    expandedZoom: 1.18,
    initialRotX: -0.18,
    initialRotY: 0.36,
    perspective: 2.75,
    radiusFactor: 0.425,
    stage: {
      height: 430,
      width: 430,
      x: 45,
      y: 357.5,
    },
    supportBodyCardIds: [
      "card-3",
      "card-5",
      "card-7",
      "card-8",
      "card-10",
      "card-12",
      "card-14",
      "card-16",
      "card-17",
      "card-19",
      "card-20",
      "card-21",
      "card-24",
      "card-26",
      "card-29",
      "card-31",
      "card-32",
      "card-34",
      "card-35",
      "card-40",
      "card-43",
      "card-46",
      "card-47",
      "card-50",
      "card-55",
      "card-58",
      "card-60",
      "card-63",
    ],
    functionNodes: [
      { action: "record", accent: "#05AEBD", glow: "rgba(141,247,255,0.34)", icon: "mic", id: "record-entry", label: "自然语言记一笔" },
      { action: "accounts", accent: "#7DD3FC", glow: "rgba(125,211,252,0.3)", icon: "wallet", id: "accounts", label: "账户" },
      { action: "assets", accent: "#8DF7FF", glow: "rgba(141,247,255,0.3)", icon: "asset", id: "assets-liabilities", label: "资产负债" },
      { action: "transactions", accent: "#93C5FD", glow: "rgba(147,197,253,0.3)", icon: "transaction", id: "transactions", label: "交易记录" },
      { action: "reports", accent: "#FFD36F", glow: "rgba(255,211,111,0.28)", icon: "reports", id: "reports", label: "报表" },
      { action: "operation", accent: "#9EF2C5", glow: "rgba(158,242,197,0.28)", icon: "chart", id: "operation", label: "经营分析" },
      { action: "profitability", accent: "#F9A8D4", glow: "rgba(249,168,212,0.28)", icon: "chart", id: "profitability", label: "盈利能力" },
      { action: "settings", accent: "#E5E7EB", glow: "rgba(229,231,235,0.24)", icon: "profile", id: "profile", label: "我的" },
    ] satisfies HomeDashboardFunctionNodeSpec[],
    cards: [
      { id: "card-0", sourceLabel: "Voice AI Input", point: { x: 0.158777, y: 0.969079, z: 0.000000 } },
      { id: "card-1", sourceLabel: "Account", point: { x: -0.202666, y: 0.949000, z: 0.185659 } },
      { id: "card-2", sourceLabel: "Assets", point: { x: 0.031000, y: 0.928605, z: -0.353224 } },
      { id: "card-3", sourceLabel: "Liabilities", point: { x: 0.255056, y: 0.907895, z: 0.332676 } },
      { id: "card-4", sourceLabel: "Reports", point: { x: -0.467610, y: 0.886868, z: -0.082714 } },
      { id: "card-5", sourceLabel: "Cash Flow", point: { x: 0.442476, y: 0.865526, z: -0.281467 } },
      { id: "card-6", sourceLabel: "Analysis", point: { x: -0.147817, y: 0.843868, z: 0.549873 } },
      { id: "card-7", sourceLabel: "Projects", point: { x: -0.269971, y: 0.788184, z: -0.519813 } },
      { id: "card-8", sourceLabel: "Investments", point: { x: 0.584991, y: 0.767000, z: 0.213638 } },
      { id: "card-9", sourceLabel: "Settings", point: { x: -0.607729, y: 0.745500, z: 0.250862 } },
      { id: "card-10", sourceLabel: "Profile", point: { x: 0.292509, y: 0.723684, z: -0.625076 } },
      { id: "card-11", sourceLabel: "Transactions", point: { x: 0.215788, y: 0.701553, z: 0.687965 } },
      { id: "card-12", sourceLabel: "Reconciliation", point: { x: -0.649174, y: 0.679105, z: -0.376209 } },
      { id: "card-13", sourceLabel: "Forecast", point: { x: 0.760014, y: 0.656342, z: -0.167087 } },
      { id: "card-14", sourceLabel: "Safeguards", point: { x: -0.443828, y: 0.607289, z: 0.631300 } },
      { id: "card-15", sourceLabel: "Insights", point: { x: -0.102319, y: 0.585000, z: -0.789588 } },
      { id: "card-16", sourceLabel: "Account", point: { x: 0.626708, y: 0.562395, z: 0.528190 } },
      { id: "card-17", sourceLabel: "Assets", point: { x: -0.841283, y: 0.539474, z: 0.034790 } },
      { id: "card-18", sourceLabel: "Liabilities", point: { x: 0.612034, y: 0.516237, z: -0.609056 } },
      { id: "card-19", sourceLabel: "Reports", point: { x: -0.040832, y: 0.492684, z: 0.883028 } },
      { id: "card-20", sourceLabel: "Cash Flow", point: { x: -0.578960, y: 0.468816, z: -0.693788 } },
      { id: "card-21", sourceLabel: "Analysis", point: { x: 0.876697, y: 0.426395, z: 0.117958 } },
      { id: "card-22", sourceLabel: "Projects", point: { x: -0.740474, y: 0.403000, z: 0.515202 } },
      { id: "card-23", sourceLabel: "Investments", point: { x: 0.201657, y: 0.379289, z: -0.896387 } },
      { id: "card-24", sourceLabel: "Settings", point: { x: 0.464748, y: 0.355263, z: 0.811047 } },
      { id: "card-25", sourceLabel: "Profile", point: { x: -0.905072, y: 0.330921, z: -0.288743 } },
      { id: "card-26", sourceLabel: "Transactions", point: { x: 0.875605, y: 0.306263, z: -0.404552 } },
      { id: "card-27", sourceLabel: "Reconciliation", point: { x: -0.377709, y: 0.281289, z: 0.902517 } },
      { id: "card-28", sourceLabel: "Forecast", point: { x: -0.321806, y: 0.245500, z: -0.894704 } },
      { id: "card-29", sourceLabel: "Safeguards", point: { x: 0.852407, y: 0.221000, z: 0.448001 } },
      { id: "card-30", sourceLabel: "Insights", point: { x: -0.942261, y: 0.196184, z: 0.248377 } },
      { id: "card-31", sourceLabel: "Account", point: { x: 0.532867, y: 0.171053, z: -0.828730 } },
      { id: "card-32", sourceLabel: "Assets", point: { x: 0.168598, y: 0.145605, z: 0.981025 } },
      { id: "card-33", sourceLabel: "Liabilities", point: { x: -0.794481, y: 0.119842, z: -0.615290 } },
      { id: "card-34", sourceLabel: "Reports", point: { x: 1.010212, y: 0.093763, z: -0.083694 } },
      { id: "card-35", sourceLabel: "Cash Flow", point: { x: -0.665411, y: 0.064605, z: 0.719290 } },
      { id: "card-36", sourceLabel: "Analysis", point: { x: 0.004816, y: 0.039000, z: -0.987218 } },
      { id: "card-37", sourceLabel: "Projects", point: { x: 0.667796, y: 0.013079, z: 0.736148 } },
      { id: "card-38", sourceLabel: "Investments", point: { x: -0.995647, y: -0.013158, z: -0.092276 } },
      { id: "card-39", sourceLabel: "Settings", point: { x: 0.800714, y: -0.039711, z: -0.607714 } },
      { id: "card-40", sourceLabel: "Profile", point: { x: -0.180739, y: -0.066579, z: 0.993501 } },
      { id: "card-41", sourceLabel: "Transactions", point: { x: -0.539888, y: -0.093763, z: -0.857936 } },
      { id: "card-42", sourceLabel: "Reconciliation", point: { x: 0.940413, y: -0.116289, z: 0.257728 } },
      { id: "card-43", sourceLabel: "Forecast", point: { x: -0.869754, y: -0.143000, z: 0.446344 } },
      { id: "card-44", sourceLabel: "Safeguards", point: { x: 0.340439, y: -0.170026, z: -0.918275 } },
      { id: "card-45", sourceLabel: "Insights", point: { x: 0.369626, y: -0.197368, z: 0.907977 } },
      { id: "card-46", sourceLabel: "Account", point: { x: -0.886043, y: -0.225026, z: -0.419912 } },
      { id: "card-47", sourceLabel: "Assets", point: { x: 0.936371, y: -0.253000, z: -0.288693 } },
      { id: "card-48", sourceLabel: "Liabilities", point: { x: -0.494684, y: -0.281289, z: 0.844090 } },
      { id: "card-49", sourceLabel: "Reports", point: { x: -0.196505, y: -0.297184, z: -0.915091 } },
      { id: "card-50", sourceLabel: "Cash Flow", point: { x: 0.760639, y: -0.325000, z: 0.540322 } },
      { id: "card-51", sourceLabel: "Analysis", point: { x: -0.922025, y: -0.353132, z: 0.114910 } },
      { id: "card-52", sourceLabel: "Projects", point: { x: 0.599127, y: -0.381579, z: -0.703878 } },
      { id: "card-53", sourceLabel: "Investments", point: { x: 0.033473, y: -0.410342, z: 0.917897 } },
      { id: "card-54", sourceLabel: "Settings", point: { x: -0.639879, y: -0.439421, z: -0.649313 } },
      { id: "card-55", sourceLabel: "Profile", point: { x: 0.902445, y: -0.468816, z: 0.046143 } },
      { id: "card-56", sourceLabel: "Transactions", point: { x: -0.661253, y: -0.478079, z: 0.546360 } },
      { id: "card-57", sourceLabel: "Reconciliation", point: { x: 0.117176, y: -0.507000, z: -0.839860 } },
      { id: "card-58", sourceLabel: "Forecast", point: { x: 0.474652, y: -0.536237, z: 0.689341 } },
      { id: "card-59", sourceLabel: "Safeguards", point: { x: -0.803552, y: -0.565789, z: -0.184895 } },
      { id: "card-60", sourceLabel: "Insights", point: { x: 0.705356, y: -0.595658, z: -0.399626 } },
      { id: "card-61", sourceLabel: "Account", point: { x: -0.245406, y: -0.625842, z: 0.756467 } },
      { id: "card-62", sourceLabel: "Assets", point: { x: -0.322930, y: -0.656342, z: -0.707994 } },
      { id: "card-63", sourceLabel: "Liabilities", point: { x: 0.670241, y: -0.658974, z: 0.284350 } },
      { id: "card-64", sourceLabel: "Reports", point: { x: -0.667483, y: -0.689000, z: 0.236409 } },
      { id: "card-65", sourceLabel: "Cash Flow", point: { x: 0.322102, y: -0.719342, z: -0.605667 } },
      { id: "card-66", sourceLabel: "Analysis", point: { x: 0.165472, y: -0.750000, z: 0.640405 } },
      { id: "card-67", sourceLabel: "Projects", point: { x: -0.531701, y: -0.780974, z: -0.345557 } },
      { id: "card-68", sourceLabel: "Investments", point: { x: 0.595403, y: -0.812263, z: -0.099338 } },
      { id: "card-69", sourceLabel: "Settings", point: { x: -0.350834, y: -0.843868, z: 0.448470 } },
      { id: "card-70", sourceLabel: "Profile", point: { x: -0.039540, y: -0.839868, z: -0.507328 } },
      { id: "card-71", sourceLabel: "Transactions", point: { x: 0.340798, y: -0.871000, z: 0.318370 } },
      { id: "card-72", sourceLabel: "Reconciliation", point: { x: -0.416663, y: -0.902447, z: -0.004065 } },
      { id: "card-73", sourceLabel: "Forecast", point: { x: 0.265374, y: -0.934211, z: -0.238385 } },
      { id: "card-74", sourceLabel: "Safeguards", point: { x: -0.027186, y: -0.966289, z: 0.278535 } },
      { id: "card-75", sourceLabel: "Insights", point: { x: -0.098285, y: -0.998684, z: -0.130820 } },
    ] as const,
  },
} as const;
