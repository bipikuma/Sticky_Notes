// Auto‑generated unit tests for LoginComponent, NavbarComponent and RegisterComponent
// ------------------------------------------------------------
import { TestBed, ComponentFixture, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RegisterComponent } from './register/register.component';

// ----- Mock Services ------------------------------------------------
class AuthServiceMock {
  // BehaviorSubject like userData
  private _value: any = null;
  userData = {
    getValue: () => this._value,
    subscribe: (fn: any) => {
      // simple immediate call for test purposes
      fn(this._value);
      return { unsubscribe: () => {} };
    },
    next: (val: any) => { this._value = val; },
  };
  signIn = jasmine.createSpy('signIn');
  signUp = jasmine.createSpy('signUp');
  saveUserData = jasmine.createSpy('saveUserData');
  logOut = jasmine.createSpy('logOut');
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class SpinnerMock {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

class ToastrMock {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthServiceMock;
  let router: RouterMock;
  let spinner: SpinnerMock;
  let toastr: ToastrMock;

  beforeEach(waitForAsync(() => {
    authService = new AuthServiceMock();
    router = new RouterMock();
    spinner = new SpinnerMock();
    toastr = new ToastrMock();

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: 'AuthService', useValue: authService },
        { provide: Router, useValue: router },
        { provide: NgxSpinnerService, useValue: spinner },
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // replace injection tokens with our mocks
    TestBed.overrideProvider(AuthServiceMock, { useValue: authService });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    // mock global $
    (window as any).$ = jasmine.createSpy('jQuery').and.returnValue({
      particleground: jasmine.createSpy('particleground'),
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    // clean up global $
    delete (window as any).$;
  });

  it('should navigate to /profile when AuthService.userData is not null (constructor)', () => {
    try {
      authService.userData.next({ id: 1 });
      // recreate component to trigger constructor logic
      const newFixture = TestBed.createComponent(LoginComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    } catch (e) {
      fail(e);
    }
  });

  it('should not navigate when AuthService.userData is null (constructor)', () => {
    try {
      authService.userData.next(null);
      const newFixture = TestBed.createComponent(LoginComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).not.toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });

  it('should call spinner.show at start of submitLoginForm', () => {
    try {
      component.submitLoginForm(component.loginForm);
      expect(spinner.show).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });

  it('should handle valid form success response', fakeAsync(() => {
    try {
      const mockResponse = { message: 'success', token: 'abc123' };
      authService.signIn.and.returnValue(of(mockResponse));
      // set valid values
      component.loginForm.setValue({ email: 'test@example.com', password: '12345' });
      component.submitLoginForm(component.loginForm);
      tick(); // resolve observable
      expect(localStorage.getItem('userToken')).toBeNull(); // ensure not pre‑set
      // spy on localStorage.setItem
      spyOn(localStorage, 'setItem');
      // re‑trigger to capture setItem call
      component.submitLoginForm(component.loginForm);
      tick();
      expect(localStorage.setItem).toHaveBeenCalledWith('userToken', 'abc123');
      expect(authService.saveUserData).toHaveBeenCalled();
      expect(toastr.success).toHaveBeenCalledWith('Success');
      expect(router.navigate).toHaveBeenCalledWith(['./profile']);
      // spinner hide after 1s
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
      // form reset
      expect(component.loginForm.value).toEqual({ email: null, password: null });
    } catch (e) {
      fail(e);
    }
  }));

  it('should handle valid form failure response and clear error after 2s', fakeAsync(() => {
    try {
      const mockResponse = { message: 'Invalid credentials' };
      authService.signIn.and.returnValue(of(mockResponse));
      component.loginForm.setValue({ email: 'bad@example.com', password: '12345' });
      component.submitLoginForm(component.loginForm);
      tick(); // observable resolves
      expect(toastr.error).toHaveBeenCalledWith('Invalid credentials', 'Failed');
      expect(component.error).toBe('Invalid credentials');
      tick(2000);
      expect(component.error).toBe('');
      // spinner hide after 1s
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('should not call AuthService.signIn when form is invalid and log "notvalid"', () => {
    try {
      spyOn(console, 'log');
      component.loginForm.setValue({ email: '', password: '' }); // invalid
      component.submitLoginForm(component.loginForm);
      expect(authService.signIn).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('notvalid');
    } catch (e) {
      fail(e);
    }
  });

  it('ngOnInit should call jQuery particleground once', () => {
    try {
      const mockPart = jasmine.createSpy('particleground');
      (window as any).$ = jasmine.createSpy('jQuery').and.returnValue({ particleground: mockPart });
      component.ngOnInit();
      expect((window as any).$).toHaveBeenCalledWith('#signin');
      expect(mockPart).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });

  it('ngOnInit should not throw when $ is undefined', () => {
    try {
      delete (window as any).$;
      expect(() => component.ngOnInit()).not.toThrow();
    } catch (e) {
      fail(e);
    }
  });
});

// ------------------------------------------------------------

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthServiceMock;
  let router: RouterMock;
  let spinner: SpinnerMock;

  beforeEach(waitForAsync(() => {
    authService = new AuthServiceMock();
    router = new RouterMock();
    spinner = new SpinnerMock();

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: 'AuthService', useValue: authService },
        { provide: Router, useValue: router },
        { provide: NgxSpinnerService, useValue: spinner },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should inject AuthService and Router', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should update isLogin based on AuthService.userData changes', () => {
    try {
      authService.userData.next({ id: 1 });
      component.ngOnInit();
      expect(component.isLogin).toBeTrue();
      authService.userData.next(null);
      component.ngOnInit();
      expect(component.isLogin).toBeFalse();
    } catch (e) {
      fail(e);
    }
  });

  it('logOut should show spinner, call AuthService.logOut and hide spinner after 500ms', fakeAsync(() => {
    try {
      component.logOut();
      expect(spinner.show).toHaveBeenCalled();
      expect(authService.logOut).toHaveBeenCalled();
      tick(500);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));
});

// ------------------------------------------------------------

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthServiceMock;
  let router: RouterMock;
  let spinner: SpinnerMock;
  let toastr: ToastrMock;

  beforeEach(waitForAsync(() => {
    authService = new AuthServiceMock();
    router = new RouterMock();
    spinner = new SpinnerMock();
    toastr = new ToastrMock();

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: 'AuthService', useValue: authService },
        { provide: Router, useValue: router },
        { provide: NgxSpinnerService, useValue: spinner },
        { provide: ToastrService, useValue: toastr },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    // mock global $ for ngOnInit
    (window as any).$ = jasmine.createSpy('jQuery').and.returnValue({ particleground: jasmine.createSpy('particleground') });
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).$;
  });

  it('should navigate to /profile in constructor when userData not null', () => {
    try {
      authService.userData.next({ id: 1 });
      const newFixture = TestBed.createComponent(RegisterComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    } catch (e) {
      fail(e);
    }
  });

  it('should not navigate in constructor when userData null', () => {
    try {
      authService.userData.next(null);
      const newFixture = TestBed.createComponent(RegisterComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).not.toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });

  it('submitRegisterForm should show spinner and set isClicked true', () => {
    try {
      component.submitRegisterForm(component.registerForm);
      expect(spinner.show).toHaveBeenCalled();
      expect(component.isClicked).toBeTrue();
    } catch (e) {
      fail(e);
    }
  });

  it('should handle invalid form: set loading true and return early', () => {
    try {
      component.registerForm.setValue({ first_name: '', last_name: '', email: '', age: '', password: '' });
      component.submitRegisterForm(component.registerForm);
      expect(component.loading).toBeTrue();
      expect(authService.signUp).not.toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });

  it('should handle valid form success response', fakeAsync(() => {
    try {
      const mockResponse = { message: 'success' };
      authService.signUp.and.returnValue(of(mockResponse));
      component.registerForm.setValue({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        age: '25',
        password: 'pass123',
      });
      component.submitRegisterForm(component.registerForm);
      tick(); // resolve observable
      expect(toastr.success).toHaveBeenCalledWith('Success');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.isClicked).toBeFalse();
      expect(component.loading).toBeFalse();
      // spinner hide after 1s
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('should handle valid form failure response and clear error after 2s', fakeAsync(() => {
    try {
      const mockResponse = { message: 'error', errors: { email: ['taken'] } };
      // component expects response.message !== 'success' and reads .errors.email[0]
      authService.signUp.and.returnValue(of({ message: 'error', errors: { email: ['taken'] } }));
      component.registerForm.setValue({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        age: '30',
        password: 'pass123',
      });
      component.submitRegisterForm(component.registerForm);
      tick(); // observable resolves
      // error toast not used for failure path in component – it only sets error string
      expect(component.error).toBe('taken');
      tick(2000);
      expect(component.error).toBe('');
      // spinner hide after 1s
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('ngOnInit should call jQuery particleground once', () => {
    try {
      const mockPart = jasmine.createSpy('particleground');
      (window as any).$ = jasmine.createSpy('jQuery').and.returnValue({ particleground: mockPart });
      component.ngOnInit();
      expect((window as any).$).toHaveBeenCalledWith('#signin');
      expect(mockPart).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  });
});
