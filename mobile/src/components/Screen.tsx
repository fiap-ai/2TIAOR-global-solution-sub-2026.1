// TerraVista — scrollable screen wrapper with a title/subtitle header.
// Author: Gabriel Mule (RM 560586)

import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme } from "react-native-paper";

interface ScreenProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Screen({ title, subtitle, children }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 16 + insets.bottom, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 2 }}>
        <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </ScrollView>
  );
}
