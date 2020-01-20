import { Component } from './base-component.js';
import { Validatable, validate } from '../util/validation.js';
import { projectState } from '../state/project.js'
import { autobind } from '../decorators/autobind.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
        const titleValidatable: Validatable = {
            value: this.titleInputElement.value,
            required: true,
            minValueLength: 3
        }
        const descriptionValidatable: Validatable = {
            value: this.descriptionInputElement.value,
            required: true,
            minValueLength: 5
        }
        const peopleValidatable: Validatable = {
            value: this.peopleInputElement.value,
            required: true,
            minValue: 1,
            maxValue: 15
        }

        if (validate(titleValidatable) &&
            validate(descriptionValidatable) &&
            validate(peopleValidatable)) {
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