import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgccColorThemeService } from './ngcc-color-theme.service';
import { NgccButton } from '../ngcc-button/ngcc-button';

@Component({
  selector: 'ngcc-color-theme-switcher',
  standalone: true,
  imports: [NgccButton],
  templateUrl: './ngcc-color-theme-switcher.html',
  styleUrls: ['./ngcc-color-theme-switcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccColorThemeSwitcher {
  private readonly colorService = inject(NgccColorThemeService);

  /** Optional default brand color provided by the consumer */
  readonly defaultColor = input<string>();

  constructor() {
    effect(() => {
      const color = this.defaultColor();
      if (color) {
        this.colorService.setDefaultBrandColor(color);
      }
    });
  }

  /** Signals for reactive template binding */
  protected readonly brandColor = computed(() => this.colorService.brandColor());
  protected readonly baseTheme = computed(() => this.colorService.baseTheme());

  /** Derived palette colors for preview */
  protected readonly primaryColor = computed(() => this.colorService.primaryColor());
  protected readonly secondaryColor = computed(() => this.colorService.secondaryColor());
  protected readonly dangerColor = computed(() => this.colorService.dangerColor());
  protected readonly successColor = computed(() => this.colorService.successColor());
  protected readonly warningccolor = computed(() => this.colorService.warningccolor());
  protected readonly infoColor = computed(() => this.colorService.infoColor());

  /** Base Carbon themes */
  protected readonly themes = signal(['white', 'g10', 'g90', 'g100'] as const);

  /** Update handlers */

  protected onBrandColorChange(value: string): void {
    this.colorService.updateBrandColor(value);
  }

  protected onBaseThemeChange(theme: 'white' | 'g10' | 'g90' | 'g100'): void {
    this.colorService.setBaseTheme(theme);
  }

  protected resetOverrides(): void {
    this.colorService.resetOverrides();
  }
}
