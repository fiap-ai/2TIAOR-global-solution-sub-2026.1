// TerraVista — login screen (mock auth). Mirrors web/src/pages/Login.tsx.
// Author: Gabriel Mule (RM 560586)

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { Avatar, Button, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { useAuth } from "../AuthContext";
import { login } from "../lib/api";

export function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("terravista");
  const [error, setError] = useState(false);

  const mutation = useMutation({
    mutationFn: () => login({ username, password }),
    onSuccess: (data) => signIn(data.token, data.user),
    onError: () => setError(true),
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        padding: 24,
        gap: 8,
      }}
    >
      <View style={{ alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Avatar.Icon icon="satellite-variant" size={56} />
        <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
          TerraVista
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
        >
          Earth Observation for Climate & Agricultural Resilience
        </Text>
      </View>

      <TextInput
        label="Username"
        mode="outlined"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        mode="contained"
        onPress={() => mutation.mutate()}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        style={{ marginTop: 8 }}
      >
        Sign in
      </Button>
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", marginTop: 8 }}
      >
        Demo credentials: admin / terravista
      </Text>

      <Snackbar visible={error} onDismiss={() => setError(false)} duration={3000}>
        Invalid username or password.
      </Snackbar>
    </View>
  );
}
