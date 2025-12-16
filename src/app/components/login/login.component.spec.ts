import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

class MockAuthService {
  userData = new BehaviorSubject<any>(null);
  signIn = jasmine.createSpy('signIn');
  saveUserData = jasmine.createSpy('saveUserData');
}

class MockSpinnerService {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

class MockToastrService {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuth: MockAuthService;
  let router: Router;
  let spinner: MockSpinnerService;
  let toastr: MockToastrService;

  const setupTestBed = (userValue: any) => {
    mockAuth = new MockAuthService();
    mockAuth.userData.next(userValue);
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, FormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuth },
        { provide: NgxSpinnerService, useClass: MockSpinnerService },
        { provide: ToastrService, useClass: MockToastrService },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spinner = TestBed.inject(NgxSpinnerService) as unknown as MockSpinnerService;
    toastr = TestBed.inject(ToastrService) as unknown as MockToastrService;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    // clean up global $ if it was set
    if ((window as any).$) {
      delete (window as any).$;
    }
    // clear localStorage
    localStorage.clear();
  });

  describe('constructor navigation', () => {
    it('should navigate to /profile when userData is not null', () => {
      setupTestBed({ id: 1, name: 'Test' });
      expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    });

    it('should not navigate when userData is null', () => {
      setupTestBed(null);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should have services instantiated', () => {
      setupTestBed(null);
      expect(mockAuth).toBeTruthy();
      expect(router).toBeTruthy();
      expect(spinner).toBeTruthy();
      expect(toastr).toBeTruthy();
    });
  });

  describe('submitLoginForm', () => {
    beforeEach(() => {
      setupTestBed(null);
    });

    it('should handle valid form submission - success path', fakeAsync(() => {
      try {
        // arrange
        component.loginForm.setValue({ email: 'test@example.com', password: 'validPass' });
        const response = { message: 'success', token: 'abc123' };
        mockAuth.signIn.and.returnValue(of(response));
        spyOn(localStorage, 'setItem');
        // act
        component.submitLoginForm(component.loginForm);
        // spinner should be shown immediately
        expect(spinner.show).toHaveBeenCalled();
        // subscription runs synchronously
        expect(mockAuth.signIn).toHaveBeenCalledWith(component.loginForm.value);
        // success actions
        expect(localStorage.setItem).toHaveBeenCalledWith('userToken', response.token);
        expect(mockAuth.saveUserData).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalledWith('Success');
        expect(router.navigate).toHaveBeenCalledWith(['./profile']);
        // advance time for spinner hide
        tick(1000);
        expect(spinner.hide).toHaveBeenCalled();
        // form should be reset
        expect(component.loginForm.pristine).toBeTrue();
      } catch (e) {
        fail(e);
      }
    }));

    it('should handle valid form submission - error path', fakeAsync(() => {
      try {
        component.loginForm.setValue({ email: 'test@example.com', password: 'validPass' });
        const errorResponse = { message: 'Invalid credentials' };
        mockAuth.signIn.and.returnValue(of(errorResponse));
        // act
        component.submitLoginForm(component.loginForm);
        expect(spinner.show).toHaveBeenCalled();
        expect(mockAuth.signIn).toHaveBeenCalledWith(component.loginForm.value);
        // error handling
        expect(toastr.error).toHaveBeenCalledWith(errorResponse.message, 'Failed');
        expect(component.error).toBe(errorResponse.message);
        // error cleared after 2 seconds
        tick(2000);
        expect(component.error).toBe('');
        // spinner hide after 1 second
        tick(1000);
        expect(spinner.hide).toHaveBeenCalled();
        // form reset
        expect(component.loginForm.pristine).toBeTrue();
      } catch (e) {
        fail(e);
      }
    }));

    it('should handle invalid form submission', fakeAsync(() => {
      try {
        // leave form empty -> invalid
        spyOn(console, 'log');
        component.submitLoginForm(component.loginForm);
        expect(spinner.show).toHaveBeenCalled();
        expect(mockAuth.signIn).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('notvalid');
        // spinner hide after 1 second
        tick(1000);
        expect(spinner.hide).toHaveBeenCalled();
        expect(component.loginForm.pristine).toBeTrue();
      } catch (e) {
        fail(e);
      }
    }));
  });

  describe('ngOnInit', () => {
    it('should call particleground on #signin element', () => {
      // mock global $
      const particlegroundSpy = jasmine.createSpy('particleground');
      (window as any).$ = jasmine.createSpy('$').and.callFake(() => {
        return { particleground: particlegroundSpy };
      });
      setupTestBed(null);
      // ngOnInit is called automatically during component init
      expect((window as any).$).toHaveBeenCalledWith('#signin');
      expect(particlegroundSpy).toHaveBeenCalledTimes(1);
    });

    it('should not throw when $ is undefined', () => {
      // ensure $ is undefined
      if ((window as any).$) {
        delete (window as any).$;
      }
      expect(() => {
        setupTestBed(null);
      }).not.toThrow();
    });
  });
});
