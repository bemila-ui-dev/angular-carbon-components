import { Component, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { NgccTooltip } from './ngcc-tooltip';

describe('NgccTooltip', () => {
  let fixture: ComponentFixture<NgccTooltip>;
  let component: NgccTooltip;

  const getTrigger = () => fixture.debugElement.query(By.css('span[tabindex="0"]'));

  const getTooltip = () => fixture.debugElement.query(By.css('.cds--popover-content'));

  const openTooltip = () => {
    const trigger = getTrigger();
    trigger.triggerEventHandler('mouseenter');
    vi.advanceTimersByTime(component.enterDelayMs);
    fixture.detectChanges();
  };

  const mockViewport = (width = 1000, height = 1000) => {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    mockViewport();

    await TestBed.configureTestingModule({
      imports: [NgccTooltip],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccTooltip);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('description', 'Tooltip text');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    fixture.destroy();
  });

  /* ---------------------------
   * Basic Behavior
   * --------------------------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render tooltip initially', () => {
    expect(getTooltip()).toBeNull();
    expect(component.isOpen()).toBe(false);
  });

  it('should open tooltip on mouseenter after delay', () => {
    openTooltip();

    const tooltip = getTooltip();
    expect(tooltip).not.toBeNull();
    expect(tooltip.nativeElement.textContent.trim()).toBe('Tooltip text');
    expect(component.isOpen()).toBe(true);
  });

  it('should close tooltip on mouseleave after delay', () => {
    openTooltip();

    const trigger = getTrigger();
    trigger.triggerEventHandler('mouseleave');
    vi.advanceTimersByTime(component.leaveDelayMs);
    fixture.detectChanges();

    expect(getTooltip()).toBeNull();
    expect(component.isOpen()).toBe(false);
  });

  it('should support controlled open input (true)', async () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getTooltip()).not.toBeNull();
    expect(component.isOpen()).toBe(true);
  });

  it('should not open when open input is explicitly false', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    openTooltip();

    expect(getTooltip()).toBeNull();
    expect(component.isOpen()).toBe(false);
  });

  it('should close on Escape key press when uncontrolled', async () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = getTrigger();
    trigger.nativeElement.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(getTooltip()).toBeNull();
  });

  it('should not open tooltip if description is empty', async () => {
    fixture.componentRef.setInput('description', '');
    fixture.detectChanges();
    await fixture.whenStable();

    openTooltip();

    expect(getTooltip()).toBeNull();
    expect(component.isOpen()).toBe(false);
  });

  it('should show tooltip on focus and hide on blur (uncontrolled)', async () => {
    const trigger = getTrigger();

    trigger.nativeElement.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getTooltip()).not.toBeNull();
    expect(component.isOpen()).toBe(true);

    trigger.nativeElement.dispatchEvent(new Event('focusout'));
    fixture.detectChanges();

    expect(getTooltip()).toBeNull();
    expect(component.isOpen()).toBe(false);
  });

  it('should respect placement input and update host class', async () => {
    fixture.componentRef.setInput('placement', 'bottom');
    fixture.detectChanges();
    await fixture.whenStable();

    openTooltip();

    const host = fixture.debugElement.nativeElement as HTMLElement;
    expect(component.new_placement()).toBe('bottom');
    expect(host.className).toContain(`cds--popover--bottom`);
  });

  it('should update tooltip content when description changes while open', async () => {
    fixture.componentRef.setInput('description', 'First');
    fixture.detectChanges();
    await fixture.whenStable();

    openTooltip();
    let tooltip = getTooltip();
    expect(tooltip.nativeElement.textContent.trim()).toBe('First');

    fixture.componentRef.setInput('description', 'Updated');
    fixture.detectChanges();
    await fixture.whenStable();

    tooltip = getTooltip();
    expect(tooltip.nativeElement.textContent.trim()).toBe('Updated');
  });

  it('should clean up tooltip safely on destroy', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });

  /* ---------------------------
   * Auto-align & Placement Logic
   * --------------------------- */

  it('should reset new_placement to placement when autoAlign is false', async () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'left');
    fixture.detectChanges();
    await fixture.whenStable();

    component.new_placement.set('right');
    fixture.detectChanges();

    fixture.componentRef.setInput('autoAlign', false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.new_placement()).toBe('left');
  });

  it('should call updateAutoPlacement when open and autoAlign enabled', async () => {
    fixture.componentRef.setInput('autoAlign', true);
    component.isOpen.set(true);
    fixture.detectChanges();

    const spy = vi.spyOn(component as any, 'updateAutoPlacement');

    (component as any).updateAutoPlacementBound();
    vi.runAllTimers();
    await Promise.resolve();

    expect(spy).toHaveBeenCalled();
  });

  it('should safely return when trigger or tooltip element is missing', () => {
    (component as any).trigger = undefined;
    (component as any).tooltipRef = undefined;

    const prevPlacement = component.new_placement();

    expect(() => (component as any).updateAutoPlacement()).not.toThrow();
    expect(component.new_placement()).toBe(prevPlacement);
  });

  it('should lookup trigger and tooltip from DOM when ViewChild refs are missing', () => {
    const host = fixture.debugElement.nativeElement as HTMLElement;

    const trigger = document.createElement('span');
    trigger.setAttribute('data-ngcc-trigger', '');
    host.appendChild(trigger);

    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);

    (component as any).trigger = undefined;
    (component as any).tooltipRef = undefined;

    const result = (component as any).lookupElements();

    expect(result.triggerEl).toBe(trigger);
    expect(result.tooltipEl).toBe(tooltip);

    document.body.removeChild(tooltip);
  });

  it('should not update new_placement if finalPlacement equals current new_placement', () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.new_placement.set('top');
    component.isOpen.set(true);
    fixture.detectChanges();

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      bottom: 320,
      left: 100,
      right: 120,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 50,
      height: 100,
      top: 0,
      bottom: 100,
      left: 0,
      right: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    const setSpy = vi.spyOn(component.new_placement, 'set');

    (component as any).updateAutoPlacement();

    expect(setSpy).not.toHaveBeenCalled();

    document.body.removeChild(tooltip);
  });

  it('should choose left placement when only left fits', () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    mockViewport(400, 200);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 30,
      left: 300,
      right: 320,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 250,
      height: 500,
      top: 0,
      bottom: 500,
      left: 0,
      right: 250,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('left');

    document.body.removeChild(tooltip);
  });

  it('should choose right placement when only right fits', () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    mockViewport(400, 200);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 30,
      left: 10,
      right: 30,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 250,
      height: 500,
      top: 0,
      bottom: 500,
      left: 0,
      right: 250,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('right');

    document.body.removeChild(tooltip);
  });

  it('should choose bottom placement when top does not fit but bottom does', () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    mockViewport(400, 400);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 30,
      left: 100,
      right: 120,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 50,
      height: 40,
      top: 0,
      bottom: 40,
      left: 0,
      right: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('bottom');

    document.body.removeChild(tooltip);
  });

  it('should choose top placement when only top fits', () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'bottom');
    component.isOpen.set(true);
    fixture.detectChanges();

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    mockViewport(400, 400);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 320,
      left: 5,
      right: 25,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 500,
      height: 180,
      top: 0,
      bottom: 180,
      left: 0,
      right: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('top');

    document.body.removeChild(tooltip);
  });

  it('should keep preferred placement if it fits', async () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    mockViewport(1000, 1000);

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      bottom: 350,
      left: 200,
      right: 250,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 80,
      top: 0,
      bottom: 80,
      left: 0,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('top');

    document.body.removeChild(tooltip);
  });

  it('should fallback to opposite placement when preferred does not fit', async () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    mockViewport(400, 400);

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 60,
      left: 200,
      right: 250,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 80,
      top: 0,
      bottom: 80,
      left: 0,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(component.new_placement()).toBe('bottom');

    document.body.removeChild(tooltip);
  });

  it('should fallback to left or right when vertical placements do not fit', async () => {
    fixture.componentRef.setInput('autoAlign', true);
    fixture.componentRef.setInput('placement', 'top');
    component.isOpen.set(true);
    fixture.detectChanges();

    mockViewport(1000, 300);

    const trigger = component.trigger.nativeElement;
    const tooltip = document.createElement('div');
    tooltip.id = component.tooltipId();
    document.body.appendChild(tooltip);
    (component as any).tooltipRef = new ElementRef(tooltip);

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 60,
      left: 300,
      right: 350,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 300,
      top: 0,
      bottom: 300,
      left: 0,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    (component as any).updateAutoPlacement();

    expect(['left', 'right']).toContain(component.new_placement());

    document.body.removeChild(tooltip);
  });

  /* ---------------------------
   * Focus & Controlled State
   * --------------------------- */

  it('should close tooltip on focus out when uncontrolled', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    component.onFocusOut();

    expect(component.isOpen()).toBe(false);
  });

  /* ---------------------------
   * Template Handling
   * --------------------------- */

  it('should return TemplateRef when description is a template', async () => {
    @Component({
      standalone: true,
      template: `<ng-template #tpl>Tooltip content</ng-template>`,
    })
    class HostComponent {
      @ViewChild('tpl', { static: true }) tpl!: TemplateRef<unknown>;
    }

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    fixture.componentRef.setInput('description', hostFixture.componentInstance.tpl);
    fixture.detectChanges();

    const result = component.descriptionTemplate();
    expect(result).toBe(hostFixture.componentInstance.tpl);
  });

  it('should return null when description is a string', () => {
    fixture.componentRef.setInput('description', 'Tooltip text');
    fixture.detectChanges();

    const result = component.descriptionTemplate();
    expect(result).toBeNull();
  });

  /* ---------------------------
   * Accessibility (WCAG)
   * --------------------------- */

  describe('WCAG Accessibility', () => {
    const runAxe = async () => {
      vi.useRealTimers();
      const results = await axe(fixture.nativeElement);
      vi.useFakeTimers();
      return results;
    };

    it('should have no accessibility violations when closed', async () => {
      const results = await runAxe();
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const results = await runAxe();
      expect(results).toHaveNoViolations();
    });

    it('should have role="tooltip" on tooltip element when open', async () => {
      component.isOpen.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const tooltip = fixture.debugElement.query(By.css('[role="tooltip"]'));
      expect(tooltip).not.toBeNull();
    });

    it('should link trigger to tooltip using aria-describedby when open', () => {
      openTooltip();

      const trigger = getTrigger();
      const ariaDescribedBy = trigger.nativeElement.getAttribute('aria-describedby');
      const tooltip = fixture.debugElement.query(By.css(`#${ariaDescribedBy}`));

      expect(ariaDescribedBy).toBeTruthy();
      expect(tooltip).not.toBeNull();
    });

    it('should remove aria-describedby when tooltip is closed', () => {
      openTooltip();

      const trigger = getTrigger();
      expect(trigger.nativeElement.getAttribute('aria-describedby')).toBeTruthy();

      trigger.triggerEventHandler('mouseleave');
      vi.advanceTimersByTime(component.leaveDelayMs);
      fixture.detectChanges();

      expect(trigger.nativeElement.getAttribute('aria-describedby')).toBeNull();
    });

    it('should have tabindex="0" on trigger for keyboard focus', () => {
      const trigger = getTrigger();
      expect(trigger.nativeElement.getAttribute('tabindex')).toBe('0');
    });
  });
});
