import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

class MockAuthService {
  // userData is an observable that the component subscribes to
  userData = new BehaviorSubject<any>(null);
  logOut = jasmine.createSpy('logOut');
}

class MockSpinnerService {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: MockAuthService;
  let spinner: MockSpinnerService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: NgxSpinnerService, useClass: MockSpinnerService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    spinner = TestBed.inject(NgxSpinnerService) as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset spies to avoid cross‑test interference
    (authService.logOut as jasmine.Spy).calls.reset();
    (spinner.show as jasmine.Spy).calls.reset();
    (spinner.hide as jasmine.Spy).calls.reset();
  });

  it('should create the component', () => {
    try {
      expect(component).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should set isLogin to true when userData emits a non‑null value', () => {
    try {
      // Emit a non‑null user object
      (authService.userData as BehaviorSubject<any>).next({ token: 'abc' });
      // Trigger change detection so the subscription callback runs
      fixture.detectChanges();
      expect(component.isLogin).toBeTruthy();
    } catch (e) {
      fail(e);
    }
  });

  it('should set isLogin to false when userData emits null', () => {
    try {
      // Ensure the observable currently holds null
      (authService.userData as BehaviorSubject<any>).next(null);
      fixture.detectChanges();
      expect(component.isLogin).toBeFalsy();
    } catch (e) {
      fail(e);
    }
  });

  it('should call spinner.show, authService.logOut and hide spinner after 500ms on logOut', fakeAsync(() => {
    try {
      component.logOut();
      expect(spinner.show).toHaveBeenCalled();
      expect(authService.logOut).toHaveBeenCalled();
      // spinner.hide is scheduled after 500ms
      tick(500);
      expect(spinner.hide).toHaveBeenCalled();
    } catch (e) {
      fail(e);
    }
  }));
});