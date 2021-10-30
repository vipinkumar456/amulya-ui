import {
    AbstractControl,
    NG_VALIDATORS,
    Validator,
    ValidatorFn,
  } from "@angular/forms";
  import { Directive } from "@angular/core";
  
  export function blue(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      parseInt(control.value) >= 0 ? null : { wrongColor: control.value };
  }
  
  @Directive({
    selector: "[minone]",
    providers: [
      {
        provide: NG_VALIDATORS,
        useExisting: MinValidatorDirective,
        multi: true,
      },
    ],
  })
  export class MinValidatorDirective implements Validator {
    validate(control: AbstractControl): { [key: string]: any } | null {
      return blue()(control);
    }
  }
  