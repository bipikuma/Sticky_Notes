import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

class MockAuthService {
  userData = { getValue: () => null } as any;
  signUp = jasmine.createSpy('signUp');
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
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: MockAuthService;
  let router: MockRouter;
  let spinner: MockSpinnerService;
  let toastr: MockToastrService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: NgxSpinnerService, useClass: MockSpinnerService },
        { provide: ToastrService, useClass: MockToastrService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    spinner = TestBed.inject(NgxSpinnerService) as any;
    toastr = TestBed.inject(ToastrService) as any;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should navigate to profile if token exists on init', () => {
    try {
      (authService.userData as any).getValue = () => ({ token: 'abc' });
      const newFixture = TestBed.createComponent(RegisterComponent);
      const newComp = newFixture.componentInstance;
      expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    } catch (e) {
      fail(e);
    }
  });

  it('should set loading true and return early when form is invalid', () => {
    try {
      component.registerForm.setValue({
        first_name: '',
        last_name: '',
        email: 'invalid',
        age: null,
        password: ''
      });
      component.submitRegisterForm(component.registerForm);
      expect(component.isClicked).toBeTruthy();
      expect(component.loading).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should handle successful registration', fakeAsync(() => {
    try {
      const response = { message: 'success' };
      authService.signUp.and.returnValue(of(response));
      component.registerForm.setValue({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        age: 25,
        password: 'pass123'
      });
      component.submitRegisterForm(component.registerForm);
      expect(spinner.show).toHaveBeenCalled();
      tick();
      expect(authService.signUp).toHaveBeenCalledWith(component.registerForm.value);
      expect(toastr.success).toHaveBeenCalledWith('Success');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      tick(1000);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));

  it('should handle registration error and display error message', fakeAsync(() => {
    try {
      const response = { errors: { email: { message: 'Email taken' } } };
      authService.signUp.and.returnValue(of(response));
      component.registerForm.setValue({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        age: 25,
        password: 'pass123'
      });
      component.submitRegisterForm(component.registerForm);
      expect(spinner.show).toHaveBeenCalled();
      tick();
      expect(component.error).toBe('Email taken');
      tick(2000);
      expect(component.error).toBe('');
      tick(1000);
      expect(component.loading).toBeFalsy();
    } catch (e) {
      fail(e);
    }
  }));
});
