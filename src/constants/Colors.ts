/**
 * LifeLog Color Palette
 * Updated to match the "Sky Day / Starry Night" theme.
 */

export const Colors = {
  light: {
    primary: "#0284C7", // Sky 600 - Stronger Blue for primary actions
    primaryLight: "#38BDF8", // Sky 400
    background: "#F0F9FF", // Sky 50 - Soft Sky Blue background
    card: "#FFFFFF", // White cards pop nicely on Sky 50
    text: "#0C4A6E", // Sky 900 - Deep Blue text instead of pure black
    textSecondary: "#475569", // Slate 600
    border: "#BFDBFE", // Sky 200
    error: "#EF4444", // Red 500
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    overlay: "rgba(255,255,255,0.8)", // Lighter overlay for day
  },
  dark: {
    primary: "#38BDF8", // Sky 400 - Bright Blue pop
    primaryLight: "#7DD3FC", // Sky 300
    background: "#020617", // Slate 900 - Deep Night Sky
    card: "#1E293B", // Slate 800 - Lighter Night (Matches Toggle)
    text: "#F0F9FF", // Sky 50 - Very light blue/white text
    textSecondary: "#94A3B8", // Slate 400
    border: "#334155", // Slate 700
    error: "#F87171", // Red 400
    success: "#34D399", // Emerald 400
    warning: "#FBBF24", // Amber 400
    overlay: "rgba(15, 23, 42, 0.8)", // Dark overlay
  },
};

export type ThemeColors = typeof Colors.light;
