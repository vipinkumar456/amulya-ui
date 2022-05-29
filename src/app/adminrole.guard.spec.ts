import { TestBed } from '@angular/core/testing';

import { AdminroleGuard } from './adminrole.guard';

describe('AdminroleGuard', () => {
  let guard: AdminroleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminroleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
