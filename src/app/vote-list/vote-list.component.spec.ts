import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteListComponent } from './vote-list.component';

describe('VoteListComponent', () => {
  let component: VoteListComponent;
  let fixture: ComponentFixture<VoteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
