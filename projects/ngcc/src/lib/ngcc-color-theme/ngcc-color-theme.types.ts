import { WCAGLevel, NgccAccessibilityIssue, NgccColorScale } from './utils/wcag-color-utils';

// ─────────────────────────────────────────────────────────────────────────────
// WCAG Compliance Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccWCAGConfig {
  /** Target WCAG compliance level */
  level: WCAGLevel;
  /** Auto-adjust colors that don't meet contrast requirements */
  autoAdjust: boolean;
  /** Report accessibility issues to console */
  reportIssues: boolean;
  /** Minimum contrast ratio for UI elements (non-text) */
  uiContrastRatio: number;
}

export interface NgccThemeAccessibilityReport {
  /** Overall WCAG compliance status */
  compliant: boolean;
  /** Target level checked */
  level: WCAGLevel;
  /** List of accessibility issues found */
  issues: NgccAccessibilityIssue[];
  /** Token validation results */
  tokenValidation: Record<string, NgccTokenValidationResult>;
  /** Timestamp of validation */
  timestamp: Date;
}

export interface NgccTokenValidationResult {
  token: string;
  foreground: string;
  background: string;
  contrastRatio: number;
  passesAA: boolean;
  passesAAA: boolean;
  adjusted?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface NgccColorThemeConfig {
  /** Single brand color input */
  brandColor: string;
  /** Derived primary color (same as brandColor) */
  primary: string;
  /** Derived secondary color (complementary) */
  secondary: string;
  /** Derived danger color */
  danger: string;
  /** Derived success color */
  success: string;
  /** Derived warning color */
  warning: string;
  /** Derived info color */
  info: string;
  /** Generated color scale for primary */
  primaryScale?: NgccColorScale;
  /** Generated color scale for secondary */
  secondaryScale?: NgccColorScale;
}
