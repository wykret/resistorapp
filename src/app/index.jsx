import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
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

const ColorBand = ({ color, onPress, isSelected, size = "medium" }) => {
  const { colors, glassmorphism } = useTheme();
  const colorData = RESISTOR_COLORS[color];
  const bandSize = size === "large" ? 60 : size === "small" ? 30 : 40;

  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={{
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
      }}
    />
  );
};

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
  const [showMenu, setShowMenu] = useState(false);
  
  // Animações
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Reset bands and result when band count changes
  useEffect(() => {
    resetCalculator();
  }, [bandCount]);

  // Reset bands and result when mode changes
  useEffect(() => {
    resetCalculator();
  }, [mode]);

  // Animações do menu
  useEffect(() => {
    if (showMenu) {
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showMenu]);

  const handleColorSelect = useCallback(
    (bandIndex, color) => {
      const newBands = [...selectedBands];
      newBands[bandIndex] = color;
      setSelectedBands(newBands);

      // Auto-calculate when all required bands are selected
      const requiredBands = newBands.slice(0, bandCount);
      if (requiredBands.every((band) => band !== null)) {
        const calculation = calculateResistance(requiredBands);
        setResult(calculation);
      }
    },
    [selectedBands, bandCount],
  );

  const handleValueToColor = useCallback(() => {
    const resistance = parseResistanceInput(inputValue);
    if (!resistance) {
      Alert.alert(t("error"), t("invalidValue"));
      return;
    }

    const calculation = calculateColors(resistance, bandCount);
    if (calculation) {
      setSelectedBands([...calculation.bands, null].slice(0, 5));
      setResult({
        resistance: calculation.resistance,
        tolerance: calculation.tolerance,
        tempCoefficient: null,
      });
    } else {
      Alert.alert(t("error"), t("invalidValue"));
    }
  }, [inputValue, bandCount, t]);

  const resetCalculator = useCallback(() => {
    setSelectedBands(Array(5).fill(null));
    setInputValue("");
    setResult(null);
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
        <Animated.View
          style={{
            position: "absolute",
            top: insets.top + 60,
            left: 20,
            right: 20,
            zIndex: 1000,
            opacity: menuAnimation,
            transform: [
              {
                scale: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <BlurView
            intensity={glassmorphism.blurIntensityHeavy}
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: glassmorphism.backgroundColorHeavy,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
              shadowColor: glassmorphism.shadowColor,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: glassmorphism.shadowOpacity,
              shadowRadius: 20,
              elevation: 12,
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
          </BlurView>
        </Animated.View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
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

        {mode === "valueToColor" && (
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 10,
            }}
          >
            <BlurView
              intensity={glassmorphism.blurIntensity}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 24,
                shadowColor: glassmorphism.shadowColor,
                shadowOffset: glassmorphism.shadowOffset,
                shadowOpacity: glassmorphism.shadowOpacity,
                shadowRadius: glassmorphism.shadowRadius,
                elevation: 8,
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
              <TouchableOpacity
                onPress={handleValueToColor}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 15,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {t("calculate")}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}

        {mode === "colorToValue" && (
          <View style={{ marginHorizontal: 20 }}>
            {Array.from({ length: bandCount }, (_, bandIndex) => (
              <View key={bandIndex} style={{ marginVertical: 10 }}>
                <BlurView
                  intensity={glassmorphism.blurIntensityLight}
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    backgroundColor: glassmorphism.backgroundColorLight,
                    borderWidth: 1,
                    borderColor: glassmorphism.borderColor,
                    padding: 18,
                    shadowColor: glassmorphism.shadowColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: glassmorphism.shadowOpacity * 0.7,
                    shadowRadius: 8,
                    elevation: 4,
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
                </BlurView>
              </View>
            ))}
          </View>
        )}

        {/* Results */}
        {result && (
          <View
            style={{
              marginHorizontal: 20,
              marginVertical: 20,
            }}
          >
            <BlurView
              intensity={glassmorphism.blurIntensity}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 24,
                shadowColor: glassmorphism.shadowColor,
                shadowOffset: glassmorphism.shadowOffset,
                shadowOpacity: glassmorphism.shadowOpacity,
                shadowRadius: glassmorphism.shadowRadius,
                elevation: 8,
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
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {formatResistance(result.resistance)}
                </Text>
              </View>

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
            </BlurView>
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
