/*
 * Resistor App - Responsive Utilities
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

import { Dimensions, Platform, useState, useEffect } from 'react-native';

// Breakpoint definitions
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1440,
  xxl: 1920,
};

// Screen size categories
export const SCREEN_SIZES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'large_desktop',
};

// Get current screen size category
export const getScreenSize = () => {
  if (Platform.OS !== 'web') {
    return SCREEN_SIZES.DESKTOP; // Native platforms treated as desktop for styling
  }

  const width = Dimensions.get('window').width || window.innerWidth;

  if (width < BREAKPOINTS.md) {
    return SCREEN_SIZES.MOBILE;
  } else if (width < BREAKPOINTS.lg) {
    return SCREEN_SIZES.TABLET;
  } else if (width < BREAKPOINTS.xl) {
    return SCREEN_SIZES.DESKTOP;
  } else {
    return SCREEN_SIZES.LARGE_DESKTOP;
  }
};

// Check if screen size is at least a certain breakpoint
export const isAtLeast = (breakpoint) => {
  if (Platform.OS !== 'web') {
    return breakpoint <= BREAKPOINTS.md; // Native platforms treated as desktop
  }

  const width = Dimensions.get('window').width || window.innerWidth;
  return width >= BREAKPOINTS[breakpoint];
};

// Check if screen size is mobile
export const isMobile = () => {
  return getScreenSize() === SCREEN_SIZES.MOBILE;
};

// Check if screen size is tablet
export const isTablet = () => {
  return getScreenSize() === SCREEN_SIZES.TABLET;
};

// Check if screen size is desktop or larger
export const isDesktop = () => {
  return getScreenSize() === SCREEN_SIZES.DESKTOP || getScreenSize() === SCREEN_SIZES.LARGE_DESKTOP;
};

// Responsive value helper - returns different values based on screen size
export const responsiveValue = (values) => {
  const screenSize = getScreenSize();

  if (values[screenSize] !== undefined) {
    return values[screenSize];
  }

  // Fallback logic
  if (screenSize === SCREEN_SIZES.LARGE_DESKTOP && values.desktop !== undefined) {
    return values.desktop;
  }

  if (screenSize === SCREEN_SIZES.DESKTOP && values.tablet !== undefined) {
    return values.tablet;
  }

  if (screenSize === SCREEN_SIZES.TABLET && values.mobile !== undefined) {
    return values.mobile;
  }

  // Default fallback
  return values.mobile || values.default;
};

// Responsive spacing helper
export const responsiveSpacing = (mobile, tablet = mobile * 1.5, desktop = tablet * 1.5, largeDesktop = desktop * 1.2) => {
  return responsiveValue({
    mobile,
    tablet,
    desktop,
    large_desktop: largeDesktop,
  });
};

// Responsive font size helper
export const responsiveFontSize = (mobile, tablet = mobile * 1.2, desktop = tablet * 1.1, largeDesktop = desktop * 1.05) => {
  return responsiveValue({
    mobile,
    tablet,
    desktop,
    large_desktop: largeDesktop,
  });
};

// Responsive padding/margin helper
export const responsivePadding = (mobile, tablet, desktop, largeDesktop) => {
  const multiplier = Platform.OS === 'web' ? 1 : 0.8; // Slightly smaller on native
  return responsiveSpacing(
    mobile * multiplier,
    tablet * multiplier,
    desktop * multiplier,
    largeDesktop * multiplier
  );
};

// Hook for responsive values that update on dimension changes
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return Dimensions.get('window');
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setDimensions(window);
      });

      return () => subscription?.remove();
    } else if (typeof window !== 'undefined') {
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    ...dimensions,
    screenSize: getScreenSize(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isAtLeast,
    responsiveValue,
    responsiveSpacing,
    responsiveFontSize,
    responsivePadding,
  };
};

export default {
  BREAKPOINTS,
  SCREEN_SIZES,
  getScreenSize,
  isAtLeast,
  isMobile,
  isTablet,
  isDesktop,
  responsiveValue,
  responsiveSpacing,
  responsiveFontSize,
  responsivePadding,
  useResponsive,
};
