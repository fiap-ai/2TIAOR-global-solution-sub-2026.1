// TerraVista — compact explanatory box with an expandable "Learn more" detail.
// Mirrors web/src/components/InfoNote.tsx. Always shows a one-line gist; the
// optional detail expands on tap to surface the deeper theory.
// Author: Gabriel Mule (RM 560586)

import { useState } from "react";
import { View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "react-native-paper";

interface InfoNoteProps {
  title: string;
  children: string; // always-visible short text
  detail?: string; // optional expandable theory
}

export function InfoNote({ title, children, detail }: InfoNoteProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Surface
      elevation={1}
      style={{
        borderRadius: 12,
        padding: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: theme.colors.outline,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <IconButton
          icon="information"
          size={16}
          iconColor={theme.colors.primary}
          style={{ margin: 0 }}
        />
        <Text variant="labelLarge" style={{ flex: 1 }}>
          {title}
        </Text>
      </View>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {children}
      </Text>
      {detail && (
        <>
          <Text
            variant="labelMedium"
            onPress={() => setOpen((v) => !v)}
            style={{ color: theme.colors.primary, marginTop: 4 }}
          >
            {open ? "Show less" : "Learn more"}
          </Text>
          {open && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {detail}
            </Text>
          )}
        </>
      )}
    </Surface>
  );
}
