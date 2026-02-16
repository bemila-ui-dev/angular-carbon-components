import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgccIcon } from './ngcc-icon';
import { axe } from 'vitest-axe';
import { NgccIconNameType } from './icons';
import { IconSize } from './ngcc-icon.types';

@Component({
  standalone: true,
  imports: [NgccIcon],
  template: `
    <ngcc-icon
      [name]="iconName"
      [size]="iconSize"
      [color]="iconColor"
      [ariaLabel]="iconAriaLabel"
      [svgClass]="iconSvgClass"
      [decorative]="isDecorative"
      [class]="hostClass"
    ></ngcc-icon>
  `,
})
class TestHostComponent {
  iconName: NgccIconNameType = 'add';
  iconSize: IconSize = 'md';
  iconColor = 'currentColor';
  iconAriaLabel: string | null = null;
  iconSvgClass: string | null = null;
  hostClass: string | null = null;
  isDecorative = false;
}

describe('NgccIcon', () => {
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

  function getSvg() {
    return fixture.debugElement.query(By.css('svg'));
  }

  describe('Core Functionality', () => {
    it('should render an svg for a valid icon name', () => {
      host.iconName = 'add';
      detectChanges();
      const svg = getSvg();
      expect(svg).toBeTruthy();
      expect(svg.nativeElement.innerHTML).toContain('<path');
    });

    it('should log a warning for an invalid icon name', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.iconName = 'non-existent-icon' as unknown as NgccIconNameType;
      detectChanges();
      expect(spy).toHaveBeenCalledWith('[NgccIcon] Icon "non-existent-icon" not found in ICONS.');
      expect(getSvg()).toBeFalsy();
      spy.mockRestore();
    });

    it('should render correct paths for the close icon', () => {
      host.iconName = 'close';
      detectChanges();
      expect(getSvg().nativeElement.innerHTML).toContain('M17.4141 16');
    });
  });

  describe('Enterprise Features (Styling & Sizing)', () => {
    it('should apply size sm', () => {
      host.iconSize = 'sm';
      detectChanges();
      expect(getSvg().nativeElement.style.width).toBe('1rem');
    });

    it('should apply size md', () => {
      host.iconSize = 'md';
      detectChanges();
      expect(getSvg().nativeElement.style.width).toBe('1.25rem');
    });

    it('should apply size lg', () => {
      host.iconSize = 'lg';
      detectChanges();
      expect(getSvg().nativeElement.style.width).toBe('1.5rem');
    });

    it('should apply size xl', () => {
      host.iconSize = 'xl';
      detectChanges();
      expect(getSvg().nativeElement.style.width).toBe('1.9rem');
    });

    it('should support custom numeric sizes (in rem)', () => {
      host.iconSize = 3;
      detectChanges();
      const svg = getSvg().nativeElement;
      expect(svg.style.width).toBe('3rem');
      expect(svg.style.height).toBe('3rem');
    });

    it('should apply custom fill colors (hex)', () => {
      host.iconColor = '#ff0000';
      detectChanges();
      const svg = getSvg().nativeElement;
      // Depending on JSDOM version, it might return hex or RGB.
      // We check for both for robustness or just use toContain if it holds the value.
      expect(svg.style.fill).toMatch(/#ff0000|rgb\(255, 0, 0\)/);
    });

    it('should merge svgClass with default Carbon classes', () => {
      host.iconSvgClass = 'custom-icon-class';
      detectChanges();
      const svg = getSvg().nativeElement;
      expect(svg.classList).toContain('cds--btn__icon');
      expect(svg.classList).toContain('ngcc_icon');
      expect(svg.classList).toContain('custom-icon-class');
    });

    it('should respect host attribute classes', () => {
      host.hostClass = 'top-level-class';
      detectChanges();
      const hostEl = fixture.debugElement.query(By.css('ngcc-icon')).nativeElement;
      expect(hostEl.classList).toContain('top-level-class');
    });
  });

  describe('WCAG & Accessibility', () => {
    it('should humanize icon names (chevron_down -> Chevron Down)', () => {
      host.iconName = 'chevron_down';
      detectChanges();
      expect(getSvg().attributes['aria-label']).toBe('Chevron Down');
    });

    it('should humanize icon names (arrow_up -> Arrow Up)', () => {
      host.iconName = 'arrow_up';
      detectChanges();
      expect(getSvg().attributes['aria-label']).toBe('Arrow Up');
    });

    it('should use explicit aria-label when provided', () => {
      host.iconAriaLabel = 'Expand section';
      detectChanges();
      expect(getSvg().attributes['aria-label']).toBe('Expand section');
    });

    it('should handle decorative icons (hide from AT)', () => {
      host.isDecorative = true;
      host.iconAriaLabel = 'Should be ignored';
      detectChanges();

      const svg = getSvg();
      expect(svg.attributes['aria-hidden']).toBe('true');
      expect(svg.attributes['aria-label']).toBeFalsy();
      expect(svg.attributes['role']).toBe('img');
    });

    it('should have no accessibility violations in standard mode', async () => {
      host.iconName = 'add';
      detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in decorative mode', async () => {
      host.iconName = 'add';
      host.isDecorative = true;
      detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Case Coverage', () => {
    it('should fallback to md size for invalid string size', () => {
      host.iconSize = 'invalid' as any;
      detectChanges();
      expect(getSvg().nativeElement.style.width).toBe('1.25rem');
    });

    it('should handle undefined name gracefully', () => {
      host.iconName = undefined as any;
      detectChanges();
      expect(getSvg()).toBeFalsy();
    });

    it('should return empty string for effectiveAriaLabel when name is undefined', () => {
      const icon = fixture.debugElement.query(By.directive(NgccIcon)).componentInstance as NgccIcon;
      host.iconName = undefined as any;
      detectChanges();
      expect(icon.effectiveAriaLabel()).toBeNull();
    });

    it('should return null for svg when name is undefined', () => {
      const icon = fixture.debugElement.query(By.directive(NgccIcon)).componentInstance as NgccIcon;
      host.iconName = undefined as any;
      detectChanges();
      expect(icon.svg()).toBe(null);
    });

    it('should use default viewBox for empty name', () => {
      const icon = fixture.debugElement.query(By.directive(NgccIcon)).componentInstance as NgccIcon;
      host.iconName = '' as any;
      detectChanges();
      expect(icon.viewBox()).toBe('0 0 16 16');
    });
  });
});
