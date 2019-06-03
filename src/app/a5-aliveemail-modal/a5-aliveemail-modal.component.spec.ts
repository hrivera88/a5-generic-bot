import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { A5AliveemailModalComponent } from './a5-aliveemail-modal.component';

describe('A5AliveemailModalComponent', () => {
  let component: A5AliveemailModalComponent;
  let fixture: ComponentFixture<A5AliveemailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ A5AliveemailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(A5AliveemailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
