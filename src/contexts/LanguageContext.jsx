// Import React hooks and functions for creating context and managing state
import React, { createContext, useContext, useState, useEffect } from "react";
// Import AsyncStorage for persistent storage of language preference
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import React Native components for UI elements
import { View, Text, TouchableOpacity } from "react-native";

// Create a React context for sharing language state throughout the app
const LanguageContext = createContext();

// Custom hook to use the language context - throws error if used outside provider
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation object containing all text strings for English and Portuguese
const translations = {
  en: {
    // Navigation section translations
    home: "Home",
    support: "Support the App",
    language: "Language",

    // Main App section translations
    resistor: "Resistor",
    resistorCalculator: "Resistor Calculator",
    colorToValue: "Color to Value",
    valueToColor: "Value to Color",
    bands: "Bands",
    fourBands: "4 Bands",
    fiveBands: "5 Bands",

    // Colors section translations
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

    // Results section translations
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

    // Support section translations
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

    // Language section translations
    selectLanguage: "Select Language",
    english: "English",
    portuguese: "Português",

    // Units section translations
    ohms: "Ω",
    kiloOhms: "kΩ",
    megaOhms: "MΩ",

    // Validation section translations
    invalidValue: "Invalid resistance value",
    valueRequired: "Please enter a value",
    approximate: "approximate",
  },
  pt: {
    // Navigation section translations (Portuguese)
    home: "Início",
    support: "Apoie o App",
    language: "Idioma",

    // Main App section translations (Portuguese)
    resistor: "Resistor",
    resistorCalculator: "Calculadora de Resistor",
    colorToValue: "Cor para Valor",
    valueToColor: "Valor para Cor",
    bands: "Faixas",
    fourBands: "4 Faixas",
    fiveBands: "5 Faixas",

    // Colors section translations (Portuguese)
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

    // Results section translations (Portuguese)
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

    // Support section translations (Portuguese)
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

    // Language section translations (Portuguese)
    selectLanguage: "Selecionar Idioma",
    english: "English",
    portuguese: "Português",

    // Units section translations (Portuguese)
    ohms: "Ω",
    kiloOhms: "kΩ",
    megaOhms: "MΩ",

    // Validation section translations (Portuguese)
    invalidValue: "Valor de resistência inválido",
    valueRequired: "Por favor, digite um valor",
    approximate: "aproximada",
  },
};

// Main language provider component that manages language state and selection
export const LanguageProvider = ({ children }) => {
  // State to track current language (defaults to English)
  const [language, setLanguage] = useState("en");
  // State to track if language is still loading
  const [isLoading, setIsLoading] = useState(true);
  // State to control whether to show the language selector modal
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Effect to load language preference when component mounts
  useEffect(() => {
    loadLanguage();
  }, []);

  // Async function to load language preference (always shows selector)
  const loadLanguage = async () => {
    try {
      // No auto language detection - always ask user to select
      setShowLanguageSelector(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to English on error
      setLanguage("en");
      setIsLoading(false);
    }
  };

  // Function to change language and save to storage
  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem("language", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  // Function to handle language selection and hide selector
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

  // Translation function to get text in current language with fallbacks
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Language Selector Component - shows modal for language selection
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

  // Show nothing while language is loading to prevent flash
  if (isLoading) {
    return null;
  }

  // Provide language context to child components
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, showLanguageSelector }}>
      <LanguageSelector />
      {children}
    </LanguageContext.Provider>
  );
};
