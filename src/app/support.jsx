import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {
  ArrowLeft,
  Copy,
  Heart,
  Coffee,
  Bitcoin,
  QrCode,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Clipboard from "expo-clipboard";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const PaymentOption = ({ title, address, icon: Icon, description }) => {
  const { colors, glassmorphism } = useTheme();
  const { t } = useLanguage();
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert(t("addressCopied"));
  };

  return (
    <>
      <BlurView
        intensity={20}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: glassmorphism.backgroundColor,
          borderWidth: 1,
          borderColor: glassmorphism.borderColor,
          marginVertical: 10,
        }}
      >
        <View style={{ padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 15,
              }}
            >
              <Icon size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 5,
                }}
              >
                {title}
              </Text>
              {description && (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {description}
                </Text>
              )}
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 15,
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 12,
                fontFamily: "monospace",
                lineHeight: 18,
              }}
            >
              {address}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Copy size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {t("copyAddress")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowQR(true)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                minWidth: 50,
              }}
            >
              <QrCode size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* QR Code Modal */}
      <Modal
        visible={showQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <BlurView
            intensity={20}
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: glassmorphism.backgroundColor,
              borderWidth: 1,
              borderColor: glassmorphism.borderColor,
              padding: 30,
              alignItems: "center",
              maxWidth: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "bold",
                  flex: 1,
                }}
              >
                {title}
              </Text>
              <TouchableOpacity
                onPress={() => setShowQR(false)}
                style={{
                  padding: 5,
                }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <QRCodeGenerator
              value={address}
              size={200}
              backgroundColor="#fff"
              foregroundColor="#000"
            />

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                textAlign: "center",
                marginTop: 15,
                fontFamily: "monospace",
              }}
            >
              {address}
            </Text>

            <TouchableOpacity
              onPress={() => {
                copyToClipboard();
                setShowQR(false);
              }}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 12,
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Copy size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {t("copyAddress")}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </>
  );
};

export default function Support() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, glassmorphism, isDark } = useTheme();
  const { t } = useLanguage();

  const paymentOptions = [
    {
      title: t("pixPayment"),
      address: "YOUR_PIX_KEY_HERE",
      icon: Heart,
      description: t("pixDescription"),
    },
    {
      title: t("btcLightning"),
      address:
        "lno1pgqppmsrse80qf0aara4slvcjxrvu6j2rp5ftmjy4yntlsmsutpkvkt6878sx6vp93lfhmtm9ajrgj2f3r3ln4gs342ld0f6sjsjmhkyt2qukntcqgp2n3jtqvgagevyqumxyrd5y95fdg8rm678fxd7cxe2y3nemrt27ngqxdu5cqxwrs7ewqfnthhwp4kgtndv2lu95n384lzhkv7ny47sqcw7s3gvmqq8cw9wrapehhvwpze7mhqqs3pq9ay5z4qu4kwh6h0c82xd9vnnjf2felussnja4r4gpe0ukngzygqxqqef74lme4m7w80h84jdmwrmtuqrxea5m43necnzvedamh0f0w4x8dwywg6srt3swchmew8xjc3whuervyxq",
      icon: Bitcoin,
      description: t("lightningDescription"),
    },
    {
      title: t("btcOnChain"),
      address:
        "bitcoin:?lno=lno1pgqppmsrse80qf0aara4slvcjxrvu6j2rp5ftmjy4yntlsmsutpkvkt6878sx6vp93lfhmtm9ajrgj2f3r3ln4gs342ld0f6sjsjmhkyt2qukntcqgp2n3jtqvgagevyqumxyrd5y95fdg8rm678fxd7cxe2y3nemrt27ngqxdu5cqxwrs7ewqfnthhwp4kgtndv2lu95n384lzhkv7ny47sqcw7s3gvmqq8cw9wrapehhvwpze7mhqqs3pq9ay5z4qu4kwh6h0c82xd9vnnjf2felussnja4r4gpe0ukngzygqxqqef74lme4m7w80h84jdmwrmtuqrxea5m43necnzvedamh0f0w4x8dwywg6srt3swchmew8xjc3whuervyxq",
      icon: Bitcoin,
      description: t("onChainDescription"),
    },
  ];

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
        }}
      >
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

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: colors.text,
            flex: 1,
          }}
        >
          {t("supportTitle")}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
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
              padding: 30,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Coffee size={40} color="#fff" />
            </View>

            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {t("supportTitle")}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 16,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {t("supportDescription")}
            </Text>
          </BlurView>
        </View>

        {/* Payment Options */}
        <View style={{ marginHorizontal: 20 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 15,
              marginLeft: 5,
            }}
          >
            {t("donationOptions")}
          </Text>

          {paymentOptions.map((option, index) => (
            <PaymentOption
              key={index}
              title={option.title}
              address={option.address}
              icon={option.icon}
              description={option.description}
            />
          ))}
        </View>

        {/* Thank You Message */}
        <View
          style={{
            marginHorizontal: 20,
            marginVertical: 30,
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
              padding: 25,
              alignItems: "center",
            }}
          >
            <Heart
              size={32}
              color={colors.accent}
              style={{ marginBottom: 15 }}
            />

            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              {t("thankYouTitle")}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {t("thankYouMessage")}
            </Text>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}