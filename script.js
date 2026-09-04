// =========================================
// TASKHUB - TASK MANAGER
// STATUS + INDIVIDUAL PROGRESS
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // ELEMENTS
    // =========================================

    const fieldButtons = document.querySelectorAll(".field");

    const taskArea = document.getElementById("taskArea");

    const fieldTitle = document.getElementById("fieldTitle");
    const taskSubtitle = document.getElementById("taskSubtitle");

    const taskInput = document.getElementById("taskInput");
    const priorityInput = document.getElementById("priorityInput");
    const statusInput = document.getElementById("statusInput");
    const progressInput = document.getElementById("progressInput");
    const dueDateInput = document.getElementById("dueDateInput");

    const addTaskButton = document.getElementById("addTask");

    const taskList = document.getElementById("taskList");

    const searchInput = document.getElementById("searchInput");

    const filterButtons = document.querySelectorAll(".filter");

    const clearCompletedButton =
        document.getElementById("clearCompleted");

    const totalTasks =
        document.getElementById("totalTasks");

    const pendingTasks =
        document.getElementById("pendingTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const progressPercent =
        document.getElementById("progressPercent");


    // =========================================
    // EDIT MODAL ELEMENTS
    // =========================================

    const editModal =
        document.getElementById("editModal");

    const editTaskInput =
        document.getElementById("editTaskInput");

    const editPriorityInput =
        document.getElementById("editPriorityInput");

    const editStatusInput =
        document.getElementById("editStatusInput");

    const editProgressInput =
        document.getElementById("editProgressInput");

    const editDueDateInput =
        document.getElementById("editDueDateInput");

    const saveEditButton =
        document.getElementById("saveEdit");

    const cancelEditButton =
        document.getElementById("cancelEdit");

    const closeModalButton =
        document.getElementById("closeModal");


    // =========================================
    // APP STATE
    // =========================================

    let currentField = "";

    let currentFilter = "all";

    let searchTerm = "";

    let taskBeingEdited = null;


    // =========================================
    // LOAD TASKS
    // =========================================

    let tasks = {};

    try {
        tasks =
            JSON.parse(
                localStorage.getItem("taskhubTasks")
            ) || {};
    } catch (error) {
        tasks = {};
    }


    // =========================================
    // HIDE TASK AREA UNTIL CATEGORY IS SELECTED
    // =========================================

    taskArea.style.display = "none";


    // =========================================
    // CATEGORY SELECTION
    // =========================================

    fieldButtons.forEach(button => {

        button.addEventListener("click", () => {

            currentField =
                button.dataset.field;


            // Remove active state
            fieldButtons.forEach(btn => {
                btn.classList.remove("active");
            });


            // Add active state
            button.classList.add("active");


            // Create category if necessary
            if (!tasks[currentField]) {
                tasks[currentField] = [];
            }


            // Show task area
            taskArea.style.display = "block";


            // Update title
            fieldTitle.textContent =
                `${currentField} Tasks`;


            // Remove emoji from subtitle
            const cleanField =
                currentField.replace(
                    /^.+?\s/,
                    ""
                );


            taskSubtitle.textContent =
                `Manage your ${cleanField.toLowerCase()} tasks below.`;


            // Reset search
            searchInput.value = "";
            searchTerm = "";


            // Reset filter
            currentFilter = "all";


            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });


            const allButton =
                document.querySelector(
                    '[data-filter="all"]'
                );

            if (allButton) {
                allButton.classList.add("active");
            }


            displayTasks();

            updateStats();


            // Scroll to task area
            taskArea.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            // Focus task input
            setTimeout(() => {
                taskInput.focus();
            }, 400);

        });

    });


    // =========================================
    // ADD TASK
    // =========================================

    addTaskButton.addEventListener(
        "click",
        addTask
    );


    taskInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                addTask();
            }

        }
    );


    function addTask() {

        const text =
            taskInput.value.trim();


        // Category check
        if (currentField === "") {

            alert(
                "Please choose a category first."
            );

            return;
        }


        // Empty task check
        if (text === "") {

            alert(
                "Please enter a task."
            );

            taskInput.focus();

            return;
        }


        // Get progress
        let progress =
            Number(progressInput.value);


        // Get status
        let status =
            statusInput.value;


        // Make sure progress/status agree
        if (progress >= 100) {

            progress = 100;
            status = "completed";

        } else if (progress > 0 && status === "pending") {

            status = "in-progress";

        }


        // Create task
        const newTask = {

            id: Date.now(),

            text: text,

            priority:
                priorityInput.value,

            status: status,

            progress: progress,

            dueDate:
                dueDateInput.value,

            completed:
                status === "completed",

            createdAt:
                new Date().toISOString()

        };


        // Create category if needed
        if (!tasks[currentField]) {
            tasks[currentField] = [];
        }


        // Add task
        tasks[currentField].push(
            newTask
        );


        // Save
        saveTasks();


        // Reset inputs
        taskInput.value = "";

        priorityInput.value = "medium";

        statusInput.value = "pending";

        progressInput.value = "0";

        dueDateInput.value = "";


        // Refresh
        displayTasks();

        updateStats();


        taskInput.focus();

    }


    // =========================================
    // DISPLAY TASKS
    // =========================================

    function displayTasks() {

        taskList.innerHTML = "";


        let currentTasks =
            tasks[currentField] || [];


        // =====================================
        // SEARCH
        // =====================================

        if (searchTerm !== "") {

            currentTasks =
                currentTasks.filter(task =>
                    task.text
                        .toLowerCase()
                        .includes(
                            searchTerm.toLowerCase()
                        )
                );

        }


        // =====================================
        // FILTER
        // =====================================

        if (currentFilter === "pending") {

            currentTasks =
                currentTasks.filter(task =>
                    task.status !== "completed"
                );

        }


        if (currentFilter === "completed") {

            currentTasks =
                currentTasks.filter(task =>
                    task.status === "completed"
                );

        }


        // =====================================
        // EMPTY STATE
        // =====================================

        if (currentTasks.length === 0) {

            const empty =
                document.createElement("li");

            empty.className =
                "empty-message";


            if (searchTerm !== "") {

                empty.innerHTML = `
                    <span>🔎</span>
                    <h3>No tasks found</h3>
                    <p>No tasks match your search.</p>
                `;

            } else if (currentFilter === "completed") {

                empty.innerHTML = `
                    <span>🎉</span>
                    <h3>No completed tasks</h3>
                    <p>Complete a task and it will appear here.</p>
                `;

            } else if (currentFilter === "pending") {

                empty.innerHTML = `
                    <span>✨</span>
                    <h3>No pending tasks</h3>
                    <p>You're all caught up!</p>
                `;

            } else {

                empty.innerHTML = `
                    <span>🌿</span>
                    <h3>No tasks yet</h3>
                    <p>Add your first task and start getting things done.</p>
                `;

            }


            taskList.appendChild(empty);

            return;
        }


        // =====================================
        // CREATE TASK CARDS
        // =====================================

        currentTasks.forEach(task => {

            // ---------------------------------
            // Make old tasks compatible
            // ---------------------------------

            if (typeof task.progress !== "number") {

                task.progress =
                    task.completed
                        ? 100
                        : 0;

            }


            if (!task.status) {

                task.status =
                    task.completed
                        ? "completed"
                        : "pending";

            }


            // ---------------------------------
            // Main LI
            // ---------------------------------

            const li =
                document.createElement("li");

            li.className =
                "task-item";


            if (
                task.completed ||
                task.status === "completed"
            ) {
                li.classList.add("completed");
            }


            // ---------------------------------
            // MAIN WRAPPER
            // ---------------------------------

            const main =
                document.createElement("div");

            main.className =
                "task-main";


            // ---------------------------------
            // CHECKBOX
            // ---------------------------------

            const checkbox =
                document.createElement("input");

            checkbox.type =
                "checkbox";

            checkbox.className =
                "task-checkbox";

            checkbox.checked =
                task.status === "completed";


            checkbox.addEventListener(
                "change",
                () => {

                    if (checkbox.checked) {

                        task.status =
                            "completed";

                        task.progress =
                            100;

                        task.completed =
                            true;

                    } else {

                        task.status =
                            "in-progress";

                        task.progress =
                            task.progress >= 100
                                ? 50
                                : task.progress;

                        task.completed =
                            false;

                    }


                    saveTasks();

                    displayTasks();

                    updateStats();

                }
            );


            // ---------------------------------
            // CONTENT
            // ---------------------------------

            const content =
                document.createElement("div");

            content.className =
                "task-content";


            // ---------------------------------
            // TASK TITLE
            // ---------------------------------

            const title =
                document.createElement("div");

            title.className =
                "task-title";

            title.textContent =
                task.text;


            // ---------------------------------
            // META
            // ---------------------------------

            const meta =
                document.createElement("div");

            meta.className =
                "task-meta";


            // ---------------------------------
            // STATUS
            // ---------------------------------

            const status =
                document.createElement("span");

            status.className =
                `status-badge status-${task.status}`;


            if (task.status === "completed") {

                status.textContent =
                    "🟢 Completed";

            } else if (
                task.status === "in-progress"
            ) {

                status.textContent =
                    "🟡 In Progress";

            } else {

                status.textContent =
                    "⚪ Pending";

            }


            meta.appendChild(status);


            // ---------------------------------
            // PRIORITY
            // ---------------------------------

            const priority =
                document.createElement("span");

            priority.className =
                `priority-badge priority-${task.priority}`;


            if (task.priority === "high") {

                priority.textContent =
                    "🔴 High";

            } else if (
                task.priority === "medium"
            ) {

                priority.textContent =
                    "🟡 Medium";

            } else {

                priority.textContent =
                    "🟢 Low";

            }


            meta.appendChild(priority);


            // ---------------------------------
            // CREATED DATE
            // ---------------------------------

            const created =
                document.createElement("span");

            created.className =
                "task-date";

            created.textContent =
                `Added ${formatDate(task.createdAt)}`;


            meta.appendChild(created);


            // ---------------------------------
            // DUE DATE
            // ---------------------------------

            if (task.dueDate) {

                const due =
                    document.createElement("span");

                due.className =
                    "due-date";


                if (
                    task.status !== "completed" &&
                    isOverdue(task.dueDate)
                ) {

                    due.classList.add("overdue");

                    due.textContent =
                        `⚠️ Overdue ${formatDueDate(task.dueDate)}`;

                } else {

                    due.textContent =
                        `📅 Due ${formatDueDate(task.dueDate)}`;

                }


                meta.appendChild(due);

            }


            // ---------------------------------
            // PROGRESS
            // ---------------------------------

            const progressContainer =
                document.createElement("div");

            progressContainer.className =
                "task-progress";


            const progressInfo =
                document.createElement("div");

            progressInfo.className =
                "progress-info";


            const progressLabel =
                document.createElement("span");

            progressLabel.textContent =
                "Progress";


            const progressValue =
                document.createElement("span");

            progressValue.textContent =
                `${task.progress}%`;


            progressInfo.appendChild(
                progressLabel
            );

            progressInfo.appendChild(
                progressValue
            );


            // Progress bar
            const progressBar =
                document.createElement("div");

            progressBar.className =
                "task-progress-bar";


            const progressFill =
                document.createElement("div");

            progressFill.className =
                "task-progress-fill";


            progressFill.style.width =
                `${task.progress}%`;


            progressBar.appendChild(
                progressFill
            );


            progressContainer.appendChild(
                progressInfo
            );

            progressContainer.appendChild(
                progressBar
            );


            // ---------------------------------
            // ADD CONTENT
            // ---------------------------------

            content.appendChild(title);

            content.appendChild(meta);

            content.appendChild(
                progressContainer
            );


            // ---------------------------------
            // ACTIONS
            // ---------------------------------

            const actions =
                document.createElement("div");

            actions.className =
                "task-actions";


            // EDIT BUTTON
            const editButton =
                document.createElement("button");

            editButton.className =
                "edit-btn";

            editButton.textContent =
                "✏️";

            editButton.title =
                "Edit task";


            editButton.addEventListener(
                "click",
                () => {

                    editTask(task);

                }
            );


            // DELETE BUTTON
            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-btn";

            deleteButton.textContent =
                "🗑️";

            deleteButton.title =
                "Delete task";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTask(task.id);

                }
            );


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            // ---------------------------------
            // BUILD CARD
            // ---------------------------------

            main.appendChild(
                checkbox
            );

            main.appendChild(
                content
            );

            main.appendChild(
                actions
            );


            li.appendChild(
                main
            );


            taskList.appendChild(
                li
            );

        });


        // Save any migrated old tasks
        saveTasks();

    }


    // =========================================
    // EDIT TASK
    // =========================================

    function editTask(task) {

        taskBeingEdited =
            task;


        editTaskInput.value =
            task.text;


        editPriorityInput.value =
            task.priority || "medium";


        editStatusInput.value =
            task.status ||
            (
                task.completed
                    ? "completed"
                    : "pending"
            );


        editProgressInput.value =
            String(
                typeof task.progress === "number"
                    ? task.progress
                    : task.completed
                        ? 100
                        : 0
            );


        editDueDateInput.value =
            task.dueDate || "";


        editModal.classList.add(
            "show"
        );


        setTimeout(() => {

            editTaskInput.focus();

        }, 100);

    }


    // =========================================
    // SAVE EDIT
    // =========================================

    saveEditButton.addEventListener(
        "click",
        () => {

            if (!taskBeingEdited) {
                return;
            }


            const newText =
                editTaskInput.value.trim();


            if (newText === "") {

                alert(
                    "Task cannot be empty."
                );

                editTaskInput.focus();

                return;
            }


            let newProgress =
                Number(
                    editProgressInput.value
                );


            let newStatus =
                editStatusInput.value;


            // Keep status and progress synchronized
            if (newProgress >= 100) {

                newProgress = 100;

                newStatus =
                    "completed";

            } else if (
                newProgress > 0 &&
                newStatus === "pending"
            ) {

                newStatus =
                    "in-progress";

            }


            taskBeingEdited.text =
                newText;


            taskBeingEdited.priority =
                editPriorityInput.value;


            taskBeingEdited.status =
                newStatus;


            taskBeingEdited.progress =
                newProgress;


            taskBeingEdited.completed =
                newStatus === "completed";


            taskBeingEdited.dueDate =
                editDueDateInput.value;


            saveTasks();

            displayTasks();

            updateStats();

            closeEditModal();

        }
    );


    // =========================================
    // CLOSE MODAL
    // =========================================

    function closeEditModal() {

        editModal.classList.remove(
            "show"
        );

        taskBeingEdited = null;

    }


    cancelEditButton.addEventListener(
        "click",
        closeEditModal
    );


    closeModalButton.addEventListener(
        "click",
        closeEditModal
    );


    // =========================================
    // CLICK OUTSIDE MODAL
    // =========================================

    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target === editModal
            ) {

                closeEditModal();

            }

        }
    );


    // =========================================
    // ESCAPE KEY
    // =========================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                editModal.classList.contains(
                    "show"
                )
            ) {

                closeEditModal();

            }

        }
    );


    // =========================================
    // DELETE TASK
    // =========================================

    function deleteTask(taskId) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this task?"
            );


        if (!confirmed) {
            return;
        }


        tasks[currentField] =
            tasks[currentField].filter(
                task =>
                    task.id !== taskId
            );


        saveTasks();

        displayTasks();

        updateStats();

    }


    // =========================================
    // SEARCH
    // =========================================

    searchInput.addEventListener(
        "input",
        () => {

            searchTerm =
                searchInput.value.trim();

            displayTasks();

        }
    );


    // =========================================
    // FILTERS
    // =========================================

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentFilter =
                    button.dataset.filter;


                filterButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                displayTasks();

            }
        );

    });


    // =========================================
    // CLEAR COMPLETED
    // =========================================

    clearCompletedButton.addEventListener(
        "click",
        () => {

            if (!currentField) {

                alert(
                    "Please choose a category first."
                );

                return;
            }


            const categoryTasks =
                tasks[currentField] || [];


            const completed =
                categoryTasks.filter(
                    task =>
                        task.status === "completed"
                );


            if (completed.length === 0) {

                alert(
                    "There are no completed tasks."
                );

                return;
            }


            const confirmed =
                confirm(
                    `Delete ${completed.length} completed task(s)?`
                );


            if (!confirmed) {
                return;
            }


            tasks[currentField] =
                categoryTasks.filter(
                    task =>
                        task.status !== "completed"
                );


            saveTasks();

            displayTasks();

            updateStats();

        }
    );


    // =========================================
    // STATISTICS
    // =========================================

    function updateStats() {

        const categoryTasks =
            tasks[currentField] || [];


        const total =
            categoryTasks.length;


        const completed =
            categoryTasks.filter(
                task =>
                    task.status === "completed"
            ).length;


        const pending =
            categoryTasks.filter(
                task =>
                    task.status !== "completed"
            ).length;


        // Calculate average progress
        let averageProgress = 0;


        if (total > 0) {

            const totalProgress =
                categoryTasks.reduce(
                    (sum, task) => {

                        return sum +
                            Number(
                                task.progress || 0
                            );

                    },
                    0
                );


            averageProgress =
                Math.round(
                    totalProgress / total
                );

        }


        // Update cards
        totalTasks.textContent =
            total;


        pendingTasks.textContent =
            pending;


        completedTasks.textContent =
            completed;


        progressPercent.textContent =
            `${averageProgress}%`;

    }


    // =========================================
    // SAVE TASKS
    // =========================================

    function saveTasks() {

        try {

            localStorage.setItem(
                "taskhubTasks",
                JSON.stringify(tasks)
            );

        } catch (error) {

            console.error(
                "Could not save tasks:",
                error
            );

        }

    }


    // =========================================
    // FORMAT CREATED DATE
    // =========================================

    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }


        const date =
            new Date(dateString);


        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // =========================================
    // FORMAT DUE DATE
    // =========================================

    function formatDueDate(dateString) {

        if (!dateString) {
            return "";
        }


        const date =
            new Date(
                `${dateString}T00:00:00`
            );


        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =========================================
    // CHECK OVERDUE
    // =========================================

    function isOverdue(dateString) {

        if (!dateString) {
            return false;
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const dueDate =
            new Date(
                `${dateString}T00:00:00`
            );


        return dueDate < today;

    }

});