import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerProductFormComponent } from './seller-product-form.component';

describe('SellerProductFormComponent', () => {
  let component: SellerProductFormComponent;
  let fixture: ComponentFixture<SellerProductFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellerProductFormComponent]
    });
    fixture = TestBed.createComponent(SellerProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
