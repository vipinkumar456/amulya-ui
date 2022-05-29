import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCreditNoteComponent } from './debit-credit-note.component';

describe('DebitCreditNoteComponent', () => {
  let component: DebitCreditNoteComponent;
  let fixture: ComponentFixture<DebitCreditNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebitCreditNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebitCreditNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
