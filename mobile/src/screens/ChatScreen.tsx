// TerraVista — resilience assistant. Mirrors web/src/pages/Chat.tsx:
// a simple chat with suggestion chips and an input bar.
// Author: Gabriel Mule (RM 560586)

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip, FAB, IconButton, Snackbar, Surface, Text, TextInput, useTheme } from "react-native-paper";
import { Markdown } from "../components/Markdown";
import { chat } from "../lib/api";

// How close to the bottom (px) still counts as "stuck to bottom".
const BOTTOM_THRESHOLD = 40;

interface Message {
  role: "user" | "assistant";
  text: string;
  source?: string;
}

const SUGGESTIONS = [
  "What should I do with a CRITICAL parcel?",
  "How can I reduce wildfire risk in a dry region?",
  "Best practices for low soil moisture?",
];

export function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // Whether the view is stuck to the bottom (drives auto-scroll + the FAB).
  const [atBottom, setAtBottom] = useState(true);

  const mutation = useMutation({
    mutationFn: (message: string) => chat({ message }),
    onSuccess: (data) =>
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, source: data.source },
      ]),
  });

  function scrollToBottom(animated = true) {
    scrollRef.current?.scrollToEnd({ animated });
    setAtBottom(true);
  }

  // Keep the view pinned to the bottom only when the user hasn't scrolled up.
  function onContentSizeChange() {
    if (atBottom) scrollRef.current?.scrollToEnd({ animated: true });
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setAtBottom(distanceFromBottom <= BOTTOM_THRESHOLD);
  }

  function send(text: string) {
    const message = text.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setAtBottom(true);
    mutation.mutate(message);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Text variant="headlineSmall" style={{ fontWeight: "700" }}>
          Resilience Assistant
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Generative-AI guidance for civil defense and agronomy.
        </Text>

        {messages.length === 0 ? (
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Try one of these:
            </Text>
            <View style={{ gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} onPress={() => send(s)} icon="lightbulb-outline">
                  {s}
                </Chip>
              ))}
            </View>
          </View>
        ) : (
          messages.map((m, i) => (
            <Surface
              key={i}
              elevation={1}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                borderRadius: 12,
                padding: 10,
                backgroundColor:
                  m.role === "user" ? theme.colors.primary : theme.colors.surfaceVariant,
              }}
            >
              {m.role === "user" ? (
                <Text style={{ color: theme.colors.onPrimary }}>{m.text}</Text>
              ) : (
                <Markdown>{m.text}</Markdown>
              )}
              {m.source && (
                <Text
                  variant="labelSmall"
                  style={{ marginTop: 4, opacity: 0.6, textTransform: "uppercase" }}
                >
                  source: {m.source}
                </Text>
              )}
            </Surface>
          ))
        )}
        {mutation.isPending && (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Assistant is typing...
          </Text>
        )}
      </ScrollView>

      {!atBottom && messages.length > 0 && (
        <FAB
          icon="chevron-down"
          size="small"
          onPress={() => scrollToBottom(true)}
          style={{
            position: "absolute",
            right: 16,
            // Sit just above the input bar (input height + its bottom inset).
            bottom: 72 + insets.bottom,
          }}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          paddingBottom: 8 + insets.bottom,
          gap: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
        }}
      >
        <TextInput
          mode="outlined"
          dense
          style={{ flex: 1 }}
          placeholder="Ask something..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={() => send(input)}
          disabled={mutation.isPending}
        />
      </View>

      <Snackbar visible={mutation.isError} onDismiss={() => mutation.reset()} duration={3000}>
        Chat failed. Is the backend running?
      </Snackbar>
    </KeyboardAvoidingView>
  );
}
