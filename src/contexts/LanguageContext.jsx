import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity } from "react-native";

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
    digitInstruction: "Select the color for the digit band.",
    multiplierInstruction: "Select the color for the multiplier band.",
    toleranceInstruction: "Select the color for the tolerance band.",

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
    approximate: "approximate",
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
    digitInstruction: "Selecione a cor para a faixa do dígito.",
    multiplierInstruction: "Selecione a cor para a faixa do multiplicador.",
    toleranceInstruction: "Selecione a cor para a faixa da tolerância.",

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
    approximate: "aproximada",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      const hasLaunchedBefore = await AsyncStorage.getItem("hasLaunchedBefore");

      if (savedLanguage) {
        setLanguage(savedLanguage);
      }

      // Show language selector only on first launch
      if (!hasLaunchedBefore) {
        setShowLanguageSelector(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to English on error
      setLanguage("en");
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

  const selectLanguage = async (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageSelector(false);
    try {
      await AsyncStorage.setItem("language", selectedLanguage);
      await AsyncStorage.setItem("hasLaunchedBefore", "true");
    } catch (error) {
      console.error("Error saving language selection:", error);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Language Selector Component
  const LanguageSelector = () => {
    if (!showLanguageSelector) return null;

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 30,
          margin: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          minWidth: 280,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
            color: '#333',
          }}>
            Welcome!
          </Text>
          <Text style={{
            fontSize: 16,
            marginBottom: 30,
            textAlign: 'center',
            color: '#666',
          }}>
            Please select your preferred language
          </Text>

          <TouchableOpacity
            onPress={() => selectLanguage('en')}
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: '600',
            }}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => selectLanguage('pt')}
            style={{
              backgroundColor: '#28a745',
              borderRadius: 12,
              padding: 15,
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Português
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, showLanguageSelector }}>
      <LanguageSelector />
      {children}
    </LanguageContext.Provider>
  );
};
