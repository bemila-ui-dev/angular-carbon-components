import { Component, provideZonelessChangeDetection, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgccModal } from './ngcc-modal';
import { axe } from 'vitest-axe';
import { NgccModalVariant, NgccModalSize } from './ngcc-modal.types';

@Component({
  standalone: true,
  imports: [NgccModal],
  template: `
    <button id="trigger" (click)="modal.openModal()">Open</button>
    <ngcc-modal
      [(open)]="open"
      [variant]="variant"
      [size]="size"
      [title]="title"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryDisabled]="primaryDisabled"
      [closeOnOverlayClick]="closeOnOverlayClick"
      (closed)="onClosed()"
      (submitted)="onSubmitted()"
      (secondaryClicked)="onSecondaryClicked()"
      #modal
    >
      <div class="content">Modal Content Body</div>
      <input id="modal-input" type="text" aria-label="Test Input" />
    </ngcc-modal>
  `,
})
class TestHostComponent {
  open = false;
  variant: NgccModalVariant = 'default';
  size: NgccModalSize = 'md';
  title = 'Test Modal';
  primaryLabel = 'Save';
  secondaryLabel = 'Cancel';
  primaryDisabled = false;
  closeOnOverlayClick = true;

  modal = viewChild.required(NgccModal);

  onClosed = vi.fn();
  onSubmitted = vi.fn();
  onSecondaryClicked = vi.fn();
}

describe('NgccModal', () => {
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
  }

  function getModal() {
    return fixture.debugElement.query(By.css('.cds--modal'));
  }

  function getModalContainer() {
    return fixture.debugElement.query(By.css('.cds--modal-container'));
  }

  describe('Core Functionality', () => {
    it('should not render anything when open is false', () => {
      host.open = false;
      detectChanges();
      expect(getModal()).toBeFalsy();
    });

    it('should render when open is true', () => {
      host.open = true;
      detectChanges();
      expect(getModal()).toBeTruthy();
      expect(getModal().nativeElement.classList).toContain('is-visible');
    });

    it('should display correct title and labels', () => {
      host.open = true;
      host.title = 'Custom Title';
      host.primaryLabel = 'Submit';
      host.secondaryLabel = 'Back';
      detectChanges();

      expect(
        fixture.debugElement
          .query(By.css('.cds--modal-header__heading'))
          .nativeElement.textContent.trim(),
      ).toBe('Custom Title');
      expect(
        fixture.debugElement.query(By.css('.cds--btn--primary')).nativeElement.textContent.trim(),
      ).toBe('Submit');
      expect(
        fixture.debugElement.query(By.css('.cds--btn--secondary')).nativeElement.textContent.trim(),
      ).toBe('Back');
    });

    it('should support closing via close button', () => {
      host.open = true;
      detectChanges();

      fixture.debugElement.query(By.css('.cds--modal-close-button')).nativeElement.click();
      detectChanges();

      expect(host.open).toBe(false);
      expect(host.onClosed).toHaveBeenCalled();
    });
  });

  describe('Enterprise States & Variants', () => {
    it('should apply size lg', () => {
      host.open = true;
      host.size = 'lg';
      detectChanges();
      expect(getModalContainer().nativeElement.classList).toContain('cds--modal-container--lg');
    });

    it('should apply size sm', () => {
      host.open = true;
      host.size = 'sm';
      detectChanges();
      expect(getModalContainer().nativeElement.classList).toContain('cds--modal-container--sm');
    });

    it('should handle danger variant', () => {
      host.open = true;
      host.variant = 'danger';
      detectChanges();
      expect(getModal().nativeElement.classList).toContain('cds--modal--danger');
      expect(fixture.debugElement.query(By.css('.cds--btn--danger'))).toBeTruthy();
    });

    it('should handle passive variant (no footer)', () => {
      host.open = true;
      host.variant = 'passive';
      detectChanges();
      expect(fixture.debugElement.query(By.css('.cds--modal-footer'))).toBeFalsy();
    });

    it('should respect primaryDisabled state', () => {
      host.open = true;
      host.primaryDisabled = true;
      detectChanges();
      const primaryBtn = fixture.debugElement.query(By.css('.cds--btn--primary')).nativeElement;
      expect(primaryBtn.disabled).toBe(true);

      primaryBtn.click();
      detectChanges();
      expect(host.onSubmitted).not.toHaveBeenCalled();
    });

    it('should handle overlay clicks', () => {
      host.open = true;
      detectChanges();
      getModal().nativeElement.click();
      detectChanges();
      expect(host.open).toBe(false);
    });

    it('should ignore overlay clicks when config is false', () => {
      host.open = true;
      host.closeOnOverlayClick = false;
      detectChanges();
      getModal().nativeElement.click();
      detectChanges();
      expect(host.open).toBe(true);
    });
  });

  describe('Programmatic API & Interactions', () => {
    it('should open via openModal() and restore focus after close', async () => {
      detectChanges();
      const trigger = document.getElementById('trigger') as HTMLElement;
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      host.modal().openModal();
      detectChanges();
      expect(host.open).toBe(true);

      host.modal().close();
      detectChanges();
      expect(host.open).toBe(false);
      // Wait for focus restoration
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(document.activeElement).toBe(trigger);
    });

    it('should close via close()', () => {
      host.open = true;
      detectChanges();
      host.modal().close();
      detectChanges();
      expect(host.open).toBe(false);
    });

    it('should emit submitted event on primary click', () => {
      host.open = true;
      detectChanges();
      fixture.debugElement.query(By.css('.cds--btn--primary')).nativeElement.click();
      expect(host.onSubmitted).toHaveBeenCalled();
      expect(host.open).toBe(false);
    });

    it('should emit secondaryClicked event on secondary click', () => {
      host.open = true;
      detectChanges();
      fixture.debugElement.query(By.css('.cds--btn--secondary')).nativeElement.click();
      expect(host.onSecondaryClicked).toHaveBeenCalled();
      expect(host.open).toBe(false);
    });
  });

  describe('WCAG & Accessibility', () => {
    it('should have correct ARIA roles and relationships', () => {
      host.open = true;
      detectChanges();
      const modal = getModal();
      expect(modal.attributes['role']).toBe('dialog');
      expect(modal.attributes['aria-modal']).toBe('true');

      const titleId = fixture.debugElement.query(By.css('.cds--modal-header__heading'))
        .nativeElement.id;
      expect(modal.attributes['aria-labelledby']).toBe(titleId);

      const closeBtn = fixture.debugElement.query(By.css('.cds--modal-close-button'));
      expect(closeBtn.attributes['aria-label']).toBe('Close');
    });

    it('should close on Escape key', () => {
      host.open = true;
      detectChanges();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      detectChanges();
      expect(host.open).toBe(false);
    });

    it('should trap focus (Tab forward)', () => {
      host.open = true;
      detectChanges();
      const modal = getModal();
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = modal.nativeElement.querySelectorAll(focusableSelector);
      const last = focusable[focusable.length - 1];
      const first = focusable[0];

      last.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      detectChanges();
      expect(document.activeElement).toBe(first);
    });

    it('should trap focus (Shift+Tab backward)', () => {
      host.open = true;
      detectChanges();
      const modal = getModal();
      const focusableSelector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = modal.nativeElement.querySelectorAll(focusableSelector);
      const last = focusable[focusable.length - 1];
      const first = focusable[0];

      first.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
      detectChanges();
      expect(document.activeElement).toBe(last);
    });

    it('should have no accessibility violations', async () => {
      host.open = true;
      detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should handle trapFocus when no focusable elements are present', () => {
      const modal = host.modal() as any;
      host.open = true;
      detectChanges();

      const modalContainer = getModalContainer().nativeElement;
      modalContainer.innerHTML = ''; // Nuclear option to ensure 0 focusables

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const spy = vi.spyOn(event, 'preventDefault');

      modal.trapFocus(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore Escape key when modal is closed', () => {
      host.open = false;
      detectChanges();
      const spy = vi.spyOn(host, 'onClosed');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore Tab key when modal is closed', () => {
      host.open = false;
      detectChanges();
      const modal = host.modal() as any;
      const spy = vi.spyOn(modal, 'trapFocus');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore Shift+Tab when not on the first element', () => {
      const modal = host.modal() as any;
      host.open = true;
      detectChanges();

      const modalEl = getModal().nativeElement;
      const focusable = modalEl.querySelectorAll('button, input');
      const last = focusable[focusable.length - 1];

      last.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      const spy = vi.spyOn(event, 'preventDefault');

      modal.trapFocus(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore Tab when not on the last element', () => {
      const modal = host.modal() as any;
      host.open = true;
      detectChanges();

      const modalEl = getModal().nativeElement;
      const first = modalEl.querySelectorAll('button, input')[0];

      first.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const spy = vi.spyOn(event, 'preventDefault');

      modal.trapFocus(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle trapFocus when modal element is missing', () => {
      const modal = host.modal() as any;
      // Force open to true but remove the element from DOM
      host.open = true;
      detectChanges();
      const modalEl = getModal().nativeElement;
      modalEl.remove();

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const spy = vi.spyOn(event, 'preventDefault');

      modal.trapFocus(event);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
