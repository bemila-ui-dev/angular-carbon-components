import { TestBed } from '@angular/core/testing';
import { NgccColorThemeService } from './ngcc-color-theme.service';

describe('NgccColorThemeService', () => {
  let service: NgccColorThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgccColorThemeService],
    });
    service = TestBed.inject(NgccColorThemeService);
    // clean up any previous styles
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-carbon-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-carbon-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
