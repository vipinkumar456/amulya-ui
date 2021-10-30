import { FormControl } from "@angular/forms";

export function phone(control: FormControl) {
    if (!control.value) { return null; }
    if ((/^(?!0+$)(?:\(?\+\d{1,3}\)?[- ]?|0)?\d{10}$/g).test(control.value)) {
        return null;
    } else {
        return { "phone": true };
    }
}

export function email  (control: FormControl) {
    if (!control.value) { return null; }
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(control.value)) {
        return null;
    } else {
        return { "email": true };
    }
}
export function pincode(control: FormControl) {
    if (!control.value) { return null; }
    if ((/^[1-9][0-9]{5}$/g).test(control.value)) {
        return null;
    } else {
        return { "pincode": true };
    }
}
export function pan(control: FormControl) {
    if (!control.value) { return null; }
    // if ((/([A-Z]){5}([0-9]){4}([A-Z]){1}$/g).test(control.value)) {
    if ((/^(?=(.*\d){1})(?=(.*[a-zA-Z]))[a-zA-Z0-9]{10,}$/g).test(control.value)) {
        return null;
    } else {
        return { "pan": true };
    }
}
export function percentage  (control: FormControl) {
    if (!control.value) { return null; }
    if ((/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/g).test(control.value)) {
        return null;
    } else {
        return { "percentage": true };
    }
}