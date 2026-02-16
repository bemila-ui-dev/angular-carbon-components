import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccIconNameType } from '../ngcc-icons/icons';
import { NgccButtonVariant, NgccButtonSize, NgccButtonType } from './ngcc-button.types';

@Component({
  selector: 'ngcc-button',
  standalone: true,
  imports: [CommonModule, NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-button.html',
  styleUrls: ['./ngcc-button.scss'],
  host: {
    '[class.disabled]': 'disabled',
    '[attr.aria-disabled]': 'disabled',
  },
})
export class NgccButton implements OnChanges {
  @Input() label = '';
  @Input() variant: NgccButtonVariant = 'primary';
  @Input() size: NgccButtonSize = 'md';
  @Input() disabled = false;
  @Input() expressive = false;
  @Input() className = '';
  @Input() skeleton = false;
  @Input() type: NgccButtonType = 'button';

  // Accessibility
  @Input() ariaLabel: string | undefined = undefined;
  @Input() ariaExpanded: boolean | undefined = undefined;

  // Icons
  @Input() iconName: NgccIconNameType | undefined = undefined;
  @Input() iconOnly = false;

  // Internal signals for change detection
  private readonly _label = signal('');
  private readonly _variant = signal<NgccButtonVariant>('primary');
  private readonly _size = signal<NgccButtonSize>('md');
  private readonly _disabled = signal(false);
  private readonly _expressive = signal(false);
  private readonly _className = signal('');
  private readonly _skeleton = signal(false);
  private readonly _type = signal<NgccButtonType>('button');
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _ariaExpanded = signal<boolean | undefined>(undefined);
  private readonly _iconName = signal<NgccIconNameType | undefined>(undefined);
  private readonly _iconOnly = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue ?? '');
    if (changes['variant']) this._variant.set(changes['variant'].currentValue ?? 'primary');
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['expressive']) this._expressive.set(changes['expressive'].currentValue ?? false);
    if (changes['className']) this._className.set(changes['className'].currentValue ?? '');
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['type']) this._type.set(changes['type'].currentValue ?? 'button');
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? undefined);
    if (changes['ariaExpanded'])
      this._ariaExpanded.set(changes['ariaExpanded'].currentValue ?? undefined);
    if (changes['iconName']) this._iconName.set(changes['iconName'].currentValue ?? undefined);
    if (changes['iconOnly']) this._iconOnly.set(changes['iconOnly'].currentValue ?? false);
  }

  // computed signals for classes
  readonly classes = computed(() => {
    const variantMap: Record<string, string> = {
      primary: 'cds--btn--primary',
      secondary: 'cds--btn--secondary',
      tertiary: 'cds--btn--tertiary',
      ghost: 'cds--btn--ghost',
      danger: 'cds--btn--danger',
      danger_tertiary: 'cds--btn--danger--tertiary',
      danger_ghost: 'cds--btn--danger--ghost',
    };

    const sizeMap: Record<string, string> = {
      xs: 'cds--btn--xs cds--layout--size-xs',
      sm: 'cds--btn--sm cds--layout--size-sm',
      md: 'cds--btn--md cds--layout--size-md',
      lg: 'cds--btn--lg cds--layout--size-lg',
      xl: 'cds--btn--xl cds--layout--size-xl',
    };

    return [
      'cds--btn ngcc--btn',
      variantMap[this._variant()],
      sizeMap[this._size()],
      this._expressive() ? 'cds--btn--expressive' : '',
      this._iconOnly() ? 'cds--btn--icon-only' : '',
      this._skeleton() ? 'cds--skeleton' : '',
      this._className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  onKeydown(event: KeyboardEvent): void {
    if (this._disabled()) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
}
