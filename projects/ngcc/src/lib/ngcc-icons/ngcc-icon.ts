import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS, NgccIconNameType } from './icons';
import { IconSize } from './ngcc-icon.types';

@Component({
  selector: 'ngcc-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svg()) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.class]="className()"
        [attr.viewBox]="viewBox()"
        [style.width.rem]="sizeInRem()"
        [style.height.rem]="sizeInRem()"
        [style.fill]="getColor()"
        [innerHTML]="svg()"
        [attr.aria-label]="isDecorative() ? null : effectiveAriaLabel()"
        [attr.aria-hidden]="isDecorative() ? 'true' : null"
        role="img"
        focusable="false"
      ></svg>
    }
  `,
  styleUrls: ['./ngcc-icon.scss'],
})
export class NgccIcon implements OnChanges {
  constructor(private sanitizer: DomSanitizer) {}

  // Public @Input properties (stable API)
  @Input() name: NgccIconNameType | undefined = undefined;
  @Input() size: IconSize = 'md';
  @Input() color = 'currentColor';
  @Input() ariaLabel: string | null = null;
  @Input() decorative = false;
  @Input() svgClass: string | null = null;

  // Internal state signals (private, not exposed)
  private readonly _name = signal<NgccIconNameType | undefined>(undefined);
  private readonly _size = signal<IconSize>('md');
  private readonly _color = signal('currentColor');
  private readonly _ariaLabel = signal<string | null>(null);
  private readonly _decorative = signal(false);
  private readonly _svgClass = signal<string | null>(null);

  // Sync @Input properties to private signals
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) this._name.set(changes['name'].currentValue ?? undefined);
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['color']) this._color.set(changes['color'].currentValue ?? 'currentColor');
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? null);
    if (changes['decorative']) this._decorative.set(changes['decorative'].currentValue ?? false);
    if (changes['svgClass']) this._svgClass.set(changes['svgClass'].currentValue ?? null);
  }

  private readonly sizeMap: Record<Exclude<IconSize, number>, number> = {
    sm: 1,
    md: 1.25,
    lg: 1.5,
    xl: 1.9,
  };

  // Template accessor methods
  getColor(): string {
    return this._color();
  }

  // Computed size in rem
  sizeInRem = computed(() => {
    const val = this._size();
    return typeof val === 'number' ? val : (this.sizeMap[val] ?? this.sizeMap['md']);
  });

  // Computed viewBox (fallback if name is invalid)
  viewBox = computed(() => {
    const key = this._name();
    const iconDef = key ? ICONS[key] : undefined;
    return iconDef?.viewBox ?? '0 0 16 16';
  });

  // Computed SVG content (sanitized HTML)
  svg = computed<SafeHtml | null>(() => {
    const key = this._name();
    if (!key) return null;
    const iconDef = ICONS[key];
    if (!iconDef) {
      console.warn(`[NgccIcon] Icon "${key}" not found in ICONS.`);
      return null;
    }
    return this.sanitizer.bypassSecurityTrustHtml(iconDef.svg);
  });

  // Computed className for SVG
  className = computed(() => {
    const extra = this._svgClass();
    return ['cds--btn__icon ngcc_icon', extra].filter(Boolean).join(' ');
  });

  // Human-friendly aria-label fallback
  effectiveAriaLabel = computed(() => {
    if (this._decorative()) return null;
    if (this._ariaLabel()) return this._ariaLabel();
    const key = this._name();
    if (!key) return null;
    return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()); // "arrow_left" → "Arrow Left"
  });

  isDecorative = computed(() => this._decorative());
}
