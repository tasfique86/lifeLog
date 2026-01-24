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
import { ActivityIndicator, Button, Text, View } from "react-native";
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
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("Initializing DB...");
    initDatabase()
      .then(async () => {
        console.log("DB Init Success");

        // Process recurring tasks
        try {
          const {
            RecurringTaskService,
          } = require("@/services/todo/RecurringTaskService");
          const recurringService = new RecurringTaskService();
          await recurringService.processDailyResets();
        } catch (err) {
          console.error("Recurring Service Error:", err);
        }

        setDbReady(true);
      })
      .catch((e) => {
        console.error("DB Init Failed:", e);
        setDbError(e);
      });
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    console.log("Layout Effect Triggered", {
      user: user ? "Logged In" : "Null",
      segments,
      inTabs: segments[0] === "(tabs)",
      inOnboarding: segments[0] === "onboarding",
    });

    // Hide splash screen once DB is ready
    SplashScreen.hideAsync();

    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inOnboarding) {
      console.log("Redirecting to Onboarding...");
      router.replace("/onboarding");
    } else if (user && (inOnboarding || !segments[0])) {
      // If logged in but in onboarding or root, go to tabs.
      // Allow other routes like /plan/* to persist.
      console.log("Redirecting to Dashboard...");
      router.replace("/(tabs)");
    }
  }, [user, segments, dbReady]);

  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Database Error
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          {dbError.message}
        </Text>
        <Button
          title="Reset Database"
          onPress={async () => {
            try {
              const { resetDatabase } = require("@/db/client");
              await resetDatabase();
              setDbError(null);
              setDbReady(true);
            } catch (e) {
              console.error("Reset failed", e);
            }
          }}
        />
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Initialize Database...</Text>
      </View>
    );
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
