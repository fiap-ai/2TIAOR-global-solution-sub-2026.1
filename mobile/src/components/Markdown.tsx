// TerraVista — themed markdown renderer for assistant replies (parity with the
// web Markdown component). Wraps react-native-markdown-display with Paper colors.
// Author: Gabriel Mule (RM 560586)

import MarkdownDisplay from "react-native-markdown-display";
import { useTheme } from "react-native-paper";
import { normalizeMarkdown } from "../lib/markdown";

export function Markdown({ children, color }: { children: string; color?: string }) {
  const theme = useTheme();
  const text = color ?? theme.colors.onSurface;

  const styles = {
    body: { color: text, fontSize: 14 },
    heading1: { color: text, fontSize: 18, fontWeight: "700" as const },
    heading2: { color: text, fontSize: 16, fontWeight: "700" as const },
    heading3: { color: text, fontSize: 15, fontWeight: "700" as const },
    strong: { fontWeight: "700" as const },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    code_inline: {
      backgroundColor: theme.colors.surfaceVariant,
      color: text,
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    code_block: {
      backgroundColor: theme.colors.surfaceVariant,
      color: text,
      borderRadius: 8,
      padding: 8,
    },
    fence: {
      backgroundColor: theme.colors.surfaceVariant,
      color: text,
      borderRadius: 8,
      padding: 8,
    },
    link: { color: theme.colors.primary },
  };

  return <MarkdownDisplay style={styles}>{normalizeMarkdown(children)}</MarkdownDisplay>;
}
