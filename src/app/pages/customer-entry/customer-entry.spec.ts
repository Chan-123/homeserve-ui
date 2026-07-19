import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEntry } from './customer-entry';

describe('CustomerEntry', () => {
  let component: CustomerEntry;
  let fixture: ComponentFixture<CustomerEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
