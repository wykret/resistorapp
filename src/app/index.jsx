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

// Helper function to get responsive breakpoints
const getBreakpoint = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'mobile';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Memoized color band component for better performance
const ColorBand = React.memo(({ color, onPress, isSelected, size = "medium" }) => {
  const { colors, glassmorphism } = useTheme();
  const colorData = RESISTOR_COLORS[color];
  const breakpoint = getBreakpoint();

  // Responsive sizing based on screen size
  const getBandSize = () => {
    if (breakpoint === 'mobile') {
      return size === "large" ? 50 : size === "small" ? 25 : 35;
    } else if (breakpoint === 'tablet') {
      return size === "large" ? 55 : size === "small" ? 28 : 38;
    } else {
      return size === "large" ? 60 : size === "small" ? 30 : 40;
    }
  };

  const bandSize = getBandSize();

  // Responsive styling based on breakpoint
  const containerStyle = {
    width: bandSize,
    height: bandSize,
    backgroundColor: colorData.color,
    borderRadius: breakpoint === 'mobile' ? 8 : 12,
    borderWidth: isSelected ? (breakpoint === 'mobile' ? 2 : 3) : 1,
    borderColor: isSelected ? colors.primary : (breakpoint === 'mobile' ? colors.border : glassmorphism.borderColor),
    marginHorizontal: breakpoint === 'mobile' ? 2 : 4,
    marginVertical: breakpoint === 'mobile' ? 2 : 4,
    shadowColor: breakpoint === 'mobile' ? (isSelected ? colors.primary : "#000") : (isSelected ? glassmorphism.shadowColor : "#000"),
    shadowOffset: { width: 0, height: isSelected ? (breakpoint === 'mobile' ? 4 : 6) : (breakpoint === 'mobile' ? 1 : 2) },
    shadowOpacity: breakpoint === 'mobile' ? (isSelected ? 0.3 : 0.1) : (isSelected ? glassmorphism.shadowOpacity : 0.15),
    shadowRadius: breakpoint === 'mobile' ? (isSelected ? 8 : 3) : (isSelected ? 12 : 4),
    elevation: isSelected ? (breakpoint === 'mobile' ? 6 : 8) : (breakpoint === 'mobile' ? 2 : 3),
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={containerStyle}
    />
  );
});

// Memoized tolerance option component with responsive design
const ToleranceOption = React.memo(({ color, isSelected, onPress }) => {
  const { colors } = useTheme();
  const colorData = RESISTOR_COLORS[color];
  const breakpoint = getBreakpoint();

  // Responsive sizing and styling
  const getDimensions = () => {
    if (breakpoint === 'mobile') {
      return {
        containerPadding: { horizontal: 8, vertical: 6 },
        colorIndicator: { width: 12, height: 12, marginRight: 4 },
        textSize: 11,
        minWidth: 50,
        borderRadius: 6,
      };
    } else if (breakpoint === 'tablet') {
      return {
        containerPadding: { horizontal: 10, vertical: 7 },
        colorIndicator: { width: 14, height: 14, marginRight: 5 },
        textSize: 11.5,
        minWidth: 55,
        borderRadius: 7,
      };
    } else {
      return {
        containerPadding: { horizontal: 12, vertical: 8 },
        colorIndicator: { width: 16, height: 16, marginRight: 6 },
        textSize: 12,
        minWidth: 60,
        borderRadius: 8,
      };
    }
  };

  const dimensions = getDimensions();

  const containerStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isSelected ? colors.primary : colors.surface,
    borderRadius: dimensions.borderRadius,
    paddingHorizontal: dimensions.containerPadding.horizontal,
    paddingVertical: dimensions.containerPadding.vertical,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary : colors.border,
    minWidth: dimensions.minWidth,
    justifyContent: "center",
  };

  const colorIndicatorStyle = {
    width: dimensions.colorIndicator.width,
    height: dimensions.colorIndicator.height,
    backgroundColor: colorData.color,
    borderRadius: dimensions.borderRadius,
    marginRight: dimensions.colorIndicator.marginRight,
    borderWidth: color === "white" ? 1 : 0,
    borderColor: colors.border,
  };

  const textStyle = {
    color: isSelected ? "#fff" : colors.text,
    fontSize: dimensions.textSize,
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
  const breakpoint = getBreakpoint();

  // Responsive resistor display sizing
  const getResistorDimensions = () => {
    if (breakpoint === 'mobile') {
      return {
        containerPadding: { vertical: 16, horizontal: 20 },
        resistorWidth: 160,
        resistorHeight: 32,
        bandWidth: bandCount === 5 ? 10 : 12,
        bandHeight: 28,
        leadWidth: 16,
        marginVertical: 15,
      };
    } else if (breakpoint === 'tablet') {
      return {
        containerPadding: { vertical: 20, horizontal: 28 },
        resistorWidth: 180,
        resistorHeight: 36,
        bandWidth: bandCount === 5 ? 11 : 14,
        bandHeight: 32,
        leadWidth: 18,
        marginVertical: 18,
      };
    } else {
      return {
        containerPadding: { vertical: 24, horizontal: 32 },
        resistorWidth: 200,
        resistorHeight: 40,
        bandWidth: bandCount === 5 ? 12 : 15,
        bandHeight: 35,
        leadWidth: 20,
        marginVertical: 20,
      };
    }
  };

  const dimensions = getResistorDimensions();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderRadius: breakpoint === 'mobile' ? 16 : 24,
        paddingVertical: dimensions.containerPadding.vertical,
        paddingHorizontal: dimensions.containerPadding.horizontal,
        marginVertical: dimensions.marginVertical,
        shadowColor: glassmorphism.shadowColor,
        shadowOffset: { width: 0, height: breakpoint === 'mobile' ? 6 : 8 },
        shadowOpacity: glassmorphism.shadowOpacity,
        shadowRadius: breakpoint === 'mobile' ? 12 : 16,
        elevation: breakpoint === 'mobile' ? 6 : 8,
      }}
    >
      {/* Resistor body */}
      <View
        style={{
          width: dimensions.resistorWidth,
          height: dimensions.resistorHeight,
          backgroundColor: "#F5DEB3",
          borderRadius: breakpoint === 'mobile' ? 16 : 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: breakpoint === 'mobile' ? 8 : 10,
        }}
      >
        {bands.slice(0, bandCount).map((band, index) => (
          <View
            key={index}
            style={{
              width: dimensions.bandWidth,
              height: dimensions.bandHeight,
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
          left: -dimensions.leadWidth,
          width: dimensions.leadWidth,
          height: 2,
          backgroundColor: "#C0C0C0",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -dimensions.leadWidth,
          width: dimensions.leadWidth,
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
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Mode Toggle */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginVertical: 10,
            borderRadius: 16,
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
              padding: 12,
              backgroundColor:
                mode === "colorToValue" ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: mode === "colorToValue" ? "#fff" : colors.text,
                fontWeight: "600",
              }}
            >
              {t("colorToValue")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("valueToColor")}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor:
                mode === "valueToColor" ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: mode === "valueToColor" ? "#fff" : colors.text,
                fontWeight: "600",
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
            marginHorizontal: 20,
            marginVertical: 10,
            borderRadius: 16,
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
              padding: 12,
              backgroundColor: bandCount === 4 ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: bandCount === 4 ? "#fff" : colors.text,
                fontWeight: "600",
              }}
            >
              {t("fourBands")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBandCount(5)}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: bandCount === 5 ? colors.primary : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: bandCount === 5 ? "#fff" : colors.text,
                fontWeight: "600",
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
              marginHorizontal: 20,
              marginVertical: 20,
            }}
          >
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 24,
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
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 15,
                  textAlign: "center",
                }}
              >
                {t("results")}
              </Text>

              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    marginBottom: 5,
                  }}
                >
                  {t("resistance")}
                  {!result && currentResistance && ` (${t("approximate")})`}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {formatResistance(result ? result.resistance : currentResistance)}
                </Text>
              </View>

              {result && (
                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                      marginBottom: 5,
                    }}
                  >
                    {t("tolerance")}
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
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
              marginHorizontal: 20,
              marginVertical: 10,
            }}
          >
            <View
              style={{
                borderRadius: breakpoint === 'mobile' ? 16 : 20,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: breakpoint === 'mobile' ? 16 : 24,
                shadowColor: glassmorphism.shadowColor,
                shadowOffset: glassmorphism.shadowOffset,
                shadowOpacity: glassmorphism.shadowOpacity * (breakpoint === 'mobile' ? 0.3 : 0.5),
                shadowRadius: breakpoint === 'mobile' ? 6 : 8,
                elevation: breakpoint === 'mobile' ? 3 : 4,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 10,
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
                  borderRadius: 12,
                  padding: 15,
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: 15,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              {/* Tolerance Selection */}
              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  {t("tolerance")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
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
          <View style={{ marginHorizontal: 20 }}>
            {Array.from({ length: bandCount }, (_, bandIndex) => (
              <View key={bandIndex} style={{ marginVertical: 10 }}>
                <View
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    backgroundColor: glassmorphism.backgroundColorLight,
                    borderWidth: 1,
                    borderColor: glassmorphism.borderColor,
                    padding: 18,
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
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 4,
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
                      fontSize: 12,
                      marginBottom: 10,
                    }}
                  >
                    {bandIndex < bandCount - 2
                      ? t("digitInstruction")
                      : bandIndex === bandCount - 2
                        ? t("multiplierInstruction")
                        : t("toleranceInstruction")}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", paddingVertical: 5 }}>
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
            marginHorizontal: 20,
            marginVertical: 10,
            backgroundColor: colors.success,
            borderRadius: 16,
            padding: 18,
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
          <Heart size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
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
            marginHorizontal: 20,
            marginVertical: 10,
            backgroundColor: colors.accent,
            borderRadius: 16,
            padding: 18,
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
              fontSize: 16,
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
