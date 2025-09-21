import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
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
  const { colors } = useTheme();
  const colorData = RESISTOR_COLORS[color];
  const bandSize = size === "large" ? 60 : size === "small" ? 30 : 40;

  return (
    <TouchableOpacity
      onPress={() => onPress(color)}
      style={{
        width: bandSize,
        height: bandSize,
        backgroundColor: colorData.color,
        borderRadius: 8,
        borderWidth: isSelected ? 3 : 1,
        borderColor: isSelected ? colors.primary : colors.border,
        marginHorizontal: 4,
        marginVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    />
  );
};

const ResistorDisplay = ({ bands, bandCount }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#D2B48C",
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 30,
        marginVertical: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
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

  // Reset bands and result when band count changes
  useEffect(() => {
    resetCalculator();
  }, [bandCount]);

  // Reset bands and result when mode changes
  useEffect(() => {
    resetCalculator();
  }, [mode]);

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
            padding: 10,
            borderRadius: 12,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
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
            padding: 10,
            borderRadius: 12,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
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
          <BlurView
            intensity={20}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: glassmorphism.backgroundColor,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                router.push("/");
              }}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: glassmorphism.borderColor,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {t("home")}
              </Text>
            </TouchableOpacity>
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
        </View>
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
            borderRadius: 12,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            overflow: "hidden",
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
            borderRadius: 12,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            overflow: "hidden",
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
              intensity={20}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 20,
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
                  intensity={20}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: glassmorphism.backgroundColor,
                    borderWidth: 1,
                    borderColor: glassmorphism.borderColor,
                    padding: 15,
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
                    {bandIndex < bandCount - 2
                      ? `${t("digit")} ${bandIndex + 1}`
                      : bandIndex === bandCount - 2
                        ? t("multiplier")
                        : t("tolerance")}
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
              intensity={20}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: glassmorphism.backgroundColor,
                borderWidth: 1,
                borderColor: glassmorphism.borderColor,
                padding: 20,
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
            borderRadius: 12,
            padding: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
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
            {t("reset")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
