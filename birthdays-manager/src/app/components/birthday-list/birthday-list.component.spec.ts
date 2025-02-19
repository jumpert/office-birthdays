import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthdayListComponent } from './birthday-list.component';

describe('BirthdayListComponent', () => {
  let component: BirthdayListComponent;
  let fixture: ComponentFixture<BirthdayListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthdayListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthdayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
