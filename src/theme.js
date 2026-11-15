import { Platform } from "react-native";

export const colors = {
  bgTop: "#0A3FA8",
  bgMid: "#1273E6",
  bgBottom: "#19B5E0",
  ink: "#0E2A5E",
  inkSoft: "#52688F",
  white: "#FFFFFF",
  card: "#FFFFFF",
  cardSoft: "#EEF4FF",
  line: "#D6E3F8",
  link: "#0B4FD1",
  primary: "#22C55E",
  primaryEdge: "#15803D",
  sun: "#FFC83D",
  sunEdge: "#D99A00",
  coral: "#F4506B",
  coralEdge: "#BF2F4B",
  teal: "#12B5A6",
  tealEdge: "#0B8478",
  accent: "#FF8A1F",
  accentEdge: "#D06A08",
  good: "#22C55E",
  goodEdge: "#15803D",
  goodSoft: "#D8FBE4",
  bad: "#F4506B",
  badEdge: "#BF2F4B",
  badSoft: "#FFE1E6",
  neutral: "#FFFFFF",
  neutralEdge: "#C3D3EE",
  glass: "rgba(255,255,255,0.18)",
  glassStrong: "rgba(255,255,255,0.28)"
};

// One colour per answer slot so children can tell options apart before they can read.
export const optionColors = [
  { face: colors.coral, edge: colors.coralEdge, text: colors.white },
  { face: colors.teal, edge: colors.tealEdge, text: colors.white },
  { face: colors.sun, edge: colors.sunEdge, text: colors.ink },
  { face: colors.accent, edge: colors.accentEdge, text: colors.white }
];

export const fontFamily = Platform.select({ ios: "ui-rounded", default: undefined });

export const shadow = {
  shadowColor: "#06204F",
  shadowOpacity: 0.22,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6
};
