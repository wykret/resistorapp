
/*
 * Resistor App - Mobile
 * Copyright (C) 2025 wykret
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
