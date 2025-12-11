import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: any;
  let userDataSubject: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    userDataSubject = new BehaviorSubject(null);
    authServiceMock = {
      userData: userDataSubject,
      logOut: jasmine.createSpy('logOut')
    };

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: {} },
        { provide: NgxSpinnerService, useValue: { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should set isLogin to true when userData is not null', fakeAsync(() => {
    userDataSubject.next({}); // Simulate user data being present
    fixture.detectChanges();
    tick();
    expect(component.isLogin).toBeTrue();
  }));

  it('should set isLogin to false when userData is null', fakeAsync(() => {
    userDataSubject.next(null); // Simulate user data being absent
    fixture.detectChanges();
    tick();
    expect(component.isLogin).toBeFalse();
  }));
});
