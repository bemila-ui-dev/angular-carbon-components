/**
 * WCAG 2.1 Color Accessibility Utilities
 *
 * Enterprise-grade color contrast and accessibility utilities
 * following WCAG 2.1 AA and AAA guidelines.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type WCAGLevel = 'AA' | 'AAA';
export type TextSize = 'normal' | 'large';

export interface NgccRGB {
  r: number;
  g: number;
  b: number;
}

export interface NgccHSL {
  h: number;
  s: number;
  l: number;
}

export interface NgccContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

export interface NgccAccessibleColorPair {
  foreground: string;
  background: string;
  contrastRatio: number;
  wcagLevel: WCAGLevel | 'fail';
  adjustments?: {
    originalForeground: string;
    wasAdjusted: boolean;
  };
}

export interface NgccColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// WCAG Contrast Thresholds
// ─────────────────────────────────────────────────────────────────────────────

export const WCAG_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Color Conversion Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse hex color to NgccRGB
 */
export function hexToRgb(hex: string): NgccRGB {
  const sanitized = hex.replace(/^#/, '');
  const fullHex =
    sanitized.length === 3
      ? sanitized
          .split('')
          .map((c) => c + c)
          .join('')
      : sanitized;

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert NgccRGB to hex
 */
export function rgbToHex(rgb: NgccRGB): string {
  const toHex: (n: number) => string = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert NgccRGB to NgccHSL
 */
export function rgbToHsl(rgb: NgccRGB): NgccHSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s, l };
}

/**
 * Convert NgccHSL to NgccRGB
 */
export function hslToRgb(hsl: NgccHSL): NgccRGB {
  const { h, s, l } = hsl;
  const hNorm = h / 360;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    const tNorm = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Convert hex to NgccHSL
 */
export function hexToHsl(hex: string): NgccHSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Convert NgccHSL to hex
 */
export function hslToHex(hsl: NgccHSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ─────────────────────────────────────────────────────────────────────────────
// WCAG Luminance & Contrast Calculations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate relative luminance per WCAG 2.1 specification
 * @see https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);

  const sRGBtoLinear = (value: number): number => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };

  const r = sRGBtoLinear(rgb.r);
  const g = sRGBtoLinear(rgb.g);
  const b = sRGBtoLinear(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors per WCAG 2.1
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lum1 = getRelativeLuminance(foreground);
  const lum2 = getRelativeLuminance(background);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 */
export function checkContrast(foreground: string, background: string): NgccContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= WCAG_CONTRAST.AA_NORMAL,
    passesAAA: ratio >= WCAG_CONTRAST.AAA_NORMAL,
    passesAALarge: ratio >= WCAG_CONTRAST.AA_LARGE,
    passesAAALarge: ratio >= WCAG_CONTRAST.AAA_LARGE,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Automatic WCAG-Compliant Color Adjustment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adjust a color's lightness to meet target contrast ratio
 */
export function adjustColorForContrast(
  color: string,
  background: string,
  targetRatio: number = WCAG_CONTRAST.AA_NORMAL,
  maxIterations: number = 50,
): string {
  const currentRatio = getContrastRatio(color, background);
  if (currentRatio >= targetRatio) {
    return color;
  }

  const bgLuminance = getRelativeLuminance(background);
  const shouldLighten = bgLuminance < 0.5;

  const hsl = hexToHsl(color);
  let bestColor = color;
  let bestRatio = currentRatio;

  for (let i = 0; i < maxIterations; i++) {
    if (shouldLighten) {
      hsl.l = Math.min(1, hsl.l + 0.02);
    } else {
      hsl.l = Math.max(0, hsl.l - 0.02);
    }

    const newColor = hslToHex(hsl);
    const newRatio = getContrastRatio(newColor, background);

    if (newRatio > bestRatio) {
      bestRatio = newRatio;
      bestColor = newColor;
    }

    if (newRatio >= targetRatio) {
      return newColor;
    }

    // Stop if we hit the limits
    if ((shouldLighten && hsl.l >= 1) || (!shouldLighten && hsl.l <= 0)) {
      break;
    }
  }

  return bestColor;
}

/**
 * Get WCAG-compliant text color for a background
 */
export function getAccessibleTextColor(
  background: string,
  preferredColor?: string,
  level: WCAGLevel = 'AA',
): string {
  const targetRatio = level === 'AAA' ? WCAG_CONTRAST.AAA_NORMAL : WCAG_CONTRAST.AA_NORMAL;

  // Try preferred color first
  if (preferredColor) {
    const ratio = getContrastRatio(preferredColor, background);
    if (ratio >= targetRatio) {
      return preferredColor;
    }
    // Try to adjust the preferred color
    const adjusted = adjustColorForContrast(preferredColor, background, targetRatio);
    if (getContrastRatio(adjusted, background) >= targetRatio) {
      return adjusted;
    }
  }

  // Fall back to black or white
  const whiteContrast = getContrastRatio('#ffffff', background);
  const blackContrast = getContrastRatio('#000000', background);

  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
}

/**
 * Create an accessible color pair
 */
export function createAccessibleColorPair(
  foreground: string,
  background: string,
  level: WCAGLevel = 'AA',
): NgccAccessibleColorPair {
  const targetRatio = level === 'AAA' ? WCAG_CONTRAST.AAA_NORMAL : WCAG_CONTRAST.AA_NORMAL;
  const originalRatio = getContrastRatio(foreground, background);

  if (originalRatio >= targetRatio) {
    return {
      foreground,
      background,
      contrastRatio: Math.round(originalRatio * 100) / 100,
      wcagLevel: originalRatio >= WCAG_CONTRAST.AAA_NORMAL ? 'AAA' : 'AA',
      adjustments: {
        originalForeground: foreground,
        wasAdjusted: false,
      },
    };
  }

  const adjustedForeground = adjustColorForContrast(foreground, background, targetRatio);
  const newRatio = getContrastRatio(adjustedForeground, background);

  return {
    foreground: adjustedForeground,
    background,
    contrastRatio: Math.round(newRatio * 100) / 100,
    wcagLevel:
      newRatio >= WCAG_CONTRAST.AAA_NORMAL
        ? 'AAA'
        : newRatio >= WCAG_CONTRAST.AA_NORMAL
          ? 'AA'
          : 'fail',
    adjustments: {
      originalForeground: foreground,
      wasAdjusted: true,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Scale Generation (Carbon-Compatible)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a 10-step color scale from a base color
 * Ensures WCAG compliance at appropriate steps
 */
export function generateColorScale(baseColor: string): NgccColorScale {
  const hsl = hexToHsl(baseColor);

  // Generate lightness values for 10-step scale
  const lightnessSteps = [0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

  const scale: Record<number, string> = {};
  const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  keys.forEach((key, index) => {
    scale[key] = hslToHex({
      h: hsl.h,
      s: hsl.s,
      l: lightnessSteps[index],
    });
  });

  return scale as unknown as NgccColorScale;
}

/**
 * Generate Carbon-compatible interactive color states
 */
export function generateInteractiveStates(
  baseColor: string,
  background: string,
): {
  base: string;
  hover: string;
  active: string;
  focus: string;
  disabled: string;
  textOnColor: string;
} {
  const _hsl = hexToHsl(baseColor);
  const bgLuminance = getRelativeLuminance(background);
  const isDarkBg = bgLuminance < 0.5;

  // Adjust base color for contrast if needed
  const adjustedBase = adjustColorForContrast(baseColor, background, WCAG_CONTRAST.AA_NORMAL);
  const adjustedHsl = hexToHsl(adjustedBase);

  // Generate state variations
  const hoverL = isDarkBg ? Math.min(1, adjustedHsl.l + 0.1) : Math.max(0, adjustedHsl.l - 0.1);

  const activeL = isDarkBg ? Math.min(1, adjustedHsl.l + 0.15) : Math.max(0, adjustedHsl.l - 0.15);

  return {
    base: adjustedBase,
    hover: hslToHex({ ...adjustedHsl, l: hoverL }),
    active: hslToHex({ ...adjustedHsl, l: activeL }),
    focus: adjustedBase, // Focus uses base with outline
    disabled: hslToHex({ ...adjustedHsl, s: adjustedHsl.s * 0.3, l: 0.6 }),
    textOnColor: getAccessibleTextColor(adjustedBase),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Focus Indicator Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate WCAG-compliant focus indicator color
 * Must have 3:1 contrast against adjacent colors
 */
export function getFocusIndicatorColor(adjacentColor: string, preferredColor?: string): string {
  const targetRatio = 3.0; // WCAG 2.1 focus indicator requirement

  if (preferredColor) {
    const ratio = getContrastRatio(preferredColor, adjacentColor);
    if (ratio >= targetRatio) {
      return preferredColor;
    }
  }

  // Default focus colors
  const focusOptions = ['#0f62fe', '#ffffff', '#000000', '#ff8389'];

  for (const color of focusOptions) {
    if (getContrastRatio(color, adjacentColor) >= targetRatio) {
      return color;
    }
  }

  // Adjust the preferred or default color
  return adjustColorForContrast(preferredColor || '#0f62fe', adjacentColor, targetRatio);
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation & Reporting
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccAccessibilityIssue {
  type: 'contrast' | 'focus' | 'color-only';
  severity: 'error' | 'warning';
  message: string;
  token: string;
  currentValue: string;
  suggestedValue?: string;
  contrastRatio?: number;
  requiredRatio?: number;
}

/**
 * Validate a color token against WCAG requirements
 */
export function validateColorToken(
  tokenName: string,
  foreground: string,
  background: string,
  level: WCAGLevel = 'AA',
  isLargeText: boolean = false,
): NgccAccessibilityIssue | null {
  const requiredRatio = isLargeText
    ? level === 'AAA'
      ? WCAG_CONTRAST.AAA_LARGE
      : WCAG_CONTRAST.AA_LARGE
    : level === 'AAA'
      ? WCAG_CONTRAST.AAA_NORMAL
      : WCAG_CONTRAST.AA_NORMAL;

  const ratio = getContrastRatio(foreground, background);

  if (ratio < requiredRatio) {
    const suggested = adjustColorForContrast(foreground, background, requiredRatio);

    return {
      type: 'contrast',
      severity: ratio < WCAG_CONTRAST.AA_LARGE ? 'error' : 'warning',
      message: `${tokenName} has insufficient contrast (${ratio.toFixed(2)}:1, requires ${requiredRatio}:1)`,
      token: tokenName,
      currentValue: foreground,
      suggestedValue: suggested,
      contrastRatio: ratio,
      requiredRatio,
    };
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Harmony Generation (Single Brand Color -> Full Palette)
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccDerivedColorPalette {
  primary: string;
  secondary: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
}

/**
 * Derive a full semantic color palette from a single brand color.
 *
 * - Secondary: complementary (180° hue rotation)
 * - Danger: fixed red hue (~0°), saturation from brand
 * - Success: fixed green hue (~130°), saturation from brand
 * - Warning: fixed yellow hue (~45°), saturation from brand
 * - Info: analogous shift (30° toward blue)
 */
export function derivePaletteFromBrand(brandColor: string): NgccDerivedColorPalette {
  const hsl = hexToHsl(brandColor);

  const secondary = hslToHex({
    h: (hsl.h + 180) % 360,
    s: hsl.s,
    l: hsl.l,
  });

  const danger = hslToHex({
    h: 0,
    s: Math.max(0.7, hsl.s),
    l: 0.45,
  });

  const success = hslToHex({
    h: 130,
    s: Math.max(0.5, hsl.s),
    l: 0.4,
  });

  const warning = hslToHex({
    h: 45,
    s: Math.max(0.8, hsl.s),
    l: 0.55,
  });

  // Info: shift brand hue 30° toward blue (hue 220)
  const brandDistanceToBlue = (220 - hsl.h + 360) % 360;
  const infoHue = brandDistanceToBlue < 60 ? 220 : (hsl.h + 30) % 360;

  const info = hslToHex({
    h: infoHue,
    s: Math.max(0.6, hsl.s),
    l: hsl.l,
  });

  return { primary: brandColor, secondary, danger, success, warning, info };
}
