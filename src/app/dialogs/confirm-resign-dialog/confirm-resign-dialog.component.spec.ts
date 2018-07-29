import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmResignDialogComponent } from './confirm-resign-dialog.component';

describe('ConfirmResignDialogComponent', () => {
  let component: ConfirmResignDialogComponent;
  let fixture: ComponentFixture<ConfirmResignDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmResignDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmResignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
