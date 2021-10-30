import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[app-errors]',
  templateUrl: './errors.component.html'
})
export class ErrorsComponent implements OnInit {

  @Input()
  control: FormControl;
  @Input()
  label: string;
  @Input()
  submit: boolean
  constructor() { }

  ngOnInit() {
  }

}