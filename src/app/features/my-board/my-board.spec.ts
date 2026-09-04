import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBoard } from './my-board';

describe('MyBoard', () => {
  let component: MyBoard;
  let fixture: ComponentFixture<MyBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
