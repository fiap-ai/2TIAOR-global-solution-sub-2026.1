// TerraVista — drawer navigation with a Paper app bar per screen and a custom
// drawer footer carrying the signed-in user and a sign-out action.
// Author: Gabriel Mule (RM 560586)

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";
import { Appbar, Divider, Drawer as PaperDrawer, Text, useTheme } from "react-native-paper";
import { useAuth } from "../AuthContext";
import { ChatScreen } from "../screens/ChatScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { KnowledgeScreen } from "../screens/KnowledgeScreen";
import { PredictScreen } from "../screens/PredictScreen";
import { VisionScreen } from "../screens/VisionScreen";

const Drawer = createDrawerNavigator();

// Reusable top app bar with the burger menu and the current route title.
function header({ navigation, route, options }: any) {
  return (
    <Appbar.Header>
      <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />
      <Appbar.Content title={options.title ?? route.name} />
    </Appbar.Header>
  );
}

function DrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ padding: 16, gap: 2 }}>
          <Text variant="titleLarge" style={{ fontWeight: "700" }}>
            TerraVista
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Earth Observation
          </Text>
        </View>
        <Divider />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <Divider />
      <View style={{ padding: 8 }}>
        {user && (
          <Text variant="bodySmall" style={{ paddingHorizontal: 8, color: theme.colors.onSurfaceVariant }}>
            Signed in as {user}
          </Text>
        )}
        <PaperDrawer.Item icon="logout" label="Sign out" onPress={signOut} />
      </View>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ header }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ drawerIcon: ({ color, size }) => <Icon name="view-dashboard" color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Predict"
        component={PredictScreen}
        options={{ drawerIcon: ({ color, size }) => <Icon name="chart-bell-curve" color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Vision"
        component={VisionScreen}
        options={{ drawerIcon: ({ color, size }) => <Icon name="image-search" color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{ drawerIcon: ({ color, size }) => <Icon name="robot" color={color} size={size} /> }}
      />
      <Drawer.Screen
        name="Knowledge"
        component={KnowledgeScreen}
        options={{ drawerIcon: ({ color, size }) => <Icon name="book-open-variant" color={color} size={size} /> }}
      />
    </Drawer.Navigator>
  );
}
