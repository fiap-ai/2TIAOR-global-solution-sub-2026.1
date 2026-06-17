// TerraVista — Paper MD3 dark theme tuned to match the web app palette.
// Author: Gabriel Mule (RM 560586)

import { MD3DarkTheme } from "react-native-paper";

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#38bdf8", // sky-400, the web accent
    onPrimary: "#08111f",
    background: "#0b1120", // slate-950-ish, matches app background
    surface: "#0f172a", // slate-900 cards
    surfaceVariant: "#1e293b",
    onSurfaceVariant: "#94a3b8", // muted-foreground
    outline: "#1e293b",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#0f172a",
      level2: "#111c30",
      level3: "#16223a",
    },
  },
};
