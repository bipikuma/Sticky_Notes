import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;
  let userDataSubject: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    userDataSubject = new BehaviorSubject(null);
    const authServiceMock = {
      userData: userDataSubject.asObservable(),
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
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should set isLogin to true when userData is not null', () => {
    try {
      userDataSubject.next({}); // Emit a non-null value
      fixture.detectChanges();
      expect(component.isLogin).toBeTruthy();
    } catch (error) {
      fail('Test failed with error: ' + error);
    }
  });

  it('should set isLogin to false when userData is null', () => {
    try {
      userDataSubject.next(null); // Emit a null value
      fixture.detectChanges();
      expect(component.isLogin).toBeFalsy();
    } catch (error) {
      fail('Test failed with error: ' + error);
    }
  });
});
