import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCloseVoteDialogComponent } from './confirm-close-vote-dialog.component';

describe('ConfirmActionComponent', () => {
  let component: ConfirmCloseVoteDialogComponent;
  let fixture: ComponentFixture<ConfirmCloseVoteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmCloseVoteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmCloseVoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
