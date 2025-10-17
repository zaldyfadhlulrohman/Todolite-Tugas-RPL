document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const projectsListEl = document.getElementById('projectsList');
    const tasksListEl = document.getElementById('tasksList');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModalOverlay = document.getElementById('taskModalOverlay');
    const taskForm = document.getElementById('taskForm');
    const cancelTaskBtn = document.getElementById('cancelTaskBtn');
    const viewTitleEl = document.getElementById('viewTitle');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const filtersListEl = document.querySelector('.filters-list');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    // --- App State ---
    let data = {
        projects: [],
        tasks: [],
        nextProjectId: 1,
        nextTaskId: 1,
        settings: {
            theme: 'light'
        }
    };

    let state = {
        currentView: { type: 'project', id: 1 }, // 'project', 'filter'
        currentSort: 'default',
        searchTerm: ''
    };

    // --- Data Management (localStorage) ---
    const saveData = () => {
        localStorage.setItem('todoAppData', JSON.stringify(data));
    };

    const loadData = () => {
        const savedData = localStorage.getItem('todoAppData');
        if (savedData) {
            data = JSON.parse(savedData);
        } else {
            // Initialize with default data if none exists
            data = {
                projects: [{ id: 1, name: 'Inbox' }],
                tasks: [],
                nextProjectId: 2,
                nextTaskId: 1,
                settings: { theme: 'light' }
            };
        }
    };

    // --- Rendering ---
    const renderProjects = () => {
        projectsListEl.innerHTML = '';
        data.projects.forEach(project => {
            if (project.id === 1) return; // Skip Inbox
            const li = document.createElement('li');
            li.className = `project-item ${state.currentView.type === 'project' && state.currentView.id === project.id ? 'active' : ''}`;
            li.dataset.projectId = project.id;
            
            li.innerHTML = `
                <span class="project-item-name">${project.name}</span>
                <button class="delete-project-btn" data-project-id="${project.id}" aria-label="Delete Project">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            projectsListEl.appendChild(li);
        });
    };
    
    const renderTasks = () => {
        tasksListEl.innerHTML = '';
        let tasksToRender = getFilteredAndSortedTasks();

        if (tasksToRender.length === 0) {
            tasksListEl.innerHTML = `<li class="no-tasks-message">No tasks here. Looks clean! ✨</li>`;
            return;
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.taskId = task.id;

            const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'}) : '';

            li.innerHTML = `
                <div class="task-checkbox p${task.priority}" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <p>${task.content}</p>
                </div>
                ${dueDate ? `<span class="task-due-date">${dueDate}</span>` : ''}
                <div class="task-actions">
                    <button class="task-action-btn edit-task-btn" data-task-id="${task.id}" aria-label="Edit Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="task-action-btn delete-task-btn" data-task-id="${task.id}" aria-label="Delete Task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            tasksListEl.appendChild(li);

            // Add animation class
            li.classList.add('adding');
            setTimeout(() => li.classList.remove('adding'), 10);
        });
    };

    const updateView = () => {
        // Update Title
        if (state.currentView.type === 'project') {
            const project = data.projects.find(p => p.id === state.currentView.id);
            viewTitleEl.textContent = project ? project.name : 'Inbox';
        } else {
            viewTitleEl.textContent = state.currentView.id.charAt(0).toUpperCase() + state.currentView.id.slice(1);
        }
        
        // Update Active Classes
        document.querySelectorAll('.project-item, .filter-item').forEach(el => el.classList.remove('active'));
        if (state.currentView.type === 'project') {
            const projectEl = document.querySelector(`.project-item[data-project-id='${state.currentView.id}']`);
            if (projectEl) projectEl.classList.add('active');
            else document.querySelector('.filter-item[data-filter="inbox"]').classList.add('active');
        } else {
             document.querySelector(`.filter-item[data-filter='${state.currentView.id}']`).classList.add('active');
        }
        
        renderProjects();
        renderTasks();
    };

    // --- Task & Project Logic ---
    const addProject = () => {
        const projectName = prompt('Enter new project name:');
        if (projectName && projectName.trim() !== '') {
            const newProject = {
                id: data.nextProjectId++,
                name: projectName.trim()
            };
            data.projects.push(newProject);
            saveData();
            state.currentView = { type: 'project', id: newProject.id };
            updateView();
        }
    };

    const deleteProject = (projectId) => {
        if (projectId === 1) {
            alert("Cannot delete the Inbox project.");
            return;
        }
        if (confirm('Are you sure you want to delete this project and all its tasks?')) {
            data.projects = data.projects.filter(p => p.id !== projectId);
            data.tasks = data.tasks.filter(t => t.projectId !== projectId);
            saveData();
            state.currentView = { type: 'project', id: 1 }; // Switch to Inbox
            updateView();
        }
    };
    
    const addTask = (taskData) => {
        const newTask = {
            id: data.nextTaskId++,
            content: taskData.content,
            projectId: parseInt(taskData.projectId),
            dueDate: taskData.dueDate || null,
            priority: parseInt(taskData.priority),
            completed: false
        };
        data.tasks.push(newTask);
        saveData();
        renderTasks();
    };
    
    const editTask = (taskId, updatedData) => {
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updatedData };
            saveData();
            renderTasks();
        }
    };

    const deleteTask = (taskId) => {
        const taskEl = document.querySelector(`.task-item[data-task-id='${taskId}']`);
        if (taskEl) {
            taskEl.classList.add('removing');
            taskEl.addEventListener('transitionend', () => {
                data.tasks = data.tasks.filter(t => t.id !== taskId);
                saveData();
                renderTasks();
            }, { once: true });
        }
    };

    const toggleComplete = (taskId) => {
        const task = data.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveData();
            renderTasks();
        }
    };

    // --- Filtering and Sorting ---
    const getFilteredAndSortedTasks = () => {
        let filteredTasks = [];

        // Filter
        if (state.currentView.type === 'project') {
            filteredTasks = data.tasks.filter(t => t.projectId === state.currentView.id);
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (state.currentView.id === 'today') {
                filteredTasks = data.tasks.filter(t => t.dueDate === today);
            } else if (state.currentView.id === 'upcoming') {
                filteredTasks = data.tasks.filter(t => t.dueDate && t.dueDate > today);
            } else { // inbox
                filteredTasks = data.tasks.filter(t => t.projectId === 1);
            }
        }

        // Search
        if (state.searchTerm) {
            filteredTasks = filteredTasks.filter(t => t.content.toLowerCase().includes(state.searchTerm));
        }

        // Sort
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            switch (state.currentSort) {
                case 'dueDate':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    return a.priority - b.priority;
                default:
                    return 0; // Default order is insertion order
            }
        });

        return sortedTasks;
    };
    
    // --- UI & Modal ---
    const showTaskModal = (task = null) => {
        taskForm.reset();
        const modalTitle = document.getElementById('taskModalTitle');
        const saveBtn = document.getElementById('saveTaskBtn');
        const taskIdInput = document.getElementById('taskId');
        const projectSelect = document.getElementById('taskProject');

        projectSelect.innerHTML = data.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        if (task) {
            modalTitle.textContent = 'Edit Task';
            saveBtn.textContent = 'Save Changes';
            taskIdInput.value = task.id;
            document.getElementById('taskContent').value = task.content;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority;
            projectSelect.value = task.projectId;
        } else {
            modalTitle.textContent = 'Add Task';
            saveBtn.textContent = 'Add Task';
            taskIdInput.value = '';
            projectSelect.value = state.currentView.type === 'project' ? state.currentView.id : 1;
            document.getElementById('taskPriority').value = 4; // Default priority
        }
        taskModalOverlay.classList.add('visible');
    };

    const hideTaskModal = () => {
        taskModalOverlay.classList.remove('visible');
    };

    // --- Theming ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        data.settings.theme = theme;
        saveData();
    };

    const toggleTheme = () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    // --- Event Listeners ---
    addProjectBtn.addEventListener('click', addProject);
    addTaskBtn.addEventListener('click', () => showTaskModal());
    cancelTaskBtn.addEventListener('click', hideTaskModal);
    taskModalOverlay.addEventListener('click', (e) => {
        if (e.target === taskModalOverlay) {
            hideTaskModal();
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('taskId').value;
        const taskData = {
            content: document.getElementById('taskContent').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            projectId: document.getElementById('taskProject').value,
        };

        if (taskId) {
            editTask(parseInt(taskId), taskData);
        } else {
            addTask(taskData);
        }
        hideTaskModal();
    });

    projectsListEl.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-item');
        const deleteBtn = e.target.closest('.delete-project-btn');

        if (deleteBtn) {
            const projectId = parseInt(deleteBtn.dataset.projectId);
            deleteProject(projectId);
        } else if (projectItem) {
            const projectId = parseInt(projectItem.dataset.projectId);
            state.currentView = { type: 'project', id: projectId };
            updateView();
        }
    });
    
    filtersListEl.addEventListener('click', (e) => {
        const filterItem = e.target.closest('.filter-item');
        if (filterItem) {
            const filterType = filterItem.dataset.filter;
            if (filterType === 'inbox') {
                 state.currentView = { type: 'project', id: 1 };
            } else {
                state.currentView = { type: 'filter', id: filterType };
            }
            updateView();
        }
    });

    tasksListEl.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        const editBtn = e.target.closest('.edit-task-btn');
        const deleteBtn = e.target.closest('.delete-task-btn');

        if (checkbox) {
            const taskId = parseInt(checkbox.dataset.taskId);
            toggleComplete(taskId);
        } else if (editBtn) {
            const taskId = parseInt(editBtn.dataset.taskId);
            const task = data.tasks.find(t => t.id === taskId);
            if (task) showTaskModal(task);
        } else if (deleteBtn) {
            const taskId = parseInt(deleteBtn.dataset.taskId);
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
            }
        }
    });
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        renderTasks();
    });
    sortSelect.addEventListener('change', (e) => {
        state.currentSort = e.target.value;
        renderTasks();
    });

    // --- Initial Load ---
    const init = () => {
        loadData();
        applyTheme(data.settings.theme);
        updateView();
    };

    init();
});
