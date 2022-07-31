import { TestBed } from '@angular/core/testing';

import { AppOptionsService } from './app-options.service';

describe('AppOptionsService', () => {
  let service: AppOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
