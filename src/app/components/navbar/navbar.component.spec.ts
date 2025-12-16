import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSpinner: any;

  beforeEach(() => {
    // Mock AuthService with a BehaviorSubject for userData
    mockAuthService = {
      userData: new BehaviorSubject<any>(null),
      logOut: jasmine.createSpy('logOut')
    };
    // Mock Router (no methods needed for this component)
    mockRouter = {};
    // Mock NgxSpinnerService
    mockSpinner = {
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide')
    };

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    // Trigger ngOnInit manually
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset spies after each test
    mockAuthService.logOut.calls.reset();
    mockSpinner.show.calls.reset();
    mockSpinner.hide.calls.reset();
  });

  it('should create the component', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should set isLogin to true when AuthService emits a non‑null user', () => {
    try {
      // Emit a dummy user object
      mockAuthService.userData.next({ id: 1, name: 'Test User' });
      fixture.detectChanges();
      expect(component.isLogin).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should set isLogin to false when AuthService emits null', () => {
    try {
      // Ensure null is emitted
      mockAuthService.userData.next(null);
      fixture.detectChanges();
      expect(component.isLogin).toBeFalsy();
    } catch (e) {
      fail(e);
    }
  });

  it('should call spinner.show, AuthService.logOut and spinner.hide after logOut', fakeAsync(() => {
    try {
      component.logOut();
      // spinner.show should be called immediately
      expect(mockSpinner.show).toHaveBeenCalledTimes(1);
      // AuthService.logOut should be called immediately
      expect(mockAuthService.logOut).toHaveBeenCalledTimes(1);
      // spinner.hide should not be called yet
      expect(mockSpinner.hide).not.toHaveBeenCalled();

      // Fast‑forward 500ms
      tick(500);
      // Now spinner.hide should have been called
      expect(mockSpinner.hide).toHaveBeenCalledTimes(1);
    } catch (e) {
      fail(e);
    }
  }));
});
