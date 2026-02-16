/**
 * Carbon Theme Metadata
 *
 * Minimal metadata for each Carbon theme. All actual base token values
 * are applied by Carbon's SCSS via the [data-carbon-theme] attribute selector
 * in custom-themes.scss. This metadata provides only what the service
 * needs for WCAG contrast calculations.
 */

export type CarbonThemeName = 'white' | 'g10' | 'g90' | 'g100';

export interface NgccThemeMetadata {
  name: CarbonThemeName;
  isDark: boolean;
  background: string;
  /** Secondary button background color (needed for text-on-button WCAG check) */
  secondaryButtonBg: string;
}

export const themeMetadata: Record<CarbonThemeName, NgccThemeMetadata> = {
  white: { name: 'white', isDark: false, background: '#ffffff', secondaryButtonBg: '#393939' },
  g10: { name: 'g10', isDark: false, background: '#f4f4f4', secondaryButtonBg: '#393939' },
  g90: { name: 'g90', isDark: true, background: '#262626', secondaryButtonBg: '#6f6f6f' },
  g100: { name: 'g100', isDark: true, background: '#161616', secondaryButtonBg: '#6f6f6f' },
};

export function isThemeDark(theme: CarbonThemeName): boolean {
  return themeMetadata[theme].isDark;
}

export function getThemeBackground(theme: CarbonThemeName): string {
  return themeMetadata[theme].background;
}

export function getThemeSecondaryButtonBg(theme: CarbonThemeName): string {
  return themeMetadata[theme].secondaryButtonBg;
}

export function getAvailableThemes(): CarbonThemeName[] {
  return ['white', 'g10', 'g90', 'g100'];
}
