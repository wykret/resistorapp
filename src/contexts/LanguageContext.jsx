import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";
import * as Localization from 'expo-localization';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    home: "Home",
    support: "Support the App",
    language: "Language",

    // Main App
    resistor: "Resistor",
    resistorCalculator: "Resistor Calculator",
    colorToValue: "Color to Value",
    valueToColor: "Value to Color",
    bands: "Bands",
    fourBands: "4 Bands",
    fiveBands: "5 Bands",

    // Colors
    black: "Black",
    brown: "Brown",
    red: "Red",
    orange: "Orange",
    yellow: "Yellow",
    green: "Green",
    blue: "Blue",
    violet: "Violet",
    gray: "Gray",
    white: "White",
    gold: "Gold",
    silver: "Silver",
    none: "None",

    // Results
    resistance: "Resistance",
    tolerance: "Tolerance",
    tempCoefficient: "Temperature Coefficient",
    enterValue: "Enter resistance value",
    calculate: "Calculate",
    results: "Results",
    reset: "Reset",
    digit: "Digit",
    multiplier: "Multiplier",
    error: "Error",

    // Support
    supportTitle: "Support the App",
    supportDescription: "Help us keep this app free and updated",
    pixPayment: "PIX Payment",
    btcLightning: "Bitcoin Lightning",
    btcOnChain: "Bitcoin On-Chain",
    copyAddress: "Copy Address",
    addressCopied: "Address copied!",
    pixDescription: "Instant payment via PIX",
    lightningDescription: "Fast payment via Lightning Network",
    onChainDescription: "Traditional Bitcoin payment",
    donationOptions: "Donation Options",
    thankYouTitle: "Thank You!",
    thankYouMessage:
      "Your contribution helps keep this app free and always updated. Every donation, no matter how small, makes a difference!",

    // Language
    selectLanguage: "Select Language",
    english: "English",
    portuguese: "Português",

    // Units
    ohms: "Ω",
    kiloOhms: "kΩ",
    megaOhms: "MΩ",

    // Validation
    invalidValue: "Invalid resistance value",
    valueRequired: "Please enter a value",
  },
  pt: {
    // Navigation
    home: "Início",
    support: "Apoie o App",
    language: "Idioma",

    // Main App
    resistor: "Resistor",
    resistorCalculator: "Calculadora de Resistor",
    colorToValue: "Cor para Valor",
    valueToColor: "Valor para Cor",
    bands: "Faixas",
    fourBands: "4 Faixas",
    fiveBands: "5 Faixas",

    // Colors
    black: "Preto",
    brown: "Marrom",
    red: "Vermelho",
    orange: "Laranja",
    yellow: "Amarelo",
    green: "Verde",
    blue: "Azul",
    violet: "Violeta",
    gray: "Cinza",
    white: "Branco",
    gold: "Dourado",
    silver: "Prata",
    none: "Nenhum",

    // Results
    resistance: "Resistência",
    tolerance: "Tolerância",
    tempCoefficient: "Coeficiente de Temperatura",
    enterValue: "Digite o valor da resistência",
    calculate: "Calcular",
    results: "Resultados",
    reset: "Resetar",
    digit: "Dígito",
    multiplier: "Multiplicador",
    error: "Erro",

    // Support
    supportTitle: "Apoie o App",
    supportDescription: "Ajude-nos a manter este app gratuito e atualizado",
    pixPayment: "Pagamento PIX",
    btcLightning: "Bitcoin Lightning",
    btcOnChain: "Bitcoin On-Chain",
    copyAddress: "Copiar Endereço",
    addressCopied: "Endereço copiado!",
    pixDescription: "Pagamento instantâneo via PIX",
    lightningDescription: "Pagamento rápido via Rede Lightning",
    onChainDescription: "Pagamento tradicional via Bitcoin",
    donationOptions: "Opções de Doação",
    thankYouTitle: "Obrigado!",
    thankYouMessage:
      "Sua contribuição ajuda a manter este app gratuito e atualizado. Cada doação, independente do tamanho, faz toda diferença!",

    // Language
    selectLanguage: "Selecionar Idioma",
    english: "English",
    portuguese: "Português",

    // Units
    ohms: "Ω",
    kiloOhms: "kΩ",
    megaOhms: "MΩ",

    // Validation
    invalidValue: "Valor de resistência inválido",
    valueRequired: "Por favor, digite um valor",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        // Auto-detect device language using multiple methods
        const detectedLanguage = await detectDeviceLanguage();
        setLanguage(detectedLanguage);
      }
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to English on error
      setLanguage("en");
    } finally {
      setIsLoading(false);
    }
  };

  const detectDeviceLanguage = async () => {
    try {
      console.log("Detecting device language...");
      
      // Method 1: Use Expo Localization (most reliable)
      if (Localization.locale) {
        console.log("Expo Localization locale:", Localization.locale);
        const langCode = Localization.locale.split("_")[0].split("-")[0].toLowerCase();
        if (langCode === "pt") {
          console.log("Detected Portuguese via Expo Localization");
          return "pt";
        }
        if (langCode === "en") {
          console.log("Detected English via Expo Localization");
          return "en";
        }
      }

      // Method 2: Use device locales array (Expo Localization)
      if (Localization.locales && Localization.locales.length > 0) {
        console.log("Expo Localization locales:", Localization.locales);
        for (const locale of Localization.locales) {
          const langCode = locale.split("_")[0].split("-")[0].toLowerCase();
          if (langCode === "pt") {
            console.log("Detected Portuguese via locales array");
            return "pt";
          }
          if (langCode === "en") {
            console.log("Detected English via locales array");
            return "en";
          }
        }
      }

      // Method 3: Fallback to old React Native APIs (for older versions)
      let deviceLanguage = "en";
      
      if (Platform.OS === "ios") {
        // Try multiple iOS methods
        deviceLanguage = 
          NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
          "en";
        console.log("iOS device language:", deviceLanguage);
      } else if (Platform.OS === "android") {
        // Try multiple Android methods
        deviceLanguage = 
          NativeModules.I18nManager?.localeIdentifier ||
          NativeModules.LocaleManager?.localeIdentifier ||
          "en";
        console.log("Android device language:", deviceLanguage);
      }

      const langCode = deviceLanguage.split("_")[0].split("-")[0].toLowerCase();
      console.log("Extracted language code:", langCode);
      
      // Only use Portuguese if device language is Portuguese, otherwise default to English
      const result = langCode === "pt" ? "pt" : "en";
      console.log("Final detected language:", result);
      return result;
      
    } catch (error) {
      console.error("Error detecting device language:", error);
      return "en";
    }
  };

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem("language", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };


  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
