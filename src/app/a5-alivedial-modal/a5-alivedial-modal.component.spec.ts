import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { A5AlivedialModalComponent } from './a5-alivedial-modal.component';

describe('A5AlivedialModalComponent', () => {
  let component: A5AlivedialModalComponent;
  let fixture: ComponentFixture<A5AlivedialModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ A5AlivedialModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(A5AlivedialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
