namespace App {
    export interface Validatable {
        value: string | number;
        required?: boolean;
        minValueLength?: number;
        maxValueLength?: number;
        minValue?: number;
        maxValue?: number;
    }
    
    export const validate = (validatable: Validatable) => {
        let isValid = true;
    
        if (validatable.required) {
            isValid = isValid && validatable.value.toString().trim().length > 0;
        }
    
        if (typeof validatable.value === 'string') {
            if (validatable.minValueLength && validatable.minValueLength != null) {
                isValid = isValid && validatable.value.length >= validatable.minValueLength;
            }
            if (validatable.maxValueLength && validatable.maxValueLength != null) {
                isValid = isValid && validatable.value.length <= validatable.maxValueLength;
            }
        }
    
        if (typeof validatable.value === 'number') {
            if (validatable.minValue != null) {
                isValid = isValid && validatable.value >= validatable.minValue;
            }
            if (validatable.maxValue != null) {
                isValid = isValid && validatable.value <= validatable.maxValue;
            }
        }
        return isValid;
    }
}