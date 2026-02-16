import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  afterNextRender,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccTooltip } from '../ngcc-tooltip/ngcc-tooltip';
import { NgccModalVariant, NgccModalSize } from './ngcc-modal.types';

@Component({
  selector: 'ngcc-modal',
  standalone: true,
  templateUrl: './ngcc-modal.html',
  imports: [NgccIcon, NgccTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccModal implements OnDestroy, OnChanges {
  private readonly renderer = inject(Renderer2);
  private readonly host = inject(ElementRef<HTMLElement>);

  // ---------- Inputs ----------
  @Input() open = false;
  @Input() variant: NgccModalVariant = 'default';
  @Input() size: NgccModalSize = 'md';
  @Input() closeOnOverlayClick = true;
  @Input() primaryDisabled = false;
  @Input() title = 'Modal Title';
  @Input() primaryLabel = 'Primary';
  @Input() secondaryLabel = 'Secondary';

  titleId: string = `ngcc-modal-title-${Math.random().toString(36).slice(2)}`;

  // ---------- Outputs ----------
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Output() secondaryClicked = new EventEmitter<void>();

  // ---------- Internal State ----------
  private readonly _open = signal(false);
  private readonly _variant = signal<NgccModalVariant>('default');
  private readonly _size = signal<NgccModalSize>('md');
  private readonly _closeOnOverlayClick = signal(true);
  private readonly _primaryDisabled = signal(false);
  private readonly _title = signal('Modal Title');
  private readonly _primaryLabel = signal('Primary');
  private readonly _secondaryLabel = signal('Secondary');

  private lastFocusedElement: HTMLElement | null = null;
  private removeKeyListener?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) this._open.set(changes['open'].currentValue ?? false);
    if (changes['variant']) this._variant.set(changes['variant'].currentValue ?? 'default');
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['closeOnOverlayClick'])
      this._closeOnOverlayClick.set(changes['closeOnOverlayClick'].currentValue ?? true);
    if (changes['primaryDisabled'])
      this._primaryDisabled.set(changes['primaryDisabled'].currentValue ?? false);
    if (changes['title']) this._title.set(changes['title'].currentValue ?? 'Modal Title');
    if (changes['primaryLabel'])
      this._primaryLabel.set(changes['primaryLabel'].currentValue ?? 'Primary');
    if (changes['secondaryLabel'])
      this._secondaryLabel.set(changes['secondaryLabel'].currentValue ?? 'Secondary');
  }

  constructor() {
    afterNextRender(() => {
      this.removeKeyListener = this.renderer.listen(
        'document',
        'keydown',
        (event: KeyboardEvent) => {
          if (event.key === 'Escape' && this._open()) {
            this.close();
          }
          if (event.key === 'Tab' && this._open()) {
            this.trapFocus(event);
          }
        },
      );
    });
  }

  // ---------- Lifecycle ----------
  ngOnDestroy(): void {
    if (this.removeKeyListener) {
      this.removeKeyListener();
    }
  }

  // ---------- API ----------
  openModal(): void {
    this._open.set(true);
    this.openChange.emit(true);
    this.lastFocusedElement = document.activeElement as HTMLElement;
  }

  close(): void {
    this._open.set(false);
    this.openChange.emit(false);
    this.closed.emit();
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  }

  submit(): void {
    if (!this._primaryDisabled()) {
      this.submitted.emit();
      this.close();
    }
  }

  onSecondaryClick(): void {
    this.secondaryClicked.emit();
    this.close();
  }

  onOverlayClick(event: Event): void {
    const modalEl = this.host.nativeElement.querySelector('.cds--modal');
    if (event.target === modalEl && this._closeOnOverlayClick()) {
      this.close();
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const modalEl = this.host.nativeElement.querySelector('.cds--modal');
    if (!modalEl) return;

    const focusable = modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      (last as HTMLElement).focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      (first as HTMLElement).focus();
    }
  }

  // Template accessors
  getOpen(): boolean {
    return this._open();
  }
}
