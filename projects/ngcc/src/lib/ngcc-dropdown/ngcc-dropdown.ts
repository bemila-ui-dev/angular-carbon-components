import {
  ChangeDetectionStrategy,
  Component,
  Optional,
  Self,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  computed,
  signal,
  effect,
  ElementRef,
  Injector,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { DOCUMENT, CommonModule } from '@angular/common';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { DropdownSize, NgccDropdownItem } from './ngcc-dropdown.types';

@Component({
  selector: 'ngcc-dropdown',
  standalone: true,
  templateUrl: './ngcc-dropdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgccIcon],
  host: {
    class: 'cds--list-box__wrapper cds--dropdown__wrapper',
  },
})
export class NgccDropdown<T = unknown> implements ControlValueAccessor, OnChanges {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private static idCounter = 0;
  readonly inputId = `ngcc-dropdown-${NgccDropdown.idCounter++}`;

  // === @Input properties ===
  @Input() label: string | undefined = undefined;
  @Input() readonly = false;
  @Input() required = false;
  @Input() helperText: string | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() items: NgccDropdownItem<T>[] = [];
  @Input() placeholder = 'Select...';
  @Input() size: DropdownSize = 'md';
  @Input() disabled = false;
  @Input() multi = false;
  @Input() skeleton = false;
  @Input() invalid: boolean | undefined = undefined;
  @Input() errorMessage: string | undefined = undefined;

  @Output() valueChange = new EventEmitter<T | T[]>();

  // Internal signals mirroring @Input properties
  private readonly _label = signal<string | undefined>(undefined);
  private readonly _readonly = signal(false);
  private readonly _required = signal(false);
  private readonly _helperText = signal<string | undefined>(undefined);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _items = signal<NgccDropdownItem<T>[]>([]);
  private readonly _placeholder = signal('Select...');
  private readonly _size = signal<DropdownSize>('md');
  private readonly _disabled = signal(false);
  private readonly _multi = signal(false);
  private readonly _skeleton = signal(false);
  private readonly _invalid = signal<boolean | undefined>(undefined);
  private readonly _errorMessage = signal<string | undefined>(undefined);

  // === Local signals ===
  protected readonly searchQuery = signal('');
  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const list = this.getItems() ?? [];
    return !q ? list : list.filter((it) => it.label.toLowerCase().includes(q));
  });
  protected readonly filteredItemCount = computed(() => this.filteredItems().length);

  // === Validation & local state ===
  private localTouched = signal(false);

  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal<number | null>(null);
  protected readonly selected = signal<T | T[] | null>(null);
  protected readonly isFocused = signal(false);

  // Mirror of control state (kept for computed and debug)
  private controlTouched = signal(false);
  private controlDirty = signal(false);
  private controlInvalid = signal(false);
  private controlErrors = signal<Record<string, unknown> | null>(null);
  private internalFocus = signal(false);

  private _statusSignal?: unknown;
  private _valueSignal?: unknown;

  // === Computed / derived ===
  protected readonly itemCount = computed(() => this.getItems()?.length ?? 0);

  // IMPORTANT: read validator state directly from the form control when available
  protected readonly isInvalid = computed(() => {
    const control = this.ngcontrol?.control;
    const sel = this.selected();
    const interacted = this.localTouched() || this.controlTouched() || this.controlDirty();

    // Explicit override always wins
    if (this.getInvalid() !== undefined) return this.getInvalid();

    //  If reactive control exists → trust it after user interaction
    if (control) {
      return interacted && (this.controlInvalid() || !!this.controlErrors());
    }

    //  Fallback for standalone usage
    const isEmpty = this.getMulti()
      ? !Array.isArray(sel) || sel.length === 0
      : sel === null || sel === '';
    return interacted && this.getRequired() && isEmpty;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue);
    if (changes['readonly']) this._readonly.set(changes['readonly'].currentValue ?? false);
    if (changes['required']) this._required.set(changes['required'].currentValue ?? false);
    if (changes['helperText']) this._helperText.set(changes['helperText'].currentValue);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue);
    if (changes['items']) this._items.set(changes['items'].currentValue ?? []);
    if (changes['placeholder'])
      this._placeholder.set(changes['placeholder'].currentValue ?? 'Select...');
    if (changes['size']) this._size.set(changes['size'].currentValue ?? 'md');
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['multi']) this._multi.set(changes['multi'].currentValue ?? false);
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['invalid']) this._invalid.set(changes['invalid'].currentValue);
    if (changes['errorMessage']) this._errorMessage.set(changes['errorMessage'].currentValue);
  }

  // Accessor methods
  getLabel(): string | undefined {
    return this._label();
  }
  getReadonly(): boolean {
    return this._readonly();
  }
  getRequired(): boolean {
    return this._required();
  }
  getHelperText(): string | undefined {
    return this._helperText();
  }
  getAriaLabel(): string | undefined {
    return this._ariaLabel();
  }
  getItems(): NgccDropdownItem<T>[] {
    return this._items();
  }
  getPlaceholder(): string {
    return this._placeholder();
  }
  getSize(): DropdownSize {
    return this._size();
  }
  getDisabled(): boolean {
    return this._disabled();
  }
  getMulti(): boolean {
    return this._multi();
  }
  getSkeleton(): boolean {
    return this._skeleton();
  }
  getInvalid(): boolean | undefined {
    return this._invalid();
  }
  getErrorMessage(): string | undefined {
    return this._errorMessage();
  }

  private readonly _disabledByForm = signal(false);
  readonly isDisabled = computed(() => this.getDisabled() || this._disabledByForm());

  protected readonly displayErrorMessage = computed(() => {
    if (!this.isInvalid()) return null;

    // Manual override
    if (this.getErrorMessage()) return this.getErrorMessage();

    const control = this.ngcontrol?.control;
    const errors = control?.errors ?? this.controlErrors() ?? {};
    const sel: T | T[] | null = this.selected();

    //  Reactive form-driven errors
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length not met`;
    if (errors['maxlength']) return `Maximum length exceeded`;
    if (errors['pattern']) return `Invalid format`;

    //  Local validation fallback
    const isEmpty = this.getMulti()
      ? !Array.isArray(sel) || sel.length === 0
      : sel === null || sel === '';
    if (this.getRequired() && isEmpty) return 'This field is required';

    return 'Invalid selection';
  });

  protected readonly triggerClass = computed(() => {
    const sizeCls: Record<DropdownSize, string> = {
      sm: 'cds--list-box--sm cds--dropdown--sm',
      md: 'cds--list-box--md cds--dropdown--md',
      lg: 'cds--list-box--lg cds--dropdown--lg',
    };
    return [
      'cds--list-box',
      'cds--dropdown',
      sizeCls[this.getSize()] ?? '',
      this.getMulti() ? 'cds--multiselect' : '',
      this.isOpen() ? 'cds--list-box--expanded' : '',
      this.isDisabled() ? 'cds--dropdown--disabled cds--list-box--disabled' : '',
      this.getReadonly() ? 'cds--dropdown--readonly' : '',
      this.getInvalid() ? 'cds--dropdown--invalid cds--list-box--invalid' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly computedAriaLabel = computed(
    () => this.getAriaLabel() ?? this.getLabel() ?? 'dropdown-label',
  );
  protected readonly lastSelected = computed(() => {
    const sel: T | T[] | null = this.selected();
    return Array.isArray(sel) && sel.length ? sel[sel.length - 1] : null;
  });

  constructor(@Optional() @Self() private ngcontrol: NgControl) {
    if (ngcontrol) {
      ngcontrol.valueAccessor = this;
      const c = ngcontrol.control;
      if (c) {
        // Convert control state into reactive signals so computed() reacts
        const statusSignal = signal(c.status);
        const valueSignal = signal(c.value);

        // Subscribe once, keep signals hot
        c.statusChanges?.subscribe((s) => statusSignal.set(s));
        c.valueChanges?.subscribe((v) => valueSignal.set(v));

        // reactive bridge for validation & display
        effect(() => {
          this.controlInvalid.set(c.invalid);
          this.controlTouched.set(c.touched);
          this.controlDirty.set(c.dirty);
          this.controlErrors.set(c.errors);
        });

        // store for reactivity
        this._statusSignal = statusSignal;
        this._valueSignal = valueSignal;
      }
    }

    // Close dropdown when clicking outside
    effect(
      (onCleanup) => {
        const handler = (ev: MouseEvent): void => {
          const el = this.host.nativeElement;
          if (this.isOpen() && ev.target instanceof Node && !el.contains(ev.target)) this.close();
        };
        this.document.addEventListener('click', handler, true);
        onCleanup(() => this.document.removeEventListener('click', handler, true));
      },
      { injector: this.injector },
    );
  }

  // === Search ===
  onSearchInput(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
  onSearchKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.activeIndex.set(this._firstSelectableIndex(0));
    }
  }

  // === Open / Close ===
  toggle(): void {
    if (this.isDisabled()) return;
    this.isOpen.update((o) => !o);
    if (this.isOpen()) {
      this.activeIndex.set(this._firstSelectableIndex(0));
      this._focusMenu();
      setTimeout(() => this._focusSearchInput(), 0);
    } else {
      this.activeIndex.set(null);
      this._focusTrigger();
    }
  }
  open(): void {
    if (this.isDisabled()) return;
    this.searchQuery.set('');
    this.isOpen.set(true);
    this.activeIndex.set(this._firstSelectableIndex(0));
    this._focusMenu();
    setTimeout(() => this._focusSearchInput(), 0);
  }
  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.activeIndex.set(null);

    // Focus back to trigger
    this._focusTrigger();

    // ✅ Only validate after menu closes
    this.localTouched.set(true);
    const c = this.ngcontrol?.control;
    if (c) {
      c.markAsTouched();
      this.controlTouched.set(true);
      c.updateValueAndValidity();
      this.syncControlState(c);
    }
  }

  // === Selection ===
  onItemClick(e: Event, item: NgccDropdownItem<T>): void {
    e.stopPropagation();
    if (!item.disabled) this.selectItem(item);
  }

  selectItem(item: NgccDropdownItem<T>): void {
    if (!item || item.disabled) return;

    const control = this.ngcontrol?.control;
    let newValue: T | T[];

    if (this.getMulti()) {
      const current = this.selected();
      const cur: T[] = Array.isArray(current) ? [...current] : [];
      const found = cur.findIndex((v) => this._isEqual(v, item.value));
      if (found >= 0) cur.splice(found, 1);
      else cur.push(item.value as T);
      newValue = cur;
    } else {
      newValue = item.value as T;
      this.close();
    }

    // ✅ Update signals and notify CVA
    this.selected.set(newValue);
    this.valueChange.emit(newValue);
    this.onChangeFn(newValue);
    this.onTouchedFn();
    this.localTouched.set(true);

    // ✅ Sync FormControl immediately and re-run validators
    if (control) {
      if (!this._isEqual(control.value, newValue)) {
        control.setValue(newValue, { emitEvent: true });
      }
      control.markAsDirty();
      control.markAsTouched();
      control.updateValueAndValidity({ emitEvent: true });
      this.syncControlState(control);
    }

    // Fallback for standalone usage
    this.controlDirty.set(true);
  }

  // For keyboard navigation (unfiltered)
  selectIndex(idx: number | null): void {
    if (idx === null || idx < 0) return;
    const item = this.filteredItems()?.[idx];
    if (item && !item.disabled) this.selectItem(item);
  }

  // === Keyboard ===
  onTriggerKeydown(ev: KeyboardEvent): void {
    if (this.isDisabled()) return;
    switch (ev.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        ev.preventDefault();
        this.open();
        break;
      case 'Enter':
      case ' ':
        ev.preventDefault();
        this.toggle();
        break;
    }
  }
  onMenuKeydown(ev: KeyboardEvent): void {
    if (!this.isOpen()) return;
    const total = this.itemCount();
    let idx: number | null = this.activeIndex();

    if (idx === null || idx < 0) {
      idx = this._firstSelectableIndex(0);
    } else {
      idx = this._nextSelectableIndex(idx + 1);
    }
    this.activeIndex.set(idx);
    const list = this.filteredItems();
    if (!list.length) return;

    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        idx = this._nextSelectableIndex(idx + 1);
        this.activeIndex.set(idx);
        this._scrollActiveIntoView();
        break;

      case 'ArrowUp':
        ev.preventDefault();
        if (idx <= 0) {
          this.activeIndex.set(null);
          this._focusSearchInput();
        } else {
          idx = this._prevSelectableIndex(idx - 1);
          this.activeIndex.set(idx);
          this._scrollActiveIntoView();
        }
        break;
      case 'Home':
        ev.preventDefault();
        idx = this._firstSelectableIndex(0);
        this.activeIndex.set(idx);
        this._scrollActiveIntoView();
        break;
      case 'End':
        ev.preventDefault();
        idx = this._lastSelectableIndex(total - 1);
        this.activeIndex.set(idx);
        this._scrollActiveIntoView();
        break;
      case 'Enter':
      case ' ':
        ev.preventDefault();
        if (idx >= 0) this.selectIndex(idx);
        break;
      case 'Escape':
        ev.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // === Focus ===
  onTriggerFocus(): void {
    this.isFocused.set(true);
    this.internalFocus.set(true);
  }

  onTriggerBlur(_event?: FocusEvent): void {
    // delay check to allow focus to move to internal search or menu
    setTimeout(() => {
      const el = this.host.nativeElement;
      const active = this.document.activeElement as HTMLElement | null;
      const stillInside = !!active && el.contains(active);

      if (!stillInside) {
        this.isFocused.set(false);
        this.internalFocus.set(false);

        // ✅ Mark touched only when leaving the entire component
        this.localTouched.set(true);

        const c = this.ngcontrol?.control;
        if (c) {
          c.markAsTouched();
          this.controlTouched.set(true);
          c.updateValueAndValidity();
          this.syncControlState(c);
        }
      }
    }, 50);
  }

  // === Helpers ===
  protected isSelected(item: NgccDropdownItem<T>): boolean {
    const sel: T | T[] | null = this.selected();
    return this.getMulti()
      ? Array.isArray(sel) && sel.some((v) => this._isEqual(v, item.value))
      : sel !== null && this._isEqual(sel, item.value);
  }

  private _focusMenu(): void {
    (this.host.nativeElement.querySelector('.cds--list-box__menu') as HTMLElement | null)?.focus();
  }
  private _focusTrigger(): void {
    (this.host.nativeElement.querySelector('.cds--list-box__field') as HTMLElement | null)?.focus();
  }

  private _scrollActiveIntoView(): void {
    const menu = this.host.nativeElement.querySelector(
      '.cds--list-box__menu',
    ) as HTMLElement | null;
    if (!menu) return;
    const activeId = this._activeItemId(this.activeIndex() ?? -1);
    (menu.querySelector(`#${activeId}`) as HTMLElement | null)?.scrollIntoView({
      block: 'nearest',
    });
  }
  private _focusSearchInput(): void {
    (
      this.host.nativeElement.querySelector(
        '.cds--dropdown-search input',
      ) as HTMLInputElement | null
    )?.focus();
  }

  private _firstSelectableIndex(start: number): number {
    const list = this.filteredItems() ?? [];
    for (let i = start; i < list.length; i++) if (!list[i].disabled) return i;
    return -1;
  }
  private _lastSelectableIndex(start: number): number {
    const list = this.filteredItems() ?? [];
    for (let i = start; i >= 0; i--) if (!list[i].disabled) return i;
    return -1;
  }
  private _nextSelectableIndex(start: number): number {
    const list = this.filteredItems() ?? [];
    if (!list.length) return -1;

    // Ensure start is within bounds
    let i = Math.max(0, start);
    for (; i < list.length; i++) {
      if (list[i] && !list[i].disabled) return i;
    }
    // wrap around to first
    return this._firstSelectableIndex(0);
  }

  private _prevSelectableIndex(start: number): number {
    const list = this.filteredItems() ?? [];
    if (!list.length) return -1;

    // Ensure start is within bounds
    let i = Math.min(list.length - 1, start);
    for (; i >= 0; i--) {
      if (list[i] && !list[i].disabled) return i;
    }
    // wrap to last
    return this._lastSelectableIndex(list.length - 1);
  }

  private _activeItemId(i: number): string {
    return `ngcc-dropdown-item-${i}`;
  }

  // more robust deep-equality (better than JSON.stringify for ordering / types)
  protected _isEqual(a: unknown | null, b: unknown | null): boolean {
    if (a === b) return true;
    if (a === null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return String(a) === String(b);

    try {
      const aKeys = Object.keys(a as object);
      const bKeys = Object.keys(b as object);
      if (aKeys.length !== bKeys.length) return false;
      for (const key of aKeys) {
        if (!(key in (b as object))) return false;
        if (
          !this._isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
        )
          return false;
      }
      return true;
    } catch {
      // fallback
      return JSON.stringify(a) === JSON.stringify(b);
    }
  }

  // === CVA ===
  private onChangeFn: (val: T | T[] | null) => void = () => {};
  private onTouchedFn: () => void = () => {};
  writeValue(val: T | T[] | null): void {
    // set selected but do not force touch/dirty — keep control's own flags authoritative
    this.selected.set(val);
    // if there's a control, re-sync to reflect possible validator changes
    const c = this.ngcontrol?.control;
    if (c) {
      // update our mirror signals immediately
      this.syncControlState(c);
    }
  }
  registerOnChange(fn: (val: T | T[] | null) => void): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this._disabledByForm.set(isDisabled);
  }

  // Keep sync logic separated so we can call it whenever we need fresh flags
  private syncControlState(
    c: {
      errors: Record<string, unknown> | null;
      invalid: boolean;
      touched: boolean;
      dirty: boolean;
    } | null,
  ): void {
    this.controlErrors.set(c?.errors ?? null);
    this.controlInvalid.set(!!c?.invalid);
    this.controlTouched.set(!!c?.touched);
    this.controlDirty.set(!!c?.dirty);
  }

  protected getLabelForSelection(): string {
    const items = this.getItems() ?? [];
    const sel: T | T[] | null = this.selected();
    if (this.getMulti()) {
      if (!Array.isArray(sel) || !sel.length) return this.getPlaceholder();
      return items
        .filter((it) => sel.some((v) => this._isEqual(v, it.value)))
        .map((it) => it.label)
        .join(', ');
    } else {
      if (sel === null) return this.getPlaceholder();
      return items.find((it) => this._isEqual(it.value, sel))?.label ?? this.getPlaceholder();
    }
  }

  protected itemId: (i: number) => string = (i: number) => this._activeItemId(i);

  /** @internal Used only for test introspection */
  get debugState(): unknown {
    return {
      isOpen: this.isOpen(),
      activeIndex: this.activeIndex(),
      isFocused: this.isFocused(),
      selected: this.selected(),
      isInvalid: this.isInvalid(),
      displayErrorMessage: this.displayErrorMessage(),
      localTouched: this.localTouched(),
      controlMirror: {
        touched: this.controlTouched(),
        dirty: this.controlDirty(),
        invalid: this.controlInvalid(),
        errors: this.controlErrors(),
      },
    };
  }
}
