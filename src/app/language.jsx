import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Check, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageOption = ({ code, name, nativeName, isSelected, onSelect }) => {
  const { colors, glassmorphism } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onSelect(code)}
      style={{
        marginVertical: 8,
      }}
    >
      <BlurView
        intensity={20}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: glassmorphism.backgroundColor,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.primary : glassmorphism.borderColor,
        }}
      >
        <View style={{
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: isSelected ? 'bold' : '600',
              marginBottom: 4,
            }}>
              {name}
            </Text>
            <Text style={{
              color: colors.textSecondary,
              fontSize: 14,
            }}>
              {nativeName}
            </Text>
          </View>
          
          {isSelected && (
            <View style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Check size={18} color="#fff" />
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function Language() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, glassmorphism, isDark } = useTheme();
  const { t, language, changeLanguage } = useLanguage();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
    },
  ];

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    // Small delay to let the language change take effect
    setTimeout(() => {
      router.back();
    }, 100);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 10,
            borderRadius: 12,
            backgroundColor: glassmorphism.backgroundColor,
            borderWidth: 1,
            borderColor: glassmorphism.borderColor,
            marginRight: 15,
          }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
          flex: 1,
        }}>
          {t('selectLanguage')}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        {/* Header Section */}
        <View style={{
          marginHorizontal: 20,
          marginVertical: 20,
        }}>
          <BlurView
            intensity={20}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: glassmorphism.backgroundColor,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
              padding: 30,
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Globe size={40} color="#fff" />
            </View>
            
            <Text style={{
              color: colors.text,
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 10,
            }}>
              {t('selectLanguage')}
            </Text>
            
            <Text style={{
              color: colors.textSecondary,
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Choose your preferred language for the app interface
            </Text>
          </BlurView>
        </View>

        {/* Language Options */}
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 15,
            marginLeft: 5,
          }}>
            Available Languages
          </Text>
          
          {languages.map((lang) => (
            <LanguageOption
              key={lang.code}
              code={lang.code}
              name={lang.name}
              nativeName={lang.nativeName}
              isSelected={language === lang.code}
              onSelect={handleLanguageSelect}
            />
          ))}
        </View>


      </ScrollView>
    </View>
  );
}
