import { TestBed } from '@angular/core/testing';

import { ShoppingFormService } from './shopping-form.service';

describe('ShoppingFormService', () => {
  let service: ShoppingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
