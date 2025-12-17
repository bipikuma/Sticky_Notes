import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

class MockAuthService {
  userData = { getValue: () => null } as any;
  signIn = jasmine.createSpy('signIn');
  saveUserData = jasmine.createSpy('saveUserData');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
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
  let authService: MockAuthService;
  let router: MockRouter;
  let spinner: MockSpinnerService;
  let toastr: MockToastrService;

  // Mock global $ to avoid jQuery errors
  beforeAll(() => {
    (window as any).$ = () => ({ particleground: () => {} });
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: NgxSpinnerService, useClass: MockSpinnerService },
        { provide: ToastrService, useClass: MockToastrService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    spinner = TestBed.inject(NgxSpinnerService) as any;
    toastr = TestBed.inject(ToastrService) as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset all spies to avoid cross‑test interference
    (authService.signIn as jasmine.Spy).calls.reset();
    (authService.saveUserData as jasmine.Spy).calls.reset();
    (router.navigate as jasmine.Spy).calls.reset();
    (spinner.show as jasmine.Spy).calls.reset();
    (spinner.hide as jasmine.Spy).calls.reset();
    (toastr.success as jasmine.Spy).calls.reset();
    (toastr.error as jasmine.Spy).calls.reset();
    // Clean localStorage modifications
    localStorage.removeItem('userToken');
  });

  it('should create the component', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should navigate to profile if user token exists on init', () => {
    try {
      // Simulate token present by mocking userData.getValue()
      (authService.userData as any).getValue = () => ({ token: 'abc' });
      // Recreate component to trigger constructor logic
      const newFixture = TestBed.createComponent(LoginComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    } catch (e) {
      fail(e);
    }
  });

  it('should call AuthService.signIn on valid form and handle success response', fakeAsync(() => {
    try {
      const response = { message: 'success', token: 'jwt-token' };
      authService.signIn.and.returnValue(of(response));
      component.loginForm.setValue({ email: 'test@example.com', password: '12345' });
      component.submitLoginForm(component.loginForm);
      expect(spinner.show).toHaveBeenCalled();
      tick(); // resolve observable
      expect(authService.signIn).toHaveBeenCalledWith(component.loginForm.value);
      expect(localStorage.getItem('userToken')).toBe('jwt-token');
      expect(authService.saveUserData).toHaveBeenCalled();
      expect(toastr.success).toHaveBeenCalledWith('Success');
      expect(router.navigate).toHaveBeenCalledWith(['./profile']);
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('should handle error response from signIn and display error message', fakeAsync(() => {
    try {
      const response = { message: 'Invalid credentials' };
      authService.signIn.and.returnValue(of(response));
      component.loginForm.setValue({ email: 'test@example.com', password: '12345' });
      component.submitLoginForm(component.loginForm);
      expect(spinner.show).toHaveBeenCalled();
      tick();
      expect(toastr.error).toHaveBeenCalledWith('Invalid credentials', 'Failed');
      expect(component.error).toBe('Invalid credentials');
      tick(2000);
      expect(component.error).toBe('');
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('should reset form after submission', () => {
    try {
      component.loginForm.setValue({ email: 'a@b.c', password: '12345' });
      component.submitLoginForm(component.loginForm);
      expect(component.loginForm.pristine).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });
});
