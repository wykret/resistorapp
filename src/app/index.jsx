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

// Memoized color band component for better performance
const ColorBand = React.memo(({ color, onPress, isSelected, size = "medium" }) => {
  const { colors, glassmorphism } = useTheme();
  const colorData = RESISTOR_COLORS[color];
  const bandSize = size === "large" ? 60 : size === "small" ? 30 : 40;

  // Platform-specific styling for better mobile performance
  const containerStyle = Platform.OS === 'web' && window.innerWidth < 768 ? {
    // Simplified styling for mobile web
    width: bandSize,
    height: bandSize,
    backgroundColor: colorData.color,
    borderRadius: 8,
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? colors.primary : colors.border,
    marginHorizontal: 2,
    marginVertical: 2,
  } : {
    // Full styling for desktop and native
    width: bandSize,
    height: bandSize,
    backgroundColor: colorData.color,
    borderRadius: 12,
    borderWidth: isSelected ? 3 : 1,
    borderColor: isSelected ? colors.primary : glassmorphism.borderColor,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: isSelected ? glassmorphism.shadowColor : "#000",
    shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
    shadowOpacity: isSelected ? glassmorphism.shadowOpacity : 0.15,
    shadowRadius: isSelected ? 12 : 4,
    elevation: isSelected ? 8 : 3,
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

  // Platform-specific styling for mobile optimization
  const containerStyle = Platform.OS === 'web' && window.innerWidth < 768 ? {
    // Simplified mobile web styling
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isSelected ? colors.primary : colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary : colors.border,
    minWidth: 50,
    justifyContent: "center",
  } : {
    // Full styling for desktop and native
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isSelected ? colors.primary : colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary : colors.border,
    minWidth: 60,
    justifyContent: "center",
  };

  const colorIndicatorStyle = Platform.OS === 'web' && window.innerWidth < 768 ? {
    // Simplified for mobile
    width: 12,
    height: 12,
    backgroundColor: colorData.color,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: color === "white" ? 1 : 0,
    borderColor: colors.border,
  } : {
    // Full styling for desktop and native
    width: 16,
    height: 16,
    backgroundColor: colorData.color,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: color === "white" ? 1 : 0,
    borderColor: colors.border,
  };

  const textStyle = Platform.OS === 'web' && window.innerWidth < 768 ? {
    // Simplified mobile text
    color: isSelected ? "#fff" : colors.text,
    fontSize: 11,
    fontWeight: "600",
  } : {
    // Full styling for desktop and native
    color: isSelected ? "#fff" : colors.text,
    fontSize: 12,
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

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 32,
        marginVertical: 20,
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
          width: 200,
          height: 40,
          backgroundColor: "#F5DEB3",
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingHorizontal: 10,
        }}
      >
        {bands.slice(0, bandCount).map((band, index) => (
          <View
            key={index}
            style={{
              width: bandCount === 5 ? 12 : 15,
              height: 35,
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
          left: -20,
          width: 20,
          height: 2,
          backgroundColor: "#C0C0C0",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: -20,
          width: 20,
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
        contentContainerStyle={Platform.OS === 'web' && window.innerWidth < 768 ? {
          // Simplified mobile web styling
          paddingBottom: insets.bottom + 20,
        } : {
          // Full styling for desktop and native
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
              style={Platform.OS === 'web' && window.innerWidth < 768 ? {
                // Simplified mobile web styling for better performance
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 16,
              } : {
                // Full styling for desktop and native
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
                      onPress={setSelectedTolerance}
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
