import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: any;
  let mockSpinner: any;
  let mockToastr: any;

  beforeEach(waitForAsync(() => {
    // Mock AuthService with a BehaviorSubject for userData
    mockAuthService = {
      userData: new BehaviorSubject<any>(null),
      signUp: jasmine.createSpy('signUp')
    };
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockSpinner = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
    mockToastr = { success: jasmine.createSpy('success') };

    // Stub global $ function used in ngOnInit
    (window as any).$ = jasmine.createSpy('jQuery').and.callFake(() => {
      return { particleground: jasmine.createSpy('particleground') };
    });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset spies after each test
    mockAuthService.signUp.calls.reset();
    mockRouter.navigate.calls.reset();
    mockSpinner.show.calls.reset();
    mockSpinner.hide.calls.reset();
    mockToastr.success.calls.reset();
    (window as any).$.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /profile if userData is already set in constructor', () => {
    // Arrange: set userData before component creation
    mockAuthService.userData.next({ id: 1, name: 'Test' });
    // Re-create component to trigger constructor logic
    const newFixture = TestBed.createComponent(RegisterComponent);
    const newComp = newFixture.componentInstance;
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should call particleground on ngOnInit', () => {
    expect((window as any).$).toHaveBeenCalledWith('#signup');
    const returnedObj = (window as any).$.calls.mostRecent().returnValue;
    expect(returnedObj.particleground).toHaveBeenCalled();
  });

  describe('submitRegisterForm', () => {
    let validForm: FormGroup;

    beforeEach(() => {
      // Populate a valid form
      component.registerForm.setValue({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        age: 25,
        password: 'secret123',
      });
      validForm = component.registerForm;
    });

    it('should show spinner and set flags when form is invalid', fakeAsync(() => {
      // Make form invalid by clearing a required field
      component.registerForm.controls['first_name'].setValue(null);
      component.submitRegisterForm(component.registerForm);
      tick();
      expect(mockSpinner.show).toHaveBeenCalled();
      expect(component.isClicked).toBeTruthy();
      expect(component.loading).toBeTruthy();
      // spinner.hide is scheduled after 1s
      tick(1000);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));

    it('should handle successful registration', fakeAsync(() => {
      const successResponse = { message: 'success' };
      mockAuthService.signUp.and.returnValue(of(successResponse));

      component.submitRegisterForm(validForm);
      // spinner.show called immediately
      expect(mockSpinner.show).toHaveBeenCalled();
      expect(component.isClicked).toBeTruthy();

      // Simulate async observable emission
      tick();

      expect(component.isClicked).toBeFalsy();
      expect(component.loading).toBeFalsy();
      expect(mockToastr.success).toHaveBeenCalledWith('Success');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

      // spinner.hide scheduled after 1s
      tick(1000);
      expect(mockSpinner.hide).toHaveBeenCalled();

      // Form should be reset
      expect(component.registerForm.pristine).toBeTruthy();
    }));

    it('should handle registration error response', fakeAsync(() => {
      const errorResponse = {
        message: 'error',
        errors: { email: { message: 'Email already exists' } },
      };
      mockAuthService.signUp.and.returnValue(of(errorResponse));

      component.submitRegisterForm(validForm);
      expect(mockSpinner.show).toHaveBeenCalled();
      expect(component.isClicked).toBeTruthy();

      tick(); // process observable

      expect(component.error).toBe('Email already exists');
      // error cleared after 2000ms
      tick(2000);
      expect(component.error).toBe('');

      // loading cleared after 1000ms
      tick(1000);
      expect(component.loading).toBeFalsy();

      // isClicked should be false after handling
      expect(component.isClicked).toBeFalsy();

      // spinner.hide after 1s from initial call
      tick(1000);
      expect(mockSpinner.hide).toHaveBeenCalled();
    }));
  });
});
