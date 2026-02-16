import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { NgccColorThemeSwitcher } from './ngcc-color-theme-switcher';
import { NgccColorThemeService } from './ngcc-color-theme.service';

@Component({
  standalone: true,
  imports: [NgccColorThemeSwitcher],
  template: `<ngcc-color-theme-switcher [defaultColor]="defaultColor" />`,
})
class TestHostComponent {
  defaultColor: string | undefined;
}

describe('NgccColorThemeSwitcher', () => {
  let fixture: ComponentFixture<NgccColorThemeSwitcher>;
  let component: NgccColorThemeSwitcher;
  let colorService: NgccColorThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccColorThemeSwitcher],
      providers: [provideZonelessChangeDetection(), NgccColorThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccColorThemeSwitcher);
    component = fixture.componentInstance;
    colorService = TestBed.inject(NgccColorThemeService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update primary color signal when user selects a color', () => {
    const newColor = '#ff0000';
    const input = fixture.debugElement.queryAll(By.css('input[type=color]'))[0].nativeElement;
    input.value = newColor;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(colorService.primaryColor()).toBe(newColor);
  });

  it('should reset theme overrides when Reset button clicked', () => {
    const resetSpy = vi.spyOn(colorService, 'resetOverrides');

    const resetButton = fixture.debugElement.query(
      By.css('button.cds--btn.cds--btn--ghost'),
    ).nativeElement;
    resetButton.click();
    fixture.detectChanges();

    expect(resetSpy).toHaveBeenCalled();
  });

  describe('defaultColor input', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let service: NgccColorThemeService;

    beforeEach(async () => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      service = TestBed.inject(NgccColorThemeService);
    });

    it('should set the brand color to the provided defaultColor', async () => {
      hostComponent.defaultColor = '#1e70cd';
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(service.brandColor()).toBe('#1e70cd');
    });

    it('should reset to the custom default color instead of hardcoded fallback', async () => {
      hostComponent.defaultColor = '#1e70cd';
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      // Change to a different color
      service.updateBrandColor('#ff0000');
      expect(service.brandColor()).toBe('#ff0000');

      // Reset should go back to the custom default
      service.resetOverrides();
      expect(service.brandColor()).toBe('#1e70cd');
    });
  });
});
