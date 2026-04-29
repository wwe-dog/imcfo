import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";
import { theme } from "../styles/theme";

export type AppIconName =
  | "home"
  | "manage"
  | "reports"
  | "profile"
  | "search"
  | "filter"
  | "calendar"
  | "back"
  | "more"
  | "account"
  | "asset"
  | "liability"
  | "netWorth"
  | "cashFlow"
  | "transaction"
  | "chart"
  | "settings"
  | "data"
  | "warning"
  | "success"
  | "close"
  | "add"
  | "edit"
  | "enabled"
  | "disabled"
  | "bank"
  | "wallet"
  | "card"
  | "fund"
  | "securities"
  | "report"
  | "reconcile"
  | "chevronRight";

interface AppIconProps {
  color?: string;
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
}

export default function AppIcon({
  color = theme.colors.textMuted,
  name,
  size = 20,
  strokeWidth = 1.8,
}: AppIconProps) {
  const common = {
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
  };

  const filled = {
    fill: "none",
    ...common,
  };

  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      {(() => {
        switch (name) {
          case "home":
            return (
              <>
                <Path d="M4 11.2 12 4l8 7.2" {...filled} />
                <Path d="M6.5 10.5V20h11V10.5" {...filled} />
                <Path d="M10 20v-5h4v5" {...filled} />
              </>
            );
          case "manage":
            return (
              <>
                <Rect height="13" rx="2.5" width="16" x="4" y="7" {...filled} />
                <Path d="M8 7V5.8C8 4.8 8.8 4 9.8 4h4.4c1 0 1.8.8 1.8 1.8V7" {...filled} />
                <Path d="M8 12h8M8 16h5" {...filled} />
              </>
            );
          case "reports":
          case "report":
            return (
              <>
                <Path d="M7 4h7l3 3v13H7z" {...filled} />
                <Path d="M14 4v4h3M9.5 12h5M9.5 15h5M9.5 18h3" {...filled} />
              </>
            );
          case "profile":
            return (
              <>
                <Circle cx="12" cy="8" r="3.2" {...filled} />
                <Path d="M5.5 20c.8-3.4 3.1-5.2 6.5-5.2s5.7 1.8 6.5 5.2" {...filled} />
              </>
            );
          case "search":
            return (
              <>
                <Circle cx="10.8" cy="10.8" r="5.8" {...filled} />
                <Path d="m15.2 15.2 4.3 4.3" {...filled} />
              </>
            );
          case "filter":
            return (
              <>
                <Path d="M4.5 6h15M7 11h10M10 16h4" {...filled} />
              </>
            );
          case "calendar":
            return (
              <>
                <Rect height="15" rx="2.5" width="16" x="4" y="5" {...filled} />
                <Path d="M8 3.5v3M16 3.5v3M4 9h16M8 13h2M12 13h2M16 13h.1M8 17h2M12 17h2" {...filled} />
              </>
            );
          case "back":
            return <Path d="M15 5 8 12l7 7" {...filled} />;
          case "more":
            return (
              <>
                <Circle cx="6.5" cy="12" r="1" fill={color} />
                <Circle cx="12" cy="12" r="1" fill={color} />
                <Circle cx="17.5" cy="12" r="1" fill={color} />
              </>
            );
          case "account":
            return (
              <>
                <Rect height="13" rx="2.5" width="17" x="3.5" y="6" {...filled} />
                <Path d="M7 10h5M7 14h8" {...filled} />
              </>
            );
          case "asset":
            return (
              <>
                <Path d="M5 19V9l7-4 7 4v10" {...filled} />
                <Path d="M8 19v-6h8v6M9.5 10.5h5" {...filled} />
              </>
            );
          case "liability":
            return (
              <>
                <Rect height="14" rx="2.5" width="16" x="4" y="5" {...filled} />
                <Path d="M8 10h8M8 14h5M16.5 15.5l2.5 2.5" {...filled} />
              </>
            );
          case "netWorth":
            return (
              <>
                <Circle cx="12" cy="12" r="8" {...filled} />
                <Path d="M8.5 12.5 11 15l4.8-6" {...filled} />
              </>
            );
          case "cashFlow":
            return (
              <>
                <Path d="M7 8h11l-3-3M17 16H6l3 3" {...filled} />
                <Circle cx="12" cy="12" r="2.2" {...filled} />
              </>
            );
          case "transaction":
            return (
              <>
                <Path d="M7 7h10M7 12h7M7 17h10" {...filled} />
                <Path d="m16 10 2 2-2 2" {...filled} />
              </>
            );
          case "chart":
            return (
              <>
                <Path d="M5 19V5M5 19h14" {...filled} />
                <Path d="m8 15 3-4 3 2 4-6" {...filled} />
              </>
            );
          case "settings":
            return (
              <>
                <Circle cx="12" cy="12" r="3" {...filled} />
                <Path d="M12 3.8v2M12 18.2v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3.8 12h2M18.2 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...filled} />
              </>
            );
          case "data":
            return (
              <>
                <Path d="M5 7c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Z" {...filled} />
                <Path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" {...filled} />
              </>
            );
          case "warning":
            return (
              <>
                <Path d="M12 4 21 20H3z" {...filled} />
                <Path d="M12 9v5M12 17h.1" {...filled} />
              </>
            );
          case "success":
          case "enabled":
            return (
              <>
                <Circle cx="12" cy="12" r="8" {...filled} />
                <Path d="m8.5 12.3 2.3 2.3 4.9-5.2" {...filled} />
              </>
            );
          case "close":
          case "disabled":
            return (
              <>
                <Circle cx="12" cy="12" r="8" {...filled} />
                <Path d="m9.5 9.5 5 5M14.5 9.5l-5 5" {...filled} />
              </>
            );
          case "add":
            return (
              <>
                <Circle cx="12" cy="12" r="8" {...filled} />
                <Path d="M12 8v8M8 12h8" {...filled} />
              </>
            );
          case "edit":
            return (
              <>
                <Path d="M5 19h4l10-10-4-4L5 15z" {...filled} />
                <Path d="M13.5 6.5 17.5 10.5" {...filled} />
              </>
            );
          case "bank":
            return (
              <>
                <Path d="M4 9h16L12 4zM6 9v8M10 9v8M14 9v8M18 9v8M4 19h16" {...filled} />
              </>
            );
          case "wallet":
            return (
              <>
                <Rect height="13" rx="2.5" width="17" x="3.5" y="6" {...filled} />
                <Path d="M16 10.5h4v5h-4a2.5 2.5 0 0 1 0-5Z" {...filled} />
                <Circle cx="16.5" cy="13" r=".7" fill={color} />
              </>
            );
          case "card":
            return (
              <>
                <Rect height="13" rx="2.5" width="17" x="3.5" y="6" {...filled} />
                <Path d="M4 10h16M7 15h4" {...filled} />
              </>
            );
          case "fund":
            return (
              <>
                <Circle cx="12" cy="12" r="8" {...filled} />
                <Path d="M8 14.5c1.5-4.8 5.1-5.4 8-5.4M8 14.5c2.8.7 5.6.1 8-3.4" {...filled} />
              </>
            );
          case "securities":
            return (
              <>
                <Path d="M5 18h14M7 15l3-4 3 2 4-6" {...filled} />
                <Path d="M7 9V6M12 16v-4M17 12V6" {...filled} />
              </>
            );
          case "reconcile":
            return (
              <>
                <Path d="M7 8h9.5l-2-2M17 16H7.5l2 2" {...filled} />
                <Path d="M9 12h6" {...filled} />
              </>
            );
          case "chevronRight":
            return <Polyline points="9 5 16 12 9 19" {...filled} />;
          default:
            return <Circle cx="12" cy="12" r="8" {...filled} />;
        }
      })()}
    </Svg>
  );
}
