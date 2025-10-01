/*
 * Resistor App - Mobile
 * Copyright (C) 2025 wykret
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react-native";

const LanguageSelector = ({ onLanguageSelect }) => {
  const { colors, glassmorphism } = useTheme();
  const { t } = useLanguage();

  const languages = [
    { code: "en", name: t("english"), flag: "🇺🇸" },
    { code: "pt", name: t("portuguese"), flag: "🇧🇷" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: glassmorphism.backgroundColor,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: glassmorphism.shadowColor,
              shadowOffset: glassmorphism.shadowOffset,
              shadowOpacity: glassmorphism.shadowOpacity,
              shadowRadius: glassmorphism.shadowRadius,
              elevation: 8,
            }}
          >
            <Globe size={40} color={colors.primary} />
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {t("selectLanguage")}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Choose your preferred language to continue
          </Text>
        </View>

        {/* Language Options */}
        <View style={{ marginBottom: 40 }}>
          {languages.map((language, index) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => onLanguageSelect(language.code)}
              style={{
                marginVertical: 8,
              }}
            >
              <BlurView
                intensity={glassmorphism.blurIntensity}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: glassmorphism.backgroundColor,
                  borderWidth: 1,
                  borderColor: glassmorphism.borderColor,
                  shadowColor: glassmorphism.shadowColor,
                  shadowOffset: glassmorphism.shadowOffset,
                  shadowOpacity: glassmorphism.shadowOpacity,
                  shadowRadius: glassmorphism.shadowRadius,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <Text style={{ fontSize: 32, marginRight: 16 }}>
                    {language.flag}
                  </Text>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {language.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      {language.code === "en" ? "English" : "Português"}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View
          style={{
            alignItems: "center",
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            You can change this later in the settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelector;
