import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccButton } from './ngcc-button';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { axe } from 'vitest-axe';
import { NgccButtonVariant, NgccButtonSize, NgccButtonType } from './ngcc-button.types';
import { NgccIconNameType } from '../ngcc-icons/icons';

@Component({
  template: `
    <ngcc-button
      [label]="label"
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [expressive]="expressive"
      [ariaLabel]="ariaLabel"
      [ariaExpanded]="ariaExpanded"
      [iconName]="iconName"
      [iconOnly]="iconOnly"
      [className]="className"
      [skeleton]="skeleton"
      [type]="type"
      (click)="onClick($event)"
    ></ngcc-button>
  `,
  standalone: true,
  imports: [CommonModule, NgccButton, NgccIcon],
})
class TestHostComponent {
  label = 'Submit';
  variant: NgccButtonVariant = 'primary';
  size: NgccButtonSize = 'md';
  disabled = false;
  expressive = false;
  ariaLabel: string | undefined = undefined;
  ariaExpanded: boolean | undefined = undefined;
  iconName?: NgccIconNameType = undefined;
  iconOnly = false;
  className: string | undefined = undefined;
  skeleton = false;
  type: NgccButtonType = 'button';

  onClick = (_event: MouseEvent) => {};
}

describe('NgccButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
    fixture.whenStable?.();
  }

  function getButton() {
    return fixture.debugElement.query(By.css('button'));
  }

  describe('Core Functionality', () => {
    it('renders with role="button" and default type="button"', () => {
      detectChanges();
      const btn = getButton();
      expect(btn.nativeElement.tagName.toLowerCase()).toBe('button');
      expect(btn.nativeElement.type).toBe('button');
    });

    it('supports submit type', () => {
      host.type = 'submit';
      detectChanges();
      expect(getButton().nativeElement.type).toBe('submit');
    });

    it('supports reset type', () => {
      host.type = 'reset';
      detectChanges();
      expect(getButton().nativeElement.type).toBe('reset');
    });

    it('renders label correctly', () => {
      host.label = 'Action';
      detectChanges();
      const labelEl = fixture.debugElement.query(By.css('.cds--btn__label'));
      expect(labelEl.nativeElement.textContent.trim()).toBe('Action');
    });

    it('applies custom className', () => {
      host.className = 'my-custom-class';
      detectChanges();
      expect(getButton().nativeElement.classList).toContain('my-custom-class');
    });
  });

  describe('Enterprise States', () => {
    it('handles disabled state correctly', () => {
      host.disabled = true;
      detectChanges();
      const btn = getButton();
      const hostEl = fixture.debugElement.query(By.directive(NgccButton)).nativeElement;

      expect(btn.nativeElement.disabled).toBe(true);
      expect(btn.attributes['aria-disabled']).toBe('true');
      expect(hostEl.classList).toContain('disabled');
    });

    it('suppresses click events when disabled', () => {
      const clickSpy = vi.spyOn(host, 'onClick');
      host.disabled = true;
      detectChanges();
      getButton().nativeElement.click();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('handles skeleton state', () => {
      host.skeleton = true;
      detectChanges();
      const btn = getButton();
      expect(btn.nativeElement.classList).toContain('cds--skeleton');
      expect(fixture.debugElement.query(By.css('.cds--btn__label'))).toBeFalsy();
    });

    it('applies expressive styling', () => {
      host.expressive = true;
      detectChanges();
      expect(getButton().nativeElement.classList).toContain('cds--btn--expressive');
    });

    it('renders icons correctly', () => {
      host.iconName = 'add';
      detectChanges();
      const icon = fixture.debugElement.query(By.directive(NgccIcon));
      expect(icon).toBeTruthy();
      expect(icon.componentInstance.name).toBe('add');
    });

    it('handles icon-only mode', () => {
      host.iconName = 'add';
      host.iconOnly = true;
      host.ariaLabel = 'Add item';
      detectChanges();
      const btn = getButton();
      expect(btn.nativeElement.classList).toContain('cds--btn--icon-only');
      expect(fixture.debugElement.query(By.css('.cds--btn__label'))).toBeFalsy();
      expect(btn.attributes['aria-label']).toBe('Add item');
    });
  });

  describe('Variants & Sizes', () => {
    const variants = [
      'primary',
      'secondary',
      'tertiary',
      'ghost',
      'danger',
      'danger_tertiary',
      'danger_ghost',
    ];
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

    variants.forEach((v) => {
      it(`applies correct class for variant: ${v}`, () => {
        host.variant = v as any;
        detectChanges();
        const expectedClass = v.replace('_', '--');
        expect(getButton().nativeElement.classList).toContain(`cds--btn--${expectedClass}`);
      });
    });

    sizes.forEach((s) => {
      it(`applies correct class for size: ${s}`, () => {
        host.size = s as any;
        detectChanges();
        expect(getButton().nativeElement.classList).toContain(`cds--btn--${s}`);
        expect(getButton().nativeElement.classList).toContain(`cds--layout--size-${s}`);
      });
    });
  });

  describe('WCAG & Accessibility', () => {
    it('supports aria-expanded (true)', () => {
      host.ariaExpanded = true;
      detectChanges();
      expect(getButton().attributes['aria-expanded']).toBe('true');
    });

    it('supports aria-expanded (false)', () => {
      host.ariaExpanded = false;
      detectChanges();
      expect(getButton().attributes['aria-expanded']).toBe('false');
    });

    it('manages focus correctly', () => {
      detectChanges();
      const btn = getButton().nativeElement;
      btn.focus();
      expect(document.activeElement).toBe(btn);
      btn.blur();
      expect(document.activeElement).not.toBe(btn);
    });

    it('should have no accessibility violations', async () => {
      detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible name in icon-only mode', async () => {
      host.iconOnly = true;
      host.iconName = 'add';
      host.ariaLabel = 'Close';
      detectChanges();
      const results = await axe(getButton().nativeElement);
      expect(results).toHaveNoViolations();
    });
    it('activates on Enter key', () => {
      const clickSpy = vi.spyOn(host, 'onClick');
      detectChanges();
      const btn = getButton().nativeElement;
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(clickSpy).toHaveBeenCalled();
    });

    it('activates on Space key', () => {
      const clickSpy = vi.spyOn(host, 'onClick');
      detectChanges();
      const btn = getButton().nativeElement;
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not activate on other keys', () => {
      const clickSpy = vi.spyOn(host, 'onClick');
      detectChanges();
      const btn = getButton().nativeElement;
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('does not activate on Enter key when disabled', () => {
      const clickSpy = vi.spyOn(host, 'onClick');
      host.disabled = true;
      detectChanges();
      const btn = getButton().nativeElement;
      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('fails accessibility when icon-only has no aria-label', async () => {
      host.iconOnly = true;
      host.iconName = 'add';
      host.ariaLabel = undefined;

      detectChanges();
      const results = await axe(getButton().nativeElement);

      expect(results.violations.length).toBeGreaterThan(0);
    });
  });
});
