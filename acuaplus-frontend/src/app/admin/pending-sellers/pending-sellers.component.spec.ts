import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSellersComponent } from './pending-sellers.component';

describe('PendingSellersComponent', () => {
  let component: PendingSellersComponent;
  let fixture: ComponentFixture<PendingSellersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingSellersComponent]
    });
    fixture = TestBed.createComponent(PendingSellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
