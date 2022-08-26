import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawCardComponent } from './withdraw-card.component';

describe('WithdrawCardComponent', () => {
  let component: WithdrawCardComponent;
  let fixture: ComponentFixture<WithdrawCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WithdrawCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
