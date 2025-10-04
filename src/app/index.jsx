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

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// BlurView removed for performance - using simple Views instead
import { Menu, Sun, Moon, Calculator, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResponsive, responsiveFontSize, responsiveSpacing, responsivePadding } from "@/utils/responsive";
import {
  RESISTOR_COLORS,
  DIGIT_COLORS,
  MULTIPLIER_COLORS,
  TOLERANCE_COLORS,
  calculateResistance,
  calculateColors,
  formatResistance,
  parseResistanceInput,
} from "@/utils/resistorColors";

// Memoized color band component for better performance
const ColorBand = React.memo(({ color, onPress, isSelected, size = "medium" }) => {
  const { colors, glassmorphism } = useTheme();
  const colorData = RESISTOR_COLORS[color];

  // Responsive band sizing
  const baseSize = responsiveValue({
    mobile: size === "large" ? 50 : size === "small" ? 28 : 36,
    tablet: size === "large" ? 55 : size === "small" ? 30 : 40,
    desktop: size === "large" ? 60 : size === "small" ? 32 : 44,
    large_desktop: size === "large" ? 65 : size === "small" ? 34 : 48,
  });

  const marginSize = responsiveValue({
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large_desktop: 5,
  });

  const borderRadius = responsiveValue({
    mobile: 6,
    tablet: 8,
    desktop: 10,
    large_desktop: 12,
  });

  const borderWidth = responsiveValue({
    mobile: isSelected ? 1.5 : 1,
    tablet: isSelected ? 2 : 1,
    desktop: isSelected ? 2.5 : 1,
    large_desktop: isSelected ? 3 : 1,
  });

  const shadowRadius = responsiveValue({
    mobile: isSelected ? 6 : 2,
    tablet: isSelected ? 8 : 3,
    desktop: isSelected ? 10 : 4,
    large_desktop: isSelected ? 12 : 4,
  });

  const containerStyle = {
    width: baseSize,
    height: baseSize,
    backgroundColor: colorData.color,
    borderRadius,
    borderWidth,
    borderColor: isSelected ? colors.primary : glassmorphism.borderColor,
    marginHorizontal: marginSize,
    marginVertical: marginSize,
    shadowColor: isSelected ? glassmorphism.shadowColor : "#000",
    shadowOffset: { width: 0, height: isSelected ? shadowRadius * 1.5 : shadowRadius * 0.5 },
    shadowOpacity: isSelected ? glassmorphism.shadowOpacity : 0.15,
    shadowRadius,
    elevation: isSelected ? shadowRadius * 2 : shadowRadius * 0.75,
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={containerStyle}
    />
  );
});

// Memoized tolerance option component for mobile performance
const ToleranceOption = React.memo(({ color, isSelected, onPress }) => {
  const { colors } = useTheme();
  const colorData = RESISTOR_COLORS[color];

  // Responsive styling
  const borderRadius = responsiveValue({
    mobile: 5,
    tablet: 6,
    desktop: 7,
    large_desktop: 8,
  });

  const paddingHorizontal = responsiveValue({
    mobile: 6,
    tablet: 8,
    desktop: 10,
    large_desktop: 12,
  });

  const paddingVertical = responsiveValue({
    mobile: 4,
    tablet: 6,
    desktop: 7,
    large_desktop: 8,
  });

  const minWidth = responsiveValue({
    mobile: 45,
    tablet: 50,
    desktop: 55,
    large_desktop: 60,
  });

  const colorIndicatorSize = responsiveValue({
    mobile: 10,
    tablet: 12,
    desktop: 14,
    large_desktop: 16,
  });

  const marginRight = responsiveValue({
    mobile: 3,
    tablet: 4,
    desktop: 5,
    large_desktop: 6,
  });

  const fontSize = responsiveValue({
    mobile: 10,
    tablet: 11,
    desktop: 11.5,
    large_desktop: 12,
  });

  const containerStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isSelected ? colors.primary : colors.surface,
    borderRadius,
    paddingHorizontal,
    paddingVertical,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary : colors.border,
    minWidth,
    justifyContent: "center",
  };

  const colorIndicatorStyle = {
    width: colorIndicatorSize,
    height: colorIndicatorSize,
    backgroundColor: colorData.color,
    borderRadius: borderRadius * 0.8,
    marginRight,
    borderWidth: color === "white" ? 1 : 0,
    borderColor: colors.border,
  };

  const textStyle = {
    color: isSelected ? "#fff" : colors.text,
    fontSize,
    fontWeight: "600",
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={containerStyle}
    >
      <View style={colorIndicatorStyle} />
      <Text style={textStyle}>
        ±{colorData.tolerance}%
      </Text>
    </TouchableOpacity>
  );
});

const ResistorDisplay = ({ bands, bandCount }) => {
  const { colors, glassmorphism } = useTheme();

  // Responsive resistor sizing
  const resistorWidth = responsiveValue({
    mobile: 180,
    tablet: 220,
    desktop: 260,
    large_desktop: 300,
  });

  const resistorHeight = responsiveValue({
    mobile: 36,
    tablet: 44,
    desktop: 52,
    large_desktop: 60,
  });

  const bandWidth = responsiveValue({
    mobile: bandCount === 5 ? 10 : 12,
    tablet: bandCount === 5 ? 12 : 15,
    desktop: bandCount === 5 ? 14 : 18,
    large_desktop: bandCount === 5 ? 16 : 20,
  });

  const bandHeight = responsiveValue({
    mobile: 30,
    tablet: 38,
    desktop: 46,
    large_desktop: 54,
  });

  const leadWidth = responsiveValue({
    mobile: 16,
    tablet: 20,
    desktop: 24,
    large_desktop: 28,
  });

  const paddingVertical = responsiveValue({
    mobile: 16,
    tablet: 20,
    desktop: 24,
    large_desktop: 28,
  });

  const paddingHorizontal = responsiveValue({
    mobile: 20,
    tablet: 28,
    desktop: 36,
    large_desktop: 44,
  });

  const marginVertical = responsiveValue({
    mobile: 16,
    tablet: 20,
    desktop: 24,
    large_desktop: 28,
  });

  const borderRadius = responsiveValue({
    mobile: 18,
    tablet: 22,
    desktop: 26,
    large_desktop: 30,
  });

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderRadius,
        paddingVertical,
        paddingHorizontal,
        marginVertical,
        shadowColor: glassmorphism.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: glassmorphism.shadowOpacity,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* Resistor body */}
      <View
        style={{
          width: resistorWidth,
          height: resistorHeight,
          backgroundColor: "#F5DEB3",
          borderRadius: resistorHeight * 0.5,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: resistorWidth * 0.05,
        }}
      >
        {bands.slice(0, bandCount).map((band, index) => (
          <View
            key={index}
            style={{
              width: bandWidth,
              height: bandHeight,
              backgroundColor: band
                ? RESISTOR_COLORS[band].color
                : colors.border,
              borderRadius: 2,
              borderWidth: band === "white" ? 1 : 0,
              borderColor: colors.border,
            }}
          />
        ))}
      </View>

      {/* Resistor leads */}
      <View
        style={{
          position: "absolute",
          left: -leadWidth,
          width: leadWidth,
          height: 2,
          backgroundColor: "#C0C0C0",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -leadWidth,
          width: leadWidth,
          height: 2,
          backgroundColor: "#C0C0C0",
        }}
      />
    </View>
  );
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, glassmorphism, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const responsive = useResponsive();

  const [mode, setMode] = useState("colorToValue"); // 'colorToValue' or 'valueToColor'
  const [bandCount, setBandCount] = useState(4);
  const [selectedBands, setSelectedBands] = useState(Array(5).fill(null));
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [currentResistance, setCurrentResistance] = useState(null); // New state for intermediate resistance
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTolerance, setSelectedTolerance] = useState("gold"); // Default tolerance for 4-band
  
  // Animation refs removed for performance

  // Reset bands and result when band count changes
  useEffect(() => {
    resetCalculator();
  }, [bandCount]);

  // Reset bands and result when mode changes
  useEffect(() => {
    resetCalculator();
  }, [mode]);

  // Update default tolerance when band count changes
  useEffect(() => {
    setSelectedTolerance(bandCount === 4 ? "gold" : "brown");
  }, [bandCount]);

  // Auto-calculate when input value or tolerance changes in valueToColor mode
  useEffect(() => {
    if (mode === "valueToColor" && inputValue.trim()) {
      const resistance = parseResistanceInput(inputValue);
      if (resistance) {
        const calculation = calculateColors(resistance, bandCount);
        if (calculation) {
          // Use the selected tolerance instead of the calculated one
          const toleranceValue = RESISTOR_COLORS[selectedTolerance]?.tolerance;
          setSelectedBands([...calculation.bands.slice(0, bandCount - 1), selectedTolerance].concat(Array(5 - bandCount).fill(null)).slice(0, 5));
          setResult({
            resistance: calculation.resistance,
            tolerance: toleranceValue,
            tempCoefficient: null,
          });
        } else {
          // Clear result if calculation fails
          setResult(null);
          setSelectedBands(Array(5).fill(null));
        }
      } else {
        // Clear result if input is invalid
        setResult(null);
        setSelectedBands(Array(5).fill(null));
      }
    } else if (mode === "valueToColor") {
      // Clear result if no input
      setResult(null);
      setSelectedBands(Array(5).fill(null));
    }
  }, [inputValue, selectedTolerance, bandCount, mode]);

  const calculateIntermediateResistance = useCallback((bands, count) => {
    let resistance = null;
    if (count === 4) {
      const [digit1, digit2, multiplier] = bands;
      if (digit1 && digit2 && multiplier) {
        const value1 = RESISTOR_COLORS[digit1]?.value;
        const value2 = RESISTOR_COLORS[digit2]?.value;
        const mult = RESISTOR_COLORS[multiplier]?.multiplier;
        if (value1 !== null && value2 !== null && mult !== null) {
          resistance = (value1 * 10 + value2) * mult;
        }
      }
    } else if (count === 5) {
      const [digit1, digit2, digit3, multiplier] = bands;
      if (digit1 && digit2 && digit3 && multiplier) {
        const value1 = RESISTOR_COLORS[digit1]?.value;
        const value2 = RESISTOR_COLORS[digit2]?.value;
        const value3 = RESISTOR_COLORS[digit3]?.value;
        const mult = RESISTOR_COLORS[multiplier]?.multiplier;
        if (value1 !== null && value2 !== null && value3 !== null && mult !== null) {
          resistance = (value1 * 100 + value2 * 10 + value3) * mult;
        }
      }
    }
    return resistance;
  }, []);

  // Menu animation removed for performance

  const handleColorSelect = useCallback(
    (bandIndex, color) => {
      const newBands = [...selectedBands];
      newBands[bandIndex] = color;
      setSelectedBands(newBands);

      // Calculate intermediate resistance
      const intermediateResistance = calculateIntermediateResistance(newBands, bandCount);
      setCurrentResistance(intermediateResistance);

      // Auto-calculate when all required bands are selected
      const requiredBands = newBands.slice(0, bandCount);
      if (requiredBands.every((band) => band !== null)) {
        const calculation = calculateResistance(requiredBands);
        setResult(calculation);
      } else {
        setResult(null); // Clear full result if not all bands are selected
      }
    },
    [selectedBands, bandCount, calculateIntermediateResistance],
  );



  const resetCalculator = useCallback(() => {
    setSelectedBands(Array(5).fill(null));
    setInputValue("");
    setResult(null);
    setCurrentResistance(null); // Clear intermediate resistance
  }, []);

  const getAvailableColors = (bandIndex) => {
    if (bandIndex < bandCount - 2) {
      return DIGIT_COLORS;
    } else if (bandIndex === bandCount - 2) {
      return MULTIPLIER_COLORS;
    } else {
      return TOLERANCE_COLORS;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={{
            padding: 12,
            borderRadius: 16,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 8,
          }}
        >
          <Menu size={24} color={colors.text} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: colors.text,
            flex: 1,
            textAlign: "center",
          }}
        >
          {t("resistor")}
        </Text>

        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            padding: 12,
            borderRadius: 16,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 8,
          }}
        >
          {isDark ? (
            <Sun size={24} color={colors.text} />
          ) : (
            <Moon size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Menu Overlay */}
      {showMenu && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 60,
            left: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: glassmorphism.backgroundColorHeavy,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
              shadowColor: glassmorphism.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: glassmorphism.shadowOpacity * 0.5,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                router.push("/support");
              }}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: glassmorphism.borderColor,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t("support")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                router.push("/language");
              }}
              style={{
                padding: 16,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t("language")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: responsivePadding(insets.bottom + 20, insets.bottom + 25, insets.bottom + 30, insets.bottom + 35),
          // Use more horizontal space on larger screens
          paddingHorizontal: responsiveValue({
            mobile: 0,
            tablet: 20,
            desktop: 40,
            large_desktop: 60,
          }),
          maxWidth: responsiveValue({
            mobile: '100%',
            tablet: '100%',
            desktop: 1200,
            large_desktop: 1400,
          }),
          alignSelf: 'center',
          width: '100%',
        }}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Mode Toggle */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            marginVertical: responsiveValue({
              mobile: 8,
              tablet: 10,
              desktop: 12,
              large_desktop: 14,
            }),
            borderRadius: responsiveValue({
              mobile: 12,
              tablet: 14,
              desktop: 16,
              large_desktop: 18,
            }),
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            overflow: "hidden",
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => setMode("colorToValue")}
            style={{
              flex: 1,
              paddingVertical: responsiveValue({
                mobile: 10,
                tablet: 12,
                desktop: 14,
                large_desktop: 16,
              }),
              paddingHorizontal: responsiveValue({
                mobile: 8,
                tablet: 10,
                desktop: 12,
                large_desktop: 14,
              }),
              backgroundColor:
                mode === "colorToValue" ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: mode === "colorToValue" ? "#fff" : colors.text,
                fontWeight: "600",
                fontSize: responsiveFontSize(14, 15, 16, 17),
              }}
            >
              {t("colorToValue")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("valueToColor")}
            style={{
              flex: 1,
              paddingVertical: responsiveValue({
                mobile: 10,
                tablet: 12,
                desktop: 14,
                large_desktop: 16,
              }),
              paddingHorizontal: responsiveValue({
                mobile: 8,
                tablet: 10,
                desktop: 12,
                large_desktop: 14,
              }),
              backgroundColor:
                mode === "valueToColor" ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: mode === "valueToColor" ? "#fff" : colors.text,
                fontWeight: "600",
                fontSize: responsiveFontSize(14, 15, 16, 17),
              }}
            >
              {t("valueToColor")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Band Count Toggle */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            marginVertical: responsiveValue({
              mobile: 8,
              tablet: 10,
              desktop: 12,
              large_desktop: 14,
            }),
            borderRadius: responsiveValue({
              mobile: 12,
              tablet: 14,
              desktop: 16,
              large_desktop: 18,
            }),
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            overflow: "hidden",
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => setBandCount(4)}
            style={{
              flex: 1,
              paddingVertical: responsiveValue({
                mobile: 10,
                tablet: 12,
                desktop: 14,
                large_desktop: 16,
              }),
              paddingHorizontal: responsiveValue({
                mobile: 8,
                tablet: 10,
                desktop: 12,
                large_desktop: 14,
              }),
              backgroundColor: bandCount === 4 ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: bandCount === 4 ? "#fff" : colors.text,
                fontWeight: "600",
                fontSize: responsiveFontSize(13, 14, 15, 16),
              }}
            >
              {t("fourBands")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBandCount(5)}
            style={{
              flex: 1,
              paddingVertical: responsiveValue({
                mobile: 10,
                tablet: 12,
                desktop: 14,
                large_desktop: 16,
              }),
              paddingHorizontal: responsiveValue({
                mobile: 8,
                tablet: 10,
                desktop: 12,
                large_desktop: 14,
              }),
              backgroundColor: bandCount === 5 ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: bandCount === 5 ? "#fff" : colors.text,
                fontWeight: "600",
                fontSize: responsiveFontSize(13, 14, 15, 16),
              }}
            >
              {t("fiveBands")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resistor Display */}
        <ResistorDisplay bands={selectedBands} bandCount={bandCount} />

        {/* Results - Moved above band selectors */}
        {(result || currentResistance) && (
          <View
            style={{
              marginHorizontal: responsiveValue({
                mobile: 16,
                tablet: 20,
                desktop: 24,
                large_desktop: 28,
              }),
              marginVertical: responsiveValue({
                mobile: 16,
                tablet: 20,
                desktop: 24,
                large_desktop: 28,
              }),
            }}
          >
            <View
              style={{
                borderRadius: responsiveValue({
                  mobile: 16,
                  tablet: 18,
                  desktop: 20,
                  large_desktop: 22,
                }),
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: responsiveValue({
                  mobile: 18,
                  tablet: 22,
                  desktop: 26,
                  large_desktop: 30,
                }),
                shadowColor: glassmorphism.shadowColor,
                shadowOffset: glassmorphism.shadowOffset,
                shadowOpacity: glassmorphism.shadowOpacity * 0.5,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: responsiveFontSize(16, 17, 18, 19),
                  fontWeight: "bold",
                  marginBottom: responsiveValue({
                    mobile: 12,
                    tablet: 14,
                    desktop: 16,
                    large_desktop: 18,
                  }),
                  textAlign: "center",
                }}
              >
                {t("results")}
              </Text>

              <View style={{
                marginBottom: responsiveValue({
                  mobile: 8,
                  tablet: 10,
                  desktop: 12,
                  large_desktop: 14,
                })
              }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: responsiveFontSize(12, 13, 14, 15),
                    marginBottom: responsiveValue({
                      mobile: 4,
                      tablet: 5,
                      desktop: 6,
                      large_desktop: 7,
                    }),
                  }}
                >
                  {t("resistance")}
                  {!result && currentResistance && ` (${t("approximate")})`}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: responsiveFontSize(18, 20, 22, 24),
                    fontWeight: "bold",
                  }}
                >
                  {formatResistance(result ? result.resistance : currentResistance)}
                </Text>
              </View>

              {result && (
                <View style={{
                  marginBottom: responsiveValue({
                    mobile: 8,
                    tablet: 10,
                    desktop: 12,
                    large_desktop: 14,
                  })
                }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: responsiveFontSize(12, 13, 14, 15),
                      marginBottom: responsiveValue({
                        mobile: 4,
                        tablet: 5,
                        desktop: 6,
                        large_desktop: 7,
                      }),
                    }}
                  >
                    {t("tolerance")}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: responsiveFontSize(14, 15, 16, 17),
                      fontWeight: "600",
                    }}
                  >
                    ±{result.tolerance}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {mode === "valueToColor" && (
          <View
            style={{
              marginHorizontal: responsiveValue({
                mobile: 16,
                tablet: 20,
                desktop: 24,
                large_desktop: 28,
              }),
              marginVertical: responsiveValue({
                mobile: 8,
                tablet: 10,
                desktop: 12,
                large_desktop: 14,
              }),
            }}
          >
            <View
              style={{
                borderRadius: responsiveValue({
                  mobile: 12,
                  tablet: 14,
                  desktop: 16,
                  large_desktop: 18,
                }),
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: responsiveValue({
                  mobile: 14,
                  tablet: 18,
                  desktop: 22,
                  large_desktop: 26,
                }),
                shadowColor: glassmorphism.shadowColor,
                shadowOffset: glassmorphism.shadowOffset,
                shadowOpacity: glassmorphism.shadowOpacity * 0.5,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: responsiveFontSize(14, 15, 16, 17),
                  fontWeight: "600",
                  marginBottom: responsiveValue({
                    mobile: 8,
                    tablet: 10,
                    desktop: 12,
                    large_desktop: 14,
                  }),
                }}
              >
                {t("enterValue")}
              </Text>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="100, 1k, 10kΩ, 1MΩ"
                placeholderTextColor={colors.textSecondary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: responsiveValue({
                    mobile: 8,
                    tablet: 10,
                    desktop: 12,
                    large_desktop: 14,
                  }),
                  padding: responsiveValue({
                    mobile: 12,
                    tablet: 14,
                    desktop: 16,
                    large_desktop: 18,
                  }),
                  color: colors.text,
                  fontSize: responsiveFontSize(14, 15, 16, 17),
                  marginBottom: responsiveValue({
                    mobile: 12,
                    tablet: 14,
                    desktop: 16,
                    large_desktop: 18,
                  }),
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              {/* Tolerance Selection */}
              <View style={{
                marginBottom: responsiveValue({
                  mobile: 12,
                  tablet: 14,
                  desktop: 16,
                  large_desktop: 18,
                })
              }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: responsiveFontSize(12, 13, 14, 15),
                    fontWeight: "600",
                    marginBottom: responsiveValue({
                      mobile: 6,
                      tablet: 8,
                      desktop: 10,
                      large_desktop: 12,
                    }),
                  }}
                >
                  {t("tolerance")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: responsiveValue({
                      mobile: 6,
                      tablet: 8,
                      desktop: 10,
                      large_desktop: 12,
                    }),
                  }}
                >
                  {TOLERANCE_COLORS.map((color) => (
                    <ToleranceOption
                      key={color}
                      color={color}
                      isSelected={selectedTolerance === color}
                      onPress={() => setSelectedTolerance(color)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {mode === "colorToValue" && (
          <View style={{
            marginHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            })
          }}>
            {Array.from({ length: bandCount }, (_, bandIndex) => (
              <View key={bandIndex} style={{
                marginVertical: responsiveValue({
                  mobile: 8,
                  tablet: 10,
                  desktop: 12,
                  large_desktop: 14,
                })
              }}>
                <View
                  style={{
                    borderRadius: responsiveValue({
                      mobile: 14,
                      tablet: 16,
                      desktop: 18,
                      large_desktop: 20,
                    }),
                    overflow: "hidden",
                    backgroundColor: glassmorphism.backgroundColorLight,
                    borderWidth: 1,
                    borderColor: glassmorphism.borderColor,
                    padding: responsiveValue({
                      mobile: 14,
                      tablet: 16,
                      desktop: 18,
                      large_desktop: 20,
                    }),
                    shadowColor: glassmorphism.shadowColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: glassmorphism.shadowOpacity * 0.3,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: responsiveFontSize(14, 15, 16, 17),
                      fontWeight: "600",
                      marginBottom: responsiveValue({
                        mobile: 3,
                        tablet: 4,
                        desktop: 5,
                        large_desktop: 6,
                      }),
                    }}
                  >
                    {bandIndex < bandCount - 2
                      ? `${t("digit")} ${bandIndex + 1}`
                      : bandIndex === bandCount - 2
                        ? t("multiplier")
                        : t("tolerance")}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: responsiveFontSize(10, 11, 12, 13),
                      marginBottom: responsiveValue({
                        mobile: 8,
                        tablet: 10,
                        desktop: 12,
                        large_desktop: 14,
                      }),
                    }}
                  >
                    {bandIndex < bandCount - 2
                      ? t("digitInstruction")
                      : bandIndex === bandCount - 2
                        ? t("multiplierInstruction")
                        : t("toleranceInstruction")}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{
                      flexDirection: "row",
                      paddingVertical: responsiveValue({
                        mobile: 4,
                        tablet: 5,
                        desktop: 6,
                        large_desktop: 7,
                      })
                    }}>
                      {getAvailableColors(bandIndex).map((color) => (
                        <ColorBand
                          key={color}
                          color={color}
                          onPress={(selectedColor) =>
                            handleColorSelect(bandIndex, selectedColor)
                          }
                          isSelected={selectedBands[bandIndex] === color}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Support Button */}
        <TouchableOpacity
          onPress={() => router.push("/support")}
          style={{
            marginHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            marginVertical: responsiveValue({
              mobile: 8,
              tablet: 10,
              desktop: 12,
              large_desktop: 14,
            }),
            backgroundColor: colors.success,
            borderRadius: responsiveValue({
              mobile: 12,
              tablet: 14,
              desktop: 16,
              large_desktop: 18,
            }),
            paddingVertical: responsiveValue({
              mobile: 14,
              tablet: 16,
              desktop: 18,
              large_desktop: 20,
            }),
            paddingHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 8,
          }}
        >
          <Heart
            size={responsiveValue({
              mobile: 18,
              tablet: 20,
              desktop: 22,
              large_desktop: 24,
            })}
            color="#fff"
            style={{
              marginRight: responsiveValue({
                mobile: 6,
                tablet: 8,
                desktop: 10,
                large_desktop: 12,
              })
            }}
          />
          <Text
            style={{
              color: "#fff",
              fontSize: responsiveFontSize(14, 15, 16, 17),
              fontWeight: "600",
            }}
          >
            {t("support")}
          </Text>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={resetCalculator}
          style={{
            marginHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            marginVertical: responsiveValue({
              mobile: 8,
              tablet: 10,
              desktop: 12,
              large_desktop: 14,
            }),
            backgroundColor: colors.accent,
            borderRadius: responsiveValue({
              mobile: 12,
              tablet: 14,
              desktop: 16,
              large_desktop: 18,
            }),
            paddingVertical: responsiveValue({
              mobile: 14,
              tablet: 16,
              desktop: 18,
              large_desktop: 20,
            }),
            paddingHorizontal: responsiveValue({
              mobile: 16,
              tablet: 20,
              desktop: 24,
              large_desktop: 28,
            }),
            alignItems: "center",
            shadowColor: glassmorphism.shadowColor,
            shadowOffset: glassmorphism.shadowOffset,
            shadowOpacity: glassmorphism.shadowOpacity,
            shadowRadius: glassmorphism.shadowRadius,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: responsiveFontSize(14, 15, 16, 17),
              fontWeight: "600",
            }}
          >
            {t("reset")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
