import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsBannerComponent } from './notifications-banner.component';

describe('NotificationsBannerComponent', () => {
  let component: NotificationsBannerComponent;
  let fixture: ComponentFixture<NotificationsBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsBannerComponent]
    });
    fixture = TestBed.createComponent(NotificationsBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
