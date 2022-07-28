import { TestBed } from '@angular/core/testing';

import { AsyncUsernameValidatorService } from './async-username-validator.service';

describe('AsyncUsernameValidatorService', () => {
  let service: AsyncUsernameValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsyncUsernameValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
