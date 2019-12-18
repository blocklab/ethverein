import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteDetailDialogComponent } from './vote-detail-dialog.component';

describe('ConfirmActionComponent', () => {
  let component: VoteDetailDialogComponent;
  let fixture: ComponentFixture<VoteDetailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteDetailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
