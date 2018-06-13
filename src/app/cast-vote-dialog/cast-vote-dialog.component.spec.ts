import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CastVoteDialogComponent } from './cast-vote-dialog.component';

describe('CastVoteDialogComponent', () => {
  let component: CastVoteDialogComponent;
  let fixture: ComponentFixture<CastVoteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CastVoteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CastVoteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
