import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaMaskComponent } from './meta-mask.component';

describe('MetaMaskComponent', () => {
  let component: MetaMaskComponent;
  let fixture: ComponentFixture<MetaMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetaMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
