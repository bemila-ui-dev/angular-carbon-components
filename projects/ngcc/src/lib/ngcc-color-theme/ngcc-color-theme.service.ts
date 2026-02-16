import { Injectable, signal, effect, computed } from '@angular/core';
import {
  NgccWCAGConfig,
  NgccThemeAccessibilityReport,
  NgccTokenValidationResult,
  NgccColorThemeConfig,
} from './ngcc-color-theme.types';
import {
  WCAGLevel,
  NgccAccessibilityIssue,
  checkContrast,
  adjustColorForContrast,
  getAccessibleTextColor,
  generateInteractiveStates,
  generateColorScale,
  getFocusIndicatorColor,
  validateColorToken,
  WCAG_CONTRAST,
  hexToHsl,
  hslToHex,
  derivePaletteFromBrand,
  NgccDerivedColorPalette,
} from './utils/wcag-color-utils';
import {
  CarbonThemeName,
  isThemeDark,
  getThemeBackground,
  getThemeSecondaryButtonBg,
} from './tokens/index';

/**
 * Color Theme Service with WCAG 2.1 Compliance
 *
 * Accepts a single brand color and auto-generates all derived colors.
 * Base theme tokens are applied by Carbon's SCSS via [data-carbon-theme].
 * Dynamic tokens (interactive, button, link, etc.) are applied as inline CSS overrides.
 */
@Injectable({ providedIn: 'root' })
export class NgccColorThemeService {
  // ─────────────────────────────────────────────────────────────────────────────
  // Signals (Reactive State)
  // ─────────────────────────────────────────────────────────────────────────────

  private static readonly FALLBACK_BRAND_COLOR = '#0f62fe';

  readonly baseTheme = signal<CarbonThemeName>('white');
  readonly brandColor = signal<string>(NgccColorThemeService.FALLBACK_BRAND_COLOR);
  private readonly defaultBrandColor = signal<string>(NgccColorThemeService.FALLBACK_BRAND_COLOR);

  /** WCAG configuration */
  readonly wcagConfig = signal<NgccWCAGConfig>({
    level: 'AA',
    autoAdjust: true,
    reportIssues: true,
    uiContrastRatio: 3.0,
  });

  /** Current accessibility report */
  readonly accessibilityReport = signal<NgccThemeAccessibilityReport | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed (Derived State)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Full palette derived from the single brand color */
  readonly derivedPalette = computed<NgccDerivedColorPalette>(() =>
    derivePaletteFromBrand(this.brandColor()),
  );

  /** Convenience accessors derived from palette */
  readonly primaryColor = computed(() => this.derivedPalette().primary);
  readonly secondaryColor = computed(() => this.derivedPalette().secondary);
  readonly dangerColor = computed(() => this.derivedPalette().danger);
  readonly successColor = computed(() => this.derivedPalette().success);
  readonly warningccolor = computed(() => this.derivedPalette().warning);
  readonly infoColor = computed(() => this.derivedPalette().info);

  readonly isDarkMode = computed(() => isThemeDark(this.baseTheme()));
  readonly backgroundColor = computed(() => getThemeBackground(this.baseTheme()));

  readonly primaryScale = computed(() => generateColorScale(this.primaryColor()));
  readonly secondaryScale = computed(() => generateColorScale(this.secondaryColor()));

  readonly availableThemes = signal<CarbonThemeName[]>(['white', 'g10', 'g90', 'g100']);

  /**
   * Chart color configuration for Carbon Charts integration
   */
  readonly chartColorConfig = computed(() => {
    const theme = this.baseTheme();
    const isDark = isThemeDark(theme);
    const palette = this.derivedPalette();

    return {
      theme,
      colorScale: this.generateChartColorScale(
        palette.primary,
        palette.secondary,
        palette.danger,
        palette.warning,
        palette.info,
        isDark,
      ),
    };
  });

  constructor() {
    effect(() => this.applyTheme());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Chart Color Scale Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateChartColorScale(
    primary: string,
    secondary: string,
    danger: string,
    warning: string,
    info: string,
    isDark: boolean,
  ): Record<string, string> {
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = hexToHsl(secondary);
    const infoHsl = hexToHsl(info);

    const generateShade = (hsl: { h: number; s: number; l: number }, delta: number): string => {
      return hslToHex({
        h: hsl.h,
        s: hsl.s,
        l: Math.max(0.15, Math.min(0.85, hsl.l + delta)),
      });
    };

    return {
      '1-1-1': primary,
      '1-1-2': generateShade(primaryHsl, isDark ? 0.12 : -0.12),
      '1-1-3': generateShade(primaryHsl, isDark ? 0.24 : -0.24),
      '1-1-4': generateShade(primaryHsl, isDark ? -0.12 : 0.12),
      '2-1-1': secondary,
      '2-1-2': generateShade(secondaryHsl, isDark ? 0.12 : -0.12),
      '2-1-3': generateShade(secondaryHsl, isDark ? 0.24 : -0.24),
      '2-1-4': generateShade(secondaryHsl, isDark ? -0.12 : 0.12),
      '3-1-1': info,
      '3-1-2': generateShade(infoHsl, isDark ? 0.15 : -0.15),
      danger,
      warning,
      Primary: primary,
      Secondary: secondary,
      Tertiary: info,
      Quaternary: generateShade(primaryHsl, isDark ? 0.2 : -0.2),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  setBaseTheme(theme: CarbonThemeName): void {
    this.baseTheme.set(theme);
  }

  /** Set the brand color. All other colors are derived automatically. */
  updateBrandColor(color: string): void {
    this.brandColor.set(color);
  }

  /** Set the default brand color used on initialization and reset. */
  setDefaultBrandColor(color: string): void {
    this.defaultBrandColor.set(color);
    this.brandColor.set(color);
  }

  /** @deprecated Use updateBrandColor() instead. */
  updatePrimary(color: string): void {
    this.updateBrandColor(color);
  }

  setWcagLevel(level: WCAGLevel): void {
    this.wcagConfig.update((config) => ({ ...config, level }));
  }

  setAutoAdjust(enabled: boolean): void {
    this.wcagConfig.update((config) => ({ ...config, autoAdjust: enabled }));
  }

  getThemeConfig(): NgccColorThemeConfig {
    const palette = this.derivedPalette();
    return {
      brandColor: this.brandColor(),
      primary: palette.primary,
      secondary: palette.secondary,
      danger: palette.danger,
      success: palette.success,
      warning: palette.warning,
      info: palette.info,
      primaryScale: this.primaryScale(),
      secondaryScale: this.secondaryScale(),
    };
  }

  validateColor(color: string, isLargeText: boolean = false): NgccTokenValidationResult {
    const bg = this.backgroundColor();
    const contrast = checkContrast(color, bg);

    return {
      token: 'custom',
      foreground: color,
      background: bg,
      contrastRatio: contrast.ratio,
      passesAA: isLargeText ? contrast.passesAALarge : contrast.passesAA,
      passesAAA: isLargeText ? contrast.passesAAALarge : contrast.passesAAA,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Theme Application
  // ─────────────────────────────────────────────────────────────────────────────

  private styleElement: HTMLStyleElement | null = null;

  private applyTheme(): void {
    const palette = this.derivedPalette();
    const config = this.wcagConfig();
    const theme = this.baseTheme();

    // 1. Set the data attribute for base Carbon patterns (layout, spacing, type)
    document.documentElement.setAttribute('data-carbon-theme', theme);

    // 2. Generate dynamic color tokens
    const dynamicTokens = this.generateWcagCompliantTokens(palette, config);

    // 3. Inject into <style> tag instead of inline styles
    this.updateThemeStyleTag(dynamicTokens);

    // 4. Generate report
    const report = this.generateAccessibilityReport(dynamicTokens, config);
    this.accessibilityReport.set(report);

    if (config.reportIssues && report.issues.length > 0) {
      console.warn('[NgccColorThemeService] Accessibility issues detected:', report.issues);
    }
  }

  private updateThemeStyleTag(tokens: Record<string, string>): void {
    if (!this.styleElement) {
      this.styleElement = document.getElementById('ngcc-dynamic-theme') as HTMLStyleElement;
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'ngcc-dynamic-theme';
        document.head.appendChild(this.styleElement);
      }
    }

    const cssRules = Object.entries(tokens)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n      ');

    this.styleElement.textContent = `
      :root {
        ${cssRules}
      }
    `;
  }

  resetOverrides(): void {
    this.brandColor.set(this.defaultBrandColor());
    // Clear the specific style tag content, but keep base theme
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WCAG-Compliant Token Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateWcagCompliantTokens(
    palette: NgccDerivedColorPalette,
    config: NgccWCAGConfig,
  ): Record<string, string> {
    const bg = this.backgroundColor();
    const isDark = this.isDarkMode();
    const targetRatio = config.level === 'AAA' ? WCAG_CONTRAST.AAA_NORMAL : WCAG_CONTRAST.AA_NORMAL;

    const adjustedPrimary = config.autoAdjust
      ? adjustColorForContrast(palette.primary, bg, targetRatio)
      : palette.primary;

    const adjustedSecondary = config.autoAdjust
      ? adjustColorForContrast(palette.secondary, bg, targetRatio)
      : palette.secondary;

    const adjustedDanger = config.autoAdjust
      ? adjustColorForContrast(palette.danger, bg, targetRatio)
      : palette.danger;

    const adjustedSuccess = config.autoAdjust
      ? adjustColorForContrast(palette.success, bg, targetRatio)
      : palette.success;

    const adjustedWarning = config.autoAdjust
      ? adjustColorForContrast(palette.warning, bg, WCAG_CONTRAST.AA_LARGE)
      : palette.warning;

    const adjustedInfo = config.autoAdjust
      ? adjustColorForContrast(palette.info, bg, targetRatio)
      : palette.info;

    const primaryStates = generateInteractiveStates(adjustedPrimary, bg);
    const secondaryStates = generateInteractiveStates(adjustedSecondary, bg);
    const dangerStates = generateInteractiveStates(adjustedDanger, bg);

    const textOnPrimary = getAccessibleTextColor(primaryStates.base, undefined, config.level);
    const textOnDanger = getAccessibleTextColor(dangerStates.base, undefined, config.level);

    const secondaryButtonBg = getThemeSecondaryButtonBg(this.baseTheme());
    const textOnSecondary = getAccessibleTextColor(secondaryButtonBg, undefined, config.level);

    const focusColor = getFocusIndicatorColor(bg, adjustedPrimary);

    const linkColor = config.autoAdjust
      ? adjustColorForContrast(adjustedPrimary, bg, targetRatio)
      : adjustedPrimary;

    const linkHoverHsl = hexToHsl(linkColor);
    const linkHover = hslToHex({
      ...linkHoverHsl,
      l: isDark ? Math.min(1, linkHoverHsl.l + 0.15) : Math.max(0, linkHoverHsl.l - 0.15),
    });

    return {
      '--cds-interactive': primaryStates.base,
      '--cds-border-interactive': primaryStates.base,
      '--cds-interactive-01': primaryStates.base,
      '--cds-interactive-02': primaryStates.hover,
      '--cds-interactive-03': primaryStates.active,
      '--cds-interactive-04': adjustedPrimary,

      '--cds-support-error': adjustedDanger,
      '--cds-support-success': adjustedSuccess,
      '--cds-support-warning': adjustedWarning,
      '--cds-support-info': adjustedInfo,
      '--cds-support-01': adjustedDanger,
      '--cds-support-02': adjustedSuccess,
      '--cds-support-03': adjustedWarning,
      '--cds-support-04': adjustedInfo,

      '--cds-button-primary': primaryStates.base,
      '--cds-button-primary-hover': primaryStates.hover,
      '--cds-button-primary-active': primaryStates.active,
      '--cds-button-tertiary': primaryStates.base,
      '--cds-button-tertiary-hover': primaryStates.hover,
      '--cds-button-tertiary-active': primaryStates.active,
      '--cds-button-danger-primary': dangerStates.base,
      '--cds-button-danger-secondary': isDark ? '#ff8389' : adjustedDanger,
      '--cds-button-danger-hover': dangerStates.hover,
      '--cds-button-danger-active': dangerStates.active,
      '--cds-button-primary-text': textOnPrimary,
      '--cds-button-secondary-text': textOnSecondary,
      '--cds-button-tertiary-text': primaryStates.base,
      '--cds-button-danger-text': textOnDanger,
      '--cds-button-disabled-text': '#8d8d8d',

      '--cds-button-danger': dangerStates.base,

      '--cds-link-primary': linkColor,
      '--cds-link-primary-hover': linkHover,
      '--cds-link-secondary': secondaryStates.base,
      '--cds-link-visited': this.getVisitedLinkColor(linkColor, isDark),
      '--cds-link-01': linkColor,

      '--cds-focus': focusColor,

      '--cds-icon-interactive': primaryStates.base,
      '--cds-icon-on-color': textOnPrimary,

      '--cds-text-on-color': textOnPrimary,
      '--cds-text-error': adjustedDanger,

      '--cds-highlight': this.getHighlightColor(adjustedPrimary, isDark),

      ...this.chartPalette(adjustedPrimary, adjustedSecondary, isDark),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Accessibility Report Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateAccessibilityReport(
    tokens: Record<string, string>,
    config: NgccWCAGConfig,
  ): NgccThemeAccessibilityReport {
    const bg = this.backgroundColor();
    const issues: NgccAccessibilityIssue[] = [];
    const tokenValidation: Record<string, NgccTokenValidationResult> = {};

    const bgContrastTokens = [
      '--cds-link-01',
      '--cds-link-primary',
      '--cds-interactive-01',
      '--cds-support-error',
      '--cds-support-success',
    ];

    bgContrastTokens.forEach((name) => {
      const value = tokens[name];
      if (!value) return;

      const issue = validateColorToken(name, value, bg, config.level);
      if (issue) {
        issues.push(issue);
      }

      const contrast = checkContrast(value, bg);
      tokenValidation[name] = {
        token: name,
        foreground: value,
        background: bg,
        contrastRatio: contrast.ratio,
        passesAA: contrast.passesAA,
        passesAAA: contrast.passesAAA,
      };
    });

    const secondaryBtnBg = getThemeSecondaryButtonBg(this.baseTheme());

    const buttonTextPairs = [
      { fg: '--cds-button-primary-text', bg: '--cds-button-primary' },
      { fg: '--cds-button-secondary-text', bgValue: secondaryBtnBg },
      { fg: '--cds-button-danger-text', bg: '--cds-button-danger-primary' },
    ];

    buttonTextPairs.forEach(({ fg, bg: bgToken, bgValue: staticBg }) => {
      const fgValue = tokens[fg];
      const bgValue = staticBg || (bgToken ? tokens[bgToken] : undefined);
      if (!fgValue || !bgValue) return;

      const issue = validateColorToken(fg, fgValue, bgValue, config.level);
      if (issue) {
        issues.push(issue);
      }

      const contrast = checkContrast(fgValue, bgValue);
      tokenValidation[fg] = {
        token: fg,
        foreground: fgValue,
        background: bgValue,
        contrastRatio: contrast.ratio,
        passesAA: contrast.passesAA,
        passesAAA: contrast.passesAAA,
      };
    });

    return {
      compliant: issues.filter((i) => i.severity === 'error').length === 0,
      level: config.level,
      issues,
      tokenValidation,
      timestamp: new Date(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private getVisitedLinkColor(linkColor: string, isDark: boolean): string {
    const hsl = hexToHsl(linkColor);
    const visitedHue = (hsl.h + 270) % 360;
    return hslToHex({
      h: visitedHue,
      s: hsl.s * 0.8,
      l: isDark ? Math.min(0.7, hsl.l + 0.1) : hsl.l,
    });
  }

  private getHighlightColor(primary: string, isDark: boolean): string {
    const hsl = hexToHsl(primary);
    return hslToHex({
      h: hsl.h,
      s: isDark ? 0.4 : 0.8,
      l: isDark ? 0.25 : 0.9,
    });
  }

  private chartPalette(
    primary: string,
    secondary: string,
    isDark: boolean,
  ): Record<string, string> {
    const primaryHsl = hexToHsl(primary);
    const secondaryHsl = hexToHsl(secondary);

    const generateShade = (hsl: typeof primaryHsl, lightnessDelta: number): string => {
      return hslToHex({
        h: hsl.h,
        s: hsl.s,
        l: Math.max(0.1, Math.min(0.9, hsl.l + lightnessDelta)),
      });
    };

    const palette = [
      primary,
      generateShade(primaryHsl, isDark ? 0.15 : -0.15),
      generateShade(primaryHsl, isDark ? 0.3 : -0.3),
      secondary,
      generateShade(secondaryHsl, isDark ? 0.15 : -0.15),
      generateShade(secondaryHsl, isDark ? 0.3 : -0.3),
      '#da1e28',
      '#ff832b',
      '#f1c21b',
      '#9f1853',
      '#6929c4',
      '#005d5d',
    ];

    const colors: Record<string, string> = {};
    palette.forEach((c, i) => {
      colors[`--cds-chart-color-${i + 1}`] = c;
    });

    return colors;
  }
}
