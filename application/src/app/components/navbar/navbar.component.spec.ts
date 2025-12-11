import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: any;
  let spinnerServiceMock: any;

  beforeEach(waitForAsync(() => {
    authServiceMock = {
      userData: new BehaviorSubject(null),
      logOut: jasmine.createSpy('logOut')
    };
    spinnerServiceMock = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: {} },
        { provide: NgxSpinnerService, useValue: spinnerServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    authServiceMock.userData.next(null); // Reset the userData after each test
  });

  it('should set isLogin to true when userData is not null', () => {
    try {
      authServiceMock.userData.next({}); // Simulate user data
      component.ngOnInit();
      expect(component.isLogin).toBeTruthy();
    } catch (error) {
      fail('Test failed with error: ' + error);
    }
  });

  it('should set isLogin to false when userData is null', () => {
    try {
      authServiceMock.userData.next(null); // Simulate no user data
      component.ngOnInit();
      expect(component.isLogin).toBeFalsy();
    } catch (error) {
      fail('Test failed with error: ' + error);
    }
  });
});
