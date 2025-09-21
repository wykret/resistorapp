import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";

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
        // Auto-detect device language - default to English unless Portuguese
        const deviceLanguage =
          Platform.OS === "ios"
            ? NativeModules.SettingsManager?.settings?.AppleLocale || "en"
            : NativeModules.I18nManager?.localeIdentifier || "en";

        const langCode = deviceLanguage
          .split("_")[0]
          .split("-")[0]
          .toLowerCase();
        // Only use Portuguese if device language is Portuguese, otherwise default to English
        const supportedLanguage = langCode === "pt" ? "pt" : "en";
        setLanguage(supportedLanguage);
      }
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to English on error
      setLanguage("en");
    } finally {
      setIsLoading(false);
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
