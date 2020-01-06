namespace App {
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction);
    }
}

export class ProjectState extends State<Project> {
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
        this.updateListeners();
    }

    updateStatus(projectId: string, newstatus: ProjectStatus) {
        const project = this.projects.find(p => p.id === projectId)
        if (project && project.status !== newstatus) {
            project.status = newstatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFunction of this.listeners) {
            listenerFunction(this.projects.slice());
        }
    }
}

export const projectState = ProjectState.getInstance();
}