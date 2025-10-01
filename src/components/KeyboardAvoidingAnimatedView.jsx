
import React from 'react';
import { Platform, KeyboardAvoidingView, View } from 'react-native';

// Simplified keyboard avoiding view without animations for better performance
const KeyboardAvoidingAnimatedView = React.forwardRef((props, ref) => {
  const {
    children,
    behavior = Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset = 0,
    style,
    contentContainerStyle,
    enabled = true,
    onLayout,
    ...leftoverProps
  } = props;

  // For web platform, use the standard KeyboardAvoidingView
  if (Platform.OS === 'web') {
    return (
      <KeyboardAvoidingView
        behavior={behavior}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={enabled}
        {...leftoverProps}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  // For mobile platforms, use a simple View wrapper
  // This removes all animations and complex keyboard handling for better performance
  return (
    <View
      ref={ref}
      style={style}
      onLayout={onLayout}
      {...leftoverProps}
    >
      {children}
    </View>
  );
});

KeyboardAvoidingAnimatedView.displayName = 'KeyboardAvoidingAnimatedView';

export default KeyboardAvoidingAnimatedView;
