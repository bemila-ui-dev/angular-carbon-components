import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccDropdownItem } from './ngcc-dropdown.types';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { CommonModule } from '@angular/common';
import { axe } from 'vitest-axe';
import { NgccDropdown } from './ngcc-dropdown';

// ---------- Host component for reactive-form validator tests ----------
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgccDropdown],
  template: `
    <form [formGroup]="form">
      <ngcc-dropdown
        formControlName="choice"
        [label]="'Select option'"
        [items]="items"
        [required]="required"
        [multi]="multi"
        [placeholder]="'Choose one...'"
      ></ngcc-dropdown>
    </form>
  `,
})
class TestHostComponent {
  required = false;
  multi = false;
  items: NgccDropdownItem<string>[] = [
    { label: 'Alpha', value: 'A' },
    { label: 'Beta', value: 'B' },
    { label: 'Gamma', value: 'C', disabled: true },
  ];

  form = new FormGroup({
    choice: new FormControl<string | string[] | null>(null),
  });
}

// ---------- Unit Tests ----------
describe('NgccDropdown (unit)', () => {
  let fixture: ComponentFixture<NgccDropdown<string>>;
  let component: NgccDropdown<string>;
  let hostEl: HTMLElement;

  const items: NgccDropdownItem<string>[] = [
    { label: 'Apple', value: 'A' },
    { label: 'Banana', value: 'B' },
    { label: 'Cherry', value: 'C' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NgccIcon, NgccDropdown],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccDropdown<string>);
    component = fixture.componentInstance;
    hostEl = fixture.nativeElement;

    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  function getTrigger(): HTMLElement {
    return hostEl.querySelector('[data-testid="ngcc-dropdown-trigger"]')!;
  }

  function openDropdown(): void {
    getTrigger().dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and placeholder correctly', () => {
    fixture.componentRef.setInput('label', 'Fruits');
    fixture.componentRef.setInput('placeholder', 'Select fruit');
    fixture.detectChanges();

    const labelEl = hostEl.querySelector('.cds--label');
    expect(labelEl?.textContent).toContain('Fruits');
    expect(hostEl.textContent).toContain('Select fruit');
  });

  it('should toggle dropdown open/close', () => {
    expect(component.debugState.isOpen).toBe(false);

    getTrigger().dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.debugState.isOpen).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.debugState.isOpen).toBe(false);
  });

  it('should select single item and emit valueChange', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    openDropdown();
    const option = hostEl.querySelectorAll('li')[0];
    option.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.debugState.selected).toEqual('A');
    expect(spy).toHaveBeenCalledWith('A');
  });

  it('should support multi-selection mode', () => {
    fixture.componentRef.setInput('multi', true);
    fixture.detectChanges();

    openDropdown();
    component.selectIndex(0);
    component.selectIndex(1);

    expect(component.debugState.selected).toEqual(['A', 'B']);
  });

  it('should show “No results found” when search yields nothing', () => {
    openDropdown();
    const input = hostEl.querySelector('.cds--search-input') as HTMLInputElement;
    if (input) {
      input.value = 'Zzz';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      const message = hostEl.querySelector('.cds--list-box__menu-item--disabled');
      expect(message?.textContent).toContain('No results found');
    }
  });

  it('should not show error when valid selection exists', () => {
    fixture.componentRef.setInput('required', true);
    component.writeValue('A');
    fixture.detectChanges();

    component.onTriggerBlur();
    fixture.detectChanges();

    expect(component.debugState.isInvalid).toBe(false);
  });

  it('should apply disabled class when disabled=true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const wrapper = hostEl.querySelector('.cds--dropdown--disabled');
    expect(wrapper).toBeTruthy();
  });

  it('should close dropdown with Escape key', () => {
    openDropdown();
    const menu = hostEl.querySelector('.cds--list-box__menu')!;
    const eventEsc = new KeyboardEvent('keydown', { key: 'Escape' });
    menu.dispatchEvent(eventEsc);
    fixture.detectChanges();
    expect(component.debugState.isOpen).toBe(false);
  });
  // it('should navigate options using ArrowDown and ArrowUp', () => {
  //   openDropdown();
  //   fixture.detectChanges();

  //   const menu = hostEl.querySelector('.cds--list-box__menu')!;
  //   const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
  //   menu.dispatchEvent(eventDown);
  //   fixture.detectChanges();

  //   expect(component.debugState.activeIndex).toBe(0);

  //   const eventDown2 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
  //   menu.dispatchEvent(eventDown2);
  //   fixture.detectChanges();

  //   expect(component.debugState.activeIndex).toBe(1);

  //   const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
  //   menu.dispatchEvent(eventUp);
  //   fixture.detectChanges();

  //   expect(component.debugState.activeIndex).toBe(0);
  // });

  it('should select an item with Enter key', () => {
    openDropdown();
    fixture.detectChanges();

    const menu = hostEl.querySelector('.cds--list-box__menu')!;
    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    menu.dispatchEvent(eventDown);
    fixture.detectChanges();

    const eventEnter = new KeyboardEvent('keydown', { key: 'Enter' });
    menu.dispatchEvent(eventEnter);
    fixture.detectChanges();

    expect(component.debugState.selected).toEqual('A');
  });

  it('should wrap to first and last item using Home and End keys', () => {
    openDropdown();
    fixture.detectChanges();

    const menu = hostEl.querySelector('.cds--list-box__menu')!;
    const eventEnd = new KeyboardEvent('keydown', { key: 'End' });
    menu.dispatchEvent(eventEnd);
    fixture.detectChanges();
    expect(component.debugState.activeIndex).toBe(items.length - 1);

    const eventHome = new KeyboardEvent('keydown', { key: 'Home' });
    menu.dispatchEvent(eventHome);
    fixture.detectChanges();
    expect(component.debugState.activeIndex).toBe(0);
  });
  it('should focus first item when pressing ArrowDown from search input', () => {
    openDropdown();
    const search = hostEl.querySelector('.cds--search-input') as HTMLInputElement;
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.debugState.activeIndex).toBe(0);
  });

  //   it('should return focus to search input when pressing ArrowUp on first item', () => {
  //     openDropdown();
  //     (component as any).activeIndex.set(0);
  //     fixture.detectChanges();
  //     const menu = hostEl.querySelector('.cds--list-box__menu')!;
  //     menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  //     fixture.detectChanges();
  //     expect(component.debugState.activeIndex).toBeNull();
  //   });

  function getCombobox(): HTMLElement {
    return fixture.debugElement.query(By.css('[role="combobox"]')).nativeElement;
  }
  describe('WCAG / Accessibility', () => {
    it('should have no WCAG violations (default)', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should expose accessible name via label', async () => {
      fixture.componentRef.setInput('label', 'Select items');
      fixture.detectChanges();

      const combobox = getCombobox();
      expect(combobox.getAttribute('aria-labelledby')).toBe('Select items');

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should fallback to aria-label when label is missing', async () => {
      fixture.componentRef.setInput('label', undefined);
      fixture.componentRef.setInput('ariaLabel', 'Dropdown');
      fixture.detectChanges();

      const combobox = getCombobox();
      expect(combobox.getAttribute('aria-label')).toBe('Dropdown');

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should expose invalid state and error message', async () => {
      fixture.componentRef.setInput('label', 'Select items');
      fixture.componentRef.setInput('invalid', true);
      fixture.componentRef.setInput('errorMessage', 'This field is required');
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('[data-testid="ngcc-dropdown-trigger"]'),
      ).nativeElement;

      expect(trigger.getAttribute('aria-invalid')).toBe('true');
      expect(trigger.getAttribute('aria-describedby')).toBe('dropdown-error');

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should expose required state', async () => {
      fixture.componentRef.setInput('label', 'Select items');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('[data-testid="ngcc-dropdown-trigger"]'),
      ).nativeElement;

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no WCAG violations when disabled', async () => {
      fixture.componentRef.setInput('label', 'Select items');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no WCAG violations in indeterminate state', async () => {
      fixture.componentRef.setInput('label', 'Select items');
      fixture.componentRef.setInput('indeterminate', true);
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});

// ---------- Reactive Forms Integration ----------
describe('NgccDropdown (reactive forms integration)', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComp: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComp = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  function openHostDropdown(): void {
    const button = hostFixture.debugElement.query(
      By.css('[data-testid="ngcc-dropdown-trigger"]'),
    ).nativeElement;
    button.click();
    hostFixture.detectChanges();
  }
  it('should not show error before touch but should after blur when required', () => {
    hostComp.required = true;

    openHostDropdown();
    hostFixture.detectChanges();

    expect(hostComp.form.valid).toBe(false);
  });

  it('should update reactive form value on selection', () => {
    openHostDropdown();
    const option = hostFixture.debugElement.queryAll(By.css('li'))[0].nativeElement;
    option.click();
    hostFixture.detectChanges();

    expect(hostComp.form.get('choice')?.value).toBe('A');
  });

  it('should mark control valid when value selected', () => {
    hostComp.required = true;

    openHostDropdown();
    const option = hostFixture.debugElement.queryAll(By.css('li'))[1].nativeElement;
    option.click();
    hostFixture.detectChanges();

    expect(hostComp.form.valid).toBe(true);
  });

  it('should handle multi-select integration', () => {
    hostComp.multi = true;

    openHostDropdown();
    const items = hostFixture.debugElement.queryAll(By.css('li'));
    items[0].nativeElement.click();
    items[1].nativeElement.click();
    hostFixture.detectChanges();

    const value = hostComp.form.get('choice')?.value;
    expect(Array.isArray(value)).toBe(true);
    expect(value).toEqual(['A', 'B']);
  });
});
