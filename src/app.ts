enum ProjectStatus { Active, Finished };

class Project {

    constructor(public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {

    }
}

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    
    private static instance: ProjectState;
        
    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }

        return this.instance = new ProjectState();
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.Active);

        this.projects.push(newProject);

        for (const listenerFunction of this.listeners) {
            listenerFunction(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();;

interface Validatable {
    value: string | number;
    required?: boolean;
    minValueLength?: number;
    maxValueLength?: number;
    minValue?: number;
    maxValue?: number;
}

const validate = (validatable: Validatable) => {
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

const autobind = (_target: any, _methodName: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get () {
            const boundFunction = originalMethod.bind(this);
            return boundFunction;
        }
     };
     return adjustedDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        };

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        if (insertAtStart) {
            this.hostElement.insertAdjacentElement('afterbegin', this.element);
        } else {
            this.hostElement.insertAdjacentElement('beforeend', this.element);
        }
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects-list`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            const filteredProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active;
                } else {
                    return project.status === ProjectStatus.Finished;
                }
            });
            this.assignedProjects = filteredProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElement.appendChild(listItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, );

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent() {}

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

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');