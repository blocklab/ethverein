import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmApplicationDialogComponent } from './confirm-application-dialog.component';

describe('ConfirmApplicationDialogComponent', () => {
  let component: ConfirmApplicationDialogComponent;
  let fixture: ComponentFixture<ConfirmApplicationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmApplicationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
