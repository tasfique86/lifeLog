import { Colors } from "@/constants/Colors";
import { initDatabase } from "@/db/client";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { user } = useAuthStore();
  const { getComputedScheme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);
  const colorScheme = getComputedScheme();

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    // Hide splash screen once DB is ready
    SplashScreen.hideAsync();

    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inOnboarding) {
      // Redirect to onboarding if not logged in
      router.replace("/onboarding");
    } else if (user && inOnboarding) {
      // Redirect to dashboard if logged in
      router.replace("/(tabs)");
    }
  }, [user, segments, dbReady]);

  if (!dbReady) {
    return <View />;
  }

  // Custom Theme mapping to React Navigation
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.warning,
    },
  };

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.warning,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? MyDarkTheme : MyLightTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding/index" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
