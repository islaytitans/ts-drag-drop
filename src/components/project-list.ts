/// <reference path="base-component.ts"  />
/// <reference path="../decorators/autobind.ts"  />
/// <reference path="../models/drag-drop.ts"  />
/// <reference path="../models/project.ts"  />
/// <reference path="../state/project.ts"  />

namespace App {
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[];
    
        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false, `${type}-projects`);
            this.assignedProjects = [];
    
            this.configure(); 
            this.renderContent();
        }
    
        @autobind
        dragOverHandler(event: DragEvent): void {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listElement = this.element.querySelector('ul')!;
                listElement.classList.add('droppable');
            }
        }
    
        @autobind
        dropHandler(event: DragEvent): void {
            const projectId = event.dataTransfer!.getData('text/plain');
            projectState.updateStatus(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
        }
    
        @autobind
        dragLeaveHandler(_: DragEvent): void {
            const listElement = this.element.querySelector('ul')!;
            listElement.classList.remove('droppable');
        }
    
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('drop', this.dropHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
    
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
            const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
            listEl.innerHTML = '';
            for (const projectItem of this.assignedProjects) {
                console.log(this.element.querySelector('ul')!.id);
                new ProjectItem(this.element.querySelector('ul')!.id, projectItem); 
            } 
        }
    }
}