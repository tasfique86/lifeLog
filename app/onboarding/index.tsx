import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("$");
  const { register } = useAuthStore();
  const { getComputedScheme } = useThemeStore();

  const theme = getComputedScheme();
  const activeColors = Colors[theme];

  const handleStart = () => {
    if (!name.trim()) return;
    register(name, currency);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: activeColors.background }]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: activeColors.text }]}>
            Welcome to LifeLog
          </Text>
          <Text
            style={[styles.subtitle, { color: activeColors.textSecondary }]}
          >
            Your private, offline-first personal planner.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: activeColors.text }]}>
            What should we call you?
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: activeColors.card,
                color: activeColors.text,
                borderColor: activeColors.border,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={activeColors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text
            style={[styles.label, { color: activeColors.text, marginTop: 24 }]}
          >
            Preferred Currency
          </Text>
          <View style={styles.currencyRow}>
            {["$", "€", "£", "¥", "₹"].map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyBtn,
                  {
                    backgroundColor: activeColors.card,
                    borderColor:
                      currency === curr
                        ? activeColors.primary
                        : activeColors.border,
                  },
                ]}
                onPress={() => setCurrency(curr)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    {
                      color:
                        currency === curr
                          ? activeColors.primary
                          : activeColors.textSecondary,
                    },
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: activeColors.primary,
              opacity: name.trim() ? 1 : 0.6,
            },
          ]}
          onPress={handleStart}
          disabled={!name.trim()}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginBottom: 48,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 12,
  },
  currencyBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  btn: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
