import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  Renderer2,
  OnDestroy,
  signal,
  computed,
  effect,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  untracked,
} from '@angular/core';
import { TooltipPlacement, TooltipAlign } from './ngcc-tooltip.types';

@Component({
  selector: 'ngcc-tooltip',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './ngcc-tooltip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccTooltip implements OnDestroy, OnChanges {
  private static tooltipCount = 0;

  // --- Inputs ---
  @Input() description: string | TemplateRef<unknown> | undefined = undefined;
  @Input() disabled = false;
  @Input() placement: TooltipPlacement = 'top';
  @Input() align: TooltipAlign = 'center';
  @Input() autoAlign = false;
  @Input() enterDelayMs = 100;
  @Input() leaveDelayMs = 300;
  @Input() open: boolean | undefined = undefined; // controlled mode

  // --- Internal State Signals ---
  private readonly _description = signal<string | TemplateRef<unknown> | undefined>(undefined);
  private readonly _disabled = signal(false);
  private readonly _placement = signal<TooltipPlacement>('top');
  private readonly _align = signal<TooltipAlign>('center');
  private readonly _autoAlign = signal(false);
  private readonly _enterDelayMs = signal(100);
  private readonly _leaveDelayMs = signal(300);
  private readonly _open = signal<boolean | undefined>(undefined);

  readonly isOpen = signal(false);
  readonly new_placement = signal<TooltipPlacement>(this._placement());

  private timeoutId?: ReturnType<typeof setTimeout>;
  private readonly id = `ngcc-tooltip-${NgccTooltip.tooltipCount++}`;
  readonly tooltipId = (): string => this.id;

  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLElement>;
  @ViewChild('tooltip') tooltipRef?: ElementRef<HTMLElement>;

  // internal helpers
  private hostEl = inject(ElementRef);
  private rafId = 0;
  private resizeObserver?: ResizeObserver;
  private listenersAdded = false;
  private unlistenResize?: () => void;
  private unlistenScroll?: () => void;
  private isDestroyed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['description'])
      this._description.set(changes['description'].currentValue ?? undefined);
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['placement']) this._placement.set(changes['placement'].currentValue ?? 'top');
    if (changes['align']) this._align.set(changes['align'].currentValue ?? 'center');
    if (changes['autoAlign']) this._autoAlign.set(changes['autoAlign'].currentValue ?? false);
    if (changes['enterDelayMs'])
      this._enterDelayMs.set(changes['enterDelayMs'].currentValue ?? 100);
    if (changes['leaveDelayMs'])
      this._leaveDelayMs.set(changes['leaveDelayMs'].currentValue ?? 300);
    if (changes['open']) this._open.set(changes['open'].currentValue ?? undefined);
  }

  constructor(private renderer: Renderer2) {
    // 1. Sync 'open' input to internal 'isOpen'
    effect(() => {
      const val = this._open();
      if (val !== undefined) {
        untracked(() => {
          if (val !== this.isOpen()) this.isOpen.set(val);
        });
      }
    });

    // 2. Handle description changes
    effect(() => {
      if (!this._description()) {
        untracked(() => {
          if (this.isOpen()) this.isOpen.set(false);
        });
      }
    });

    // 3. Handle Auto-Align Lifecycle
    effect(() => {
      const active = this._autoAlign() && this.isOpen();
      untracked(() => {
        if (active) {
          queueMicrotask(() => {
            if (!this.isDestroyed && this._autoAlign() && this.isOpen()) {
              this.setupAutoAlignResources();
              this.updateAutoPlacementBound();
            }
          });
        } else {
          this.teardownAutoAlignResources();
          if (!this._autoAlign() && this.new_placement() !== this._placement()) {
            this.new_placement.set(this._placement());
          }
        }
      });
    });

    // 4. Sync placement input → new_placement (when autoAlign = false)
    effect(() => {
      const placement = this._placement();
      untracked(() => {
        if (!this._autoAlign() && this.new_placement() !== placement) {
          this.new_placement.set(placement);
        }
      });
    });
  }

  // Debounced/cancellable call used by listeners/observer
  private updateAutoPlacementBound = (): void => {
    if (this.isDestroyed || !this._autoAlign() || !this.isOpen()) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      if (!this.isDestroyed && this.isOpen()) {
        this.updateAutoPlacement();
      }
    });
  };

  // safe lookup for trigger and tooltip elements (works with overlay bodies)
  private lookupElements(): { triggerEl: HTMLElement | null; tooltipEl: HTMLElement | null } {
    const triggerEl =
      this.trigger?.nativeElement ??
      (this.hostEl?.nativeElement?.querySelector('[data-ngcc-trigger]') as HTMLElement | null) ??
      null;

    const tooltipEl =
      this.tooltipRef?.nativeElement ??
      (document.getElementById(this.tooltipId()) as HTMLElement | null) ??
      null;

    return { triggerEl, tooltipEl };
  }

  // core placement calculation
  private updateAutoPlacement(): void {
    const { triggerEl, tooltipEl } = this.lookupElements();

    if (!triggerEl || !tooltipEl) {
      // tooltip or trigger not ready — a valid case during initial render
      // we'll try again on next animation frame (observer/listener will trigger us)
      // console for debugging
      // console.debug('[ngcc-tooltip] missing trigger/tooltip; trigger:', !!triggerEl, 'tooltip:', !!tooltipEl);
      return;
    }

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const spaceTop = triggerRect.top;
    const spaceBottom = window.innerHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = window.innerWidth - triggerRect.right;

    const tooltipHeight = tooltipRect.height;
    const tooltipWidth = tooltipRect.width;

    const fitsTop = spaceTop >= tooltipHeight;
    const fitsBottom = spaceBottom >= tooltipHeight;
    const fitsLeft = spaceLeft >= tooltipWidth;
    const fitsRight = spaceRight >= tooltipWidth;

    // prefer the configured placement first, then fallback list
    const fallbackOrder: TooltipPlacement[] = [
      this._placement(),
      'top',
      'bottom',
      'right',
      'left',
    ].filter((v, i, a): v is TooltipPlacement => a.indexOf(v) === i);

    const bestPlacement = fallbackOrder.find((pos) => {
      if (pos === 'top') return fitsTop;
      if (pos === 'bottom') return fitsBottom;
      if (pos === 'left') return fitsLeft;
      if (pos === 'right') return fitsRight;
      return false;
    });

    const finalPlacement = bestPlacement ?? this._placement();
    if (finalPlacement !== this.new_placement()) {
      // debug line you can remove later
      // console.debug('[ngcc-tooltip] switching placement', this.new_placement(), '=>', finalPlacement);
      this.new_placement.set(finalPlacement);
    }
  }

  private setupAutoAlignResources(): void {
    if (this.isDestroyed || this.listenersAdded) return;

    // renderer.listen returns a cleanup function for simple targets
    this.unlistenResize = this.renderer.listen('window', 'resize', this.updateAutoPlacementBound);

    // scroll: use capture to catch scrolls from inner scrollable containers
    // renderer.listen does not support capture/capture options, so call native
    window.addEventListener('scroll', this.updateAutoPlacementBound, {
      capture: true,
      passive: true,
    });
    this.unlistenScroll = () =>
      window.removeEventListener('scroll', this.updateAutoPlacementBound, true);

    // ResizeObserver to detect size changes (trigger or tooltip)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateAutoPlacementBound());
    }

    // start observing once DOM nodes are available (queueMicrotask to ensure view update)
    queueMicrotask(() => {
      const { triggerEl, tooltipEl } = this.lookupElements();
      if (this.resizeObserver) {
        if (triggerEl) this.resizeObserver.observe(triggerEl);
        if (tooltipEl) this.resizeObserver.observe(tooltipEl);
      }
    });

    this.listenersAdded = true;
  }

  private teardownAutoAlignResources(): void {
    if (this.unlistenResize) {
      this.unlistenResize();
      this.unlistenResize = undefined;
    }
    if (this.unlistenScroll) {
      this.unlistenScroll();
      this.unlistenScroll = undefined;
    } else {
      // fallback ensure removal
      try {
        window.removeEventListener('scroll', this.updateAutoPlacementBound, true);
      } catch {}
    }
    if (this.resizeObserver) {
      try {
        this.resizeObserver.disconnect();
      } catch {}
      this.resizeObserver = undefined;
    }
    this.listenersAdded = false;
    cancelAnimationFrame(this.rafId);
  }

  // ngAfterViewInit intentionally left as no-op; lifecycle hook kept for future use

  readonly hostClasses = computed(() => {
    const classes: string[] = [
      'cds--popover--caret cds--popover--high-contrast cds--popover-container cds--tooltip',
      `cds--popover--${this.new_placement()}`,
    ];
    if (this.isOpen()) classes.push('cds--popover--open');
    return classes.join(' ');
  });

  // --- Events ---
  onMouseEnter(): void {
    if (this._disabled() || this._open() !== undefined || !this._description()) return;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.isOpen.set(true), this._enterDelayMs());
  }

  onMouseLeave(): void {
    if (this._disabled() || this._open() !== undefined) return;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.isOpen.set(false), this._leaveDelayMs());
  }

  onFocusIn(): void {
    if (!this._disabled() && this._open() === undefined && this._description()) {
      this.isOpen.set(true);
    }
  }

  onFocusOut(): void {
    if (this._open() === undefined) {
      this.isOpen.set(false);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this._open() === undefined) {
      this.isOpen.set(false);
    }
  }

  isTemplate(value: unknown): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }

  readonly descriptionTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this._description()) ? (this._description() as TemplateRef<unknown>) : null;

  getDescription(): string | TemplateRef<unknown> | undefined {
    return this._description();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.isOpen.set(false);
    clearTimeout(this.timeoutId);
    this.teardownAutoAlignResources();
  }
}
