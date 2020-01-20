import { Component } from './base-component.js';
import * as Validation from '../util/validation.js';
import { projectState } from '../state/project-state.js'
import { autobind } from '../decorators/autobind.js';

export default class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() { }

    private collectInputs(): [string, string, number] | void {
        const titleValidatable: Validation.Validatable = {
            value: this.titleInputElement.value,
            required: true,
            minValueLength: 3
        }
        const descriptionValidatable: Validation.Validatable = {
            value: this.descriptionInputElement.value,
            required: true,
            minValueLength: 5
        }
        const peopleValidatable: Validation.Validatable = {
            value: this.peopleInputElement.value,
            required: true,
            minValue: 1,
            maxValue: 15
        }

        if (Validation.validate(titleValidatable) &&
            Validation.validate(descriptionValidatable) &&
            Validation.validate(peopleValidatable)) {
            return [titleValidatable.value.toString(), descriptionValidatable.value.toString(), +peopleValidatable.value];
        } else {
            alert('Something doesn\'t look right with the data you\'ve entered');
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.collectInputs();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}