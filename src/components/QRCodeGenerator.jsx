import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";

const QRCodeGenerator = ({
  value,
  size = 200,
  backgroundColor = "#ffffff",
  foregroundColor = "#000000",
}) => {
  // Encode the value for URL
  const encodedValue = encodeURIComponent(value || "");

  // Convert hex colors to URL-safe format (remove #)
  const bgColor = backgroundColor.replace("#", "");
  const fgColor = foregroundColor.replace("#", "");

  // Use qr-server.com API to generate QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}&bgcolor=${bgColor}&color=${fgColor}&format=png&margin=1`;

  return (
    <View
      style={{
        backgroundColor,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: qrCodeUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: 4,
        }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
};

export default QRCodeGenerator;
