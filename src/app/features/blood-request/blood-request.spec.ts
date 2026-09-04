import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodRequest } from './blood-request';

describe('BloodRequest', () => {
  let component: BloodRequest;
  let fixture: ComponentFixture<BloodRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
