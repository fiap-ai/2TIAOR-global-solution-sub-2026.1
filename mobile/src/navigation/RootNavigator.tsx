// TerraVista — root gate: show a splash while the session loads, then the Login
// screen or the authenticated Drawer.
// Author: Gabriel Mule (RM 560586)

import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "../AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { DrawerNavigator } from "./DrawerNavigator";

export function RootNavigator() {
  const { ready, signedIn } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return signedIn ? <DrawerNavigator /> : <LoginScreen />;
}
