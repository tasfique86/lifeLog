import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

/* ---------------- ICON ---------------- */

const AnimatedView = Animated.createAnimatedComponent(View);

const TabBarIcon = ({
  focused,
  name,
  color,
}: {
  focused: boolean;
  name: any;
  color: string;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(focused ? 1.15 : 1, {
          damping: 12,
          stiffness: 120,
        }),
      },
    ],
  }));

  return (
    <AnimatedView
      style={[
        styles.iconContainer,
        focused && styles.iconFocused,
        animatedStyle,
      ]}
    >
      <Ionicons name={name} size={28} color={color} />
    </AnimatedView>
  );
};

/* ---------------- CUSTOM TAB BUTTON ---------------- */

const CustomTabBarButton = (props: any) => (
  <Pressable
    {...props}
    style={styles.tabButton}
    android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
    onPress={(e) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      props.onPress?.(e);
    }}
  >
    {props.children}
  </Pressable>
);

/* ---------------- TAB LAYOUT ---------------- */

export default function TabLayout() {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();

  const activeScheme = mode === "system" ? systemScheme ?? "light" : mode;
  const activeColors = Colors[activeScheme];
  const isDark = activeScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 30 : 20,
          marginHorizontal: 20,
          height: 80,
          borderRadius: 50,
          backgroundColor: "transparent",

          borderWidth: Platform.OS === "android" ? 0.6 : 0,
          borderColor: isDark ? "#334155" : "#BFDBFE",

          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },

        // 🔑 THIS IS THE REAL FIX
        tabBarItemStyle: {
          height: 80,
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarBackground: () => (
          <View style={styles.blurWrapper}>
            <BlurView
              intensity={Platform.OS === "android" ? 40 : 80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? "rgba(30,41,59,0.5)"
                    : "rgba(255,255,255,0.4)",
                },
              ]}
            />
          </View>
        ),

        tabBarActiveTintColor: activeColors.primary,
        tabBarInactiveTintColor: activeColors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: CustomTabBarButton,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? "grid" : "grid-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="todos"
        options={{
          tabBarButton: CustomTabBarButton,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="expenses"
        options={{
          tabBarButton: CustomTabBarButton,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? "wallet" : "wallet-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="plans"
        options={{
          tabBarButton: CustomTabBarButton,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              focused={focused}
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  blurWrapper: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  iconFocused: {
    backgroundColor: "rgba(59,130,246,0.15)",
  },
});
