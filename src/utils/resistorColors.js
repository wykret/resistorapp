// Resistor color code data and calculations
export const RESISTOR_COLORS = {
  black: { value: 0, multiplier: 1, tolerance: null, tempCoeff: null, color: '#000000' },
  brown: { value: 1, multiplier: 10, tolerance: 1, tempCoeff: 100, color: '#8B4513' },
  red: { value: 2, multiplier: 100, tolerance: 2, tempCoeff: 50, color: '#FF0000' },
  orange: { value: 3, multiplier: 1000, tolerance: null, tempCoeff: 15, color: '#FFA500' },
  yellow: { value: 4, multiplier: 10000, tolerance: null, tempCoeff: 25, color: '#FFFF00' },
  green: { value: 5, multiplier: 100000, tolerance: 0.5, tempCoeff: 20, color: '#008000' },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25, tempCoeff: 10, color: '#0000FF' },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1, tempCoeff: 5, color: '#8A2BE2' },
  gray: { value: 8, multiplier: 100000000, tolerance: 0.05, tempCoeff: 1, color: '#808080' },
  white: { value: 9, multiplier: 1000000000, tolerance: null, tempCoeff: null, color: '#FFFFFF' },
  gold: { value: null, multiplier: 0.1, tolerance: 5, tempCoeff: null, color: '#FFD700' },
  silver: { value: null, multiplier: 0.01, tolerance: 10, tempCoeff: null, color: '#C0C0C0' },
  none: { value: null, multiplier: null, tolerance: 20, tempCoeff: null, color: 'transparent' }
};

export const COLOR_NAMES = Object.keys(RESISTOR_COLORS);

export const DIGIT_COLORS = COLOR_NAMES.filter(color => 
  RESISTOR_COLORS[color].value !== null
);

export const MULTIPLIER_COLORS = COLOR_NAMES.filter(color => 
  RESISTOR_COLORS[color].multiplier !== null
);

export const TOLERANCE_COLORS = COLOR_NAMES.filter(color => 
  RESISTOR_COLORS[color].tolerance !== null
);

export const TEMP_COEFF_COLORS = COLOR_NAMES.filter(color => 
  RESISTOR_COLORS[color].tempCoeff !== null
);

// Calculate resistance from color bands
export const calculateResistance = (bands) => {
  if (bands.length === 4) {
    const [digit1, digit2, multiplier, tolerance] = bands;
    
    if (!digit1 || !digit2 || !multiplier || !tolerance) {
      return null;
    }
    
    const value1 = RESISTOR_COLORS[digit1]?.value;
    const value2 = RESISTOR_COLORS[digit2]?.value;
    const mult = RESISTOR_COLORS[multiplier]?.multiplier;
    const tol = RESISTOR_COLORS[tolerance]?.tolerance;
    
    if (value1 === null || value2 === null || mult === null || tol === null) {
      return null;
    }
    
    const resistance = (value1 * 10 + value2) * mult;
    
    return {
      resistance,
      tolerance: tol,
      tempCoefficient: null
    };
  } else if (bands.length === 5) {
    const [digit1, digit2, digit3, multiplier, tolerance] = bands;
    
    if (!digit1 || !digit2 || !digit3 || !multiplier || !tolerance) {
      return null;
    }
    
    const value1 = RESISTOR_COLORS[digit1]?.value;
    const value2 = RESISTOR_COLORS[digit2]?.value;
    const value3 = RESISTOR_COLORS[digit3]?.value;
    const mult = RESISTOR_COLORS[multiplier]?.multiplier;
    const tol = RESISTOR_COLORS[tolerance]?.tolerance;
    
    if (value1 === null || value2 === null || value3 === null || mult === null || tol === null) {
      return null;
    }
    
    const resistance = (value1 * 100 + value2 * 10 + value3) * mult;
    
    return {
      resistance,
      tolerance: tol,
      tempCoefficient: null
    };
  }
  
  return null;
};

// Calculate color bands from resistance value
export const calculateColors = (resistanceValue, bandCount = 4) => {
  if (!resistanceValue || resistanceValue <= 0) {
    return null;
  }
  
  // Find the appropriate multiplier
  let multiplier = 1;
  let multiplierColor = 'black';
  let digits = resistanceValue;
  
  // Find the largest multiplier that gives us valid digits
  for (const [colorName, colorData] of Object.entries(RESISTOR_COLORS)) {
    if (colorData.multiplier && colorData.multiplier <= resistanceValue) {
      const testDigits = resistanceValue / colorData.multiplier;
      if (bandCount === 4 && testDigits >= 10 && testDigits < 100) {
        multiplier = colorData.multiplier;
        multiplierColor = colorName;
        digits = testDigits;
      } else if (bandCount === 5 && testDigits >= 100 && testDigits < 1000) {
        multiplier = colorData.multiplier;
        multiplierColor = colorName;
        digits = testDigits;
      }
    }
  }
  
  // Round digits to nearest integer
  digits = Math.round(digits);
  
  if (bandCount === 4) {
    if (digits < 10 || digits > 99) {
      return null;
    }
    
    const digit1 = Math.floor(digits / 10);
    const digit2 = digits % 10;
    
    const color1 = DIGIT_COLORS.find(color => RESISTOR_COLORS[color].value === digit1);
    const color2 = DIGIT_COLORS.find(color => RESISTOR_COLORS[color].value === digit2);
    
    if (!color1 || !color2) {
      return null;
    }
    
    return {
      bands: [color1, color2, multiplierColor, 'gold'], // Default to 5% tolerance
      resistance: resistanceValue,
      tolerance: 5
    };
  } else if (bandCount === 5) {
    if (digits < 100 || digits > 999) {
      return null;
    }
    
    const digit1 = Math.floor(digits / 100);
    const digit2 = Math.floor((digits % 100) / 10);
    const digit3 = digits % 10;
    
    const color1 = DIGIT_COLORS.find(color => RESISTOR_COLORS[color].value === digit1);
    const color2 = DIGIT_COLORS.find(color => RESISTOR_COLORS[color].value === digit2);
    const color3 = DIGIT_COLORS.find(color => RESISTOR_COLORS[color].value === digit3);
    
    if (!color1 || !color2 || !color3) {
      return null;
    }
    
    return {
      bands: [color1, color2, color3, multiplierColor, 'brown'], // Default to 1% tolerance
      resistance: resistanceValue,
      tolerance: 1
    };
  }
  
  return null;
};

// Format resistance value with appropriate units
export const formatResistance = (resistance) => {
  if (resistance >= 1000000) {
    return `${(resistance / 1000000).toFixed(2)} MΩ`;
  } else if (resistance >= 1000) {
    return `${(resistance / 1000).toFixed(2)} kΩ`;
  } else {
    return `${resistance.toFixed(2)} Ω`;
  }
};

// Parse resistance input string to numeric value
export const parseResistanceInput = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const cleanInput = input.trim().toLowerCase();
  let value = parseFloat(cleanInput);
  
  if (isNaN(value)) {
    return null;
  }
  
  if (cleanInput.includes('m') && cleanInput.includes('ω')) {
    value *= 1000000; // MΩ
  } else if (cleanInput.includes('k') && cleanInput.includes('ω')) {
    value *= 1000; // kΩ
  } else if (cleanInput.includes('meg')) {
    value *= 1000000; // Meg
  } else if (cleanInput.includes('k')) {
    value *= 1000; // k
  }
  
  return value > 0 ? value : null;
};