// =========================================================
// TASKHUB
// INDIVIDUAL TASK STATUS + DRAGGABLE PROGRESS
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const fieldButtons =
        document.querySelectorAll(".field");

    const taskArea =
        document.getElementById("taskArea");

    const fieldTitle =
        document.getElementById("fieldTitle");

    const taskSubtitle =
        document.getElementById("taskSubtitle");

    const taskInput =
        document.getElementById("taskInput");

    const priorityInput =
        document.getElementById("priorityInput");

    const dueDateInput =
        document.getElementById("dueDateInput");

    const addTaskButton =
        document.getElementById("addTask");

    const taskList =
        document.getElementById("taskList");

    const searchInput =
        document.getElementById("searchInput");

    const filterButtons =
        document.querySelectorAll(".filter");

    const clearCompletedButton =
        document.getElementById("clearCompleted");


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalTasks =
        document.getElementById("totalTasks");

    const pendingTasks =
        document.getElementById("pendingTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const progressPercent =
        document.getElementById("progressPercent");


    // =====================================================
    // EDIT MODAL
    // =====================================================

    const editModal =
        document.getElementById("editModal");

    const editTaskInput =
        document.getElementById("editTaskInput");

    const editPriorityInput =
        document.getElementById("editPriorityInput");

    const editDueDateInput =
        document.getElementById("editDueDateInput");

    const editProgressInput =
        document.getElementById("editProgressInput");

    const editProgressValue =
        document.getElementById("editProgressValue");

    const saveEditButton =
        document.getElementById("saveEdit");

    const cancelEditButton =
        document.getElementById("cancelEdit");

    const closeModalButton =
        document.getElementById("closeModal");


    // =====================================================
    // STATE
    // =====================================================

    let currentField = "";

    let currentFilter = "all";

    let searchTerm = "";

    let taskBeingEdited = null;


    // =====================================================
    // LOAD TASKS
    // =====================================================

    let tasks = {};

    try {

        tasks =
            JSON.parse(
                localStorage.getItem(
                    "taskhubTasks"
                )
            ) || {};

    } catch (error) {

        console.error(
            "Could not load tasks.",
            error
        );

        tasks = {};
    }


    // =====================================================
    // HIDE TASK AREA INITIALLY
    // =====================================================

    taskArea.style.display = "none";


    // =====================================================
    // CATEGORY BUTTONS
    // =====================================================

    fieldButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentField =
                    button.dataset.field;


                // Active category
                fieldButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                // Create category
                if (!tasks[currentField]) {

                    tasks[currentField] = [];

                }


                // Show task area
                taskArea.style.display =
                    "block";


                // Title
                fieldTitle.textContent =
                    `${currentField} Tasks`;


                // Subtitle
                const cleanField =
                    currentField.replace(
                        /^.+?\s/,
                        ""
                    );


                taskSubtitle.textContent =
                    `Manage your ${cleanField.toLowerCase()} tasks below.`;


                // Reset filters
                currentFilter = "all";

                searchTerm = "";

                searchInput.value = "";


                filterButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                const allButton =
                    document.querySelector(
                        '[data-filter="all"]'
                    );


                if (allButton) {

                    allButton.classList.add(
                        "active"
                    );

                }


                displayTasks();

                updateStats();


                taskArea.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    // =====================================================
    // ADD TASK
    // =====================================================

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

        // Category
        if (!currentField) {

            alert(
                "Please choose a category first."
            );

            return;
        }


        // Task text
        const text =
            taskInput.value.trim();


        if (!text) {

            alert(
                "Please enter a task."
            );

            taskInput.focus();

            return;
        }


        // Create task
        const newTask = {

            id:
                Date.now(),

            text:
                text,

            priority:
                priorityInput.value,

            dueDate:
                dueDateInput.value,

            progress:
                0,

            status:
                "pending",

            completed:
                false,

            createdAt:
                new Date().toISOString()

        };


        // Create category if necessary
        if (!tasks[currentField]) {

            tasks[currentField] = [];

        }


        // Add
        tasks[currentField].push(
            newTask
        );


        // Save
        saveTasks();


        // Reset
        taskInput.value = "";

        priorityInput.value =
            "medium";

        dueDateInput.value = "";


        // Refresh
        displayTasks();

        updateStats();

        taskInput.focus();

    }


    // =====================================================
    // DISPLAY TASKS
    // =====================================================

    function displayTasks() {

        taskList.innerHTML = "";


        let currentTasks =
            tasks[currentField] || [];


        // -------------------------------------------------
        // SEARCH
        // -------------------------------------------------

        if (searchTerm) {

            currentTasks =
                currentTasks.filter(
                    task =>
                        task.text
                            .toLowerCase()
                            .includes(
                                searchTerm.toLowerCase()
                            )
                );

        }


        // -------------------------------------------------
        // FILTER
        // -------------------------------------------------

        if (
            currentFilter ===
            "pending"
        ) {

            currentTasks =
                currentTasks.filter(
                    task =>
                        task.status !==
                        "completed"
                );

        }


        if (
            currentFilter ===
            "completed"
        ) {

            currentTasks =
                currentTasks.filter(
                    task =>
                        task.status ===
                        "completed"
                );

        }


        // -------------------------------------------------
        // EMPTY
        // -------------------------------------------------

        if (
            currentTasks.length === 0
        ) {

            const empty =
                document.createElement("li");


            empty.className =
                "empty-message";


            empty.innerHTML = `
                <span>🌿</span>

                <h3>No tasks here</h3>

                <p>
                    Add a task to get started.
                </p>
            `;


            taskList.appendChild(
                empty
            );

            return;
        }


        // -------------------------------------------------
        // CREATE TASKS
        // -------------------------------------------------

        currentTasks.forEach(task => {

            // ---------------------------------------------
            // Compatibility with older tasks
            // ---------------------------------------------

            if (
                typeof task.progress !==
                "number"
            ) {

                task.progress =
                    task.completed
                        ? 100
                        : 0;

            }


            if (!task.status) {

                task.status =
                    task.completed
                        ? "completed"
                        : task.progress > 0
                            ? "in-progress"
                            : "pending";

            }


            // ---------------------------------------------
            // TASK CARD
            // ---------------------------------------------

            const li =
                document.createElement("li");


            li.className =
                "task-item";


            if (
                task.status ===
                "completed"
            ) {

                li.classList.add(
                    "completed"
                );

            }


            // ---------------------------------------------
            // MAIN
            // ---------------------------------------------

            const main =
                document.createElement("div");


            main.className =
                "task-main";


            // ---------------------------------------------
            // CHECKBOX
            // ---------------------------------------------

            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.className =
                "task-checkbox";


            checkbox.checked =
                task.status ===
                "completed";


            checkbox.addEventListener(
                "change",
                () => {

                    if (
                        checkbox.checked
                    ) {

                        task.progress =
                            100;

                        task.status =
                            "completed";

                        task.completed =
                            true;

                    } else {

                        // Don't jump to 50%.
                        // Keep the user's previous
                        // percentage.

                        if (
                            task.progress >=
                            100
                        ) {

                            task.progress =
                                99;

                        }


                        task.status =
                            task.progress > 0
                                ? "in-progress"
                                : "pending";


                        task.completed =
                            false;

                    }


                    saveTasks();

                    displayTasks();

                    updateStats();

                }
            );


            // ---------------------------------------------
            // CONTENT
            // ---------------------------------------------

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "task-content";


            // ---------------------------------------------
            // TITLE
            // ---------------------------------------------

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "task-title";


            title.textContent =
                task.text;


            // ---------------------------------------------
            // META
            // ---------------------------------------------

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "task-meta";


            // ---------------------------------------------
            // STATUS
            // ---------------------------------------------

            const status =
                document.createElement(
                    "span"
                );


            status.className =
                `status-badge status-${task.status}`;


            if (
                task.status ===
                "completed"
            ) {

                status.textContent =
                    "🟢 Completed";

            } else if (
                task.status ===
                "in-progress"
            ) {

                status.textContent =
                    "🟡 In Progress";

            } else {

                status.textContent =
                    "⚪ Pending";

            }


            meta.appendChild(
                status
            );


            // ---------------------------------------------
            // PRIORITY
            // ---------------------------------------------

            const priority =
                document.createElement(
                    "span"
                );


            priority.className =
                `priority-badge priority-${task.priority}`;


            if (
                task.priority ===
                "high"
            ) {

                priority.textContent =
                    "🔴 High";

            } else if (
                task.priority ===
                "medium"
            ) {

                priority.textContent =
                    "🟡 Medium";

            } else {

                priority.textContent =
                    "🟢 Low";

            }


            meta.appendChild(
                priority
            );


            // ---------------------------------------------
            // CREATED
            // ---------------------------------------------

            const created =
                document.createElement(
                    "span"
                );


            created.className =
                "task-date";


            created.textContent =
                `Added ${formatDate(
                    task.createdAt
                )}`;


            meta.appendChild(
                created
            );


            // ---------------------------------------------
            // DUE DATE
            // ---------------------------------------------

            if (task.dueDate) {

                const due =
                    document.createElement(
                        "span"
                    );


                due.className =
                    "due-date";


                if (
                    task.status !==
                    "completed" &&
                    isOverdue(
                        task.dueDate
                    )
                ) {

                    due.classList.add(
                        "overdue"
                    );


                    due.textContent =
                        `⚠️ Overdue ${formatDueDate(
                            task.dueDate
                        )}`;

                } else {

                    due.textContent =
                        `📅 Due ${formatDueDate(
                            task.dueDate
                        )}`;

                }


                meta.appendChild(
                    due
                );

            }


            // ---------------------------------------------
            // INDIVIDUAL PROGRESS
            // ---------------------------------------------

            const progressContainer =
                document.createElement(
                    "div"
                );


            progressContainer.className =
                "task-progress";


            // Progress info
            const progressInfo =
                document.createElement(
                    "div"
                );


            progressInfo.className =
                "progress-info";


            const progressLabel =
                document.createElement(
                    "span"
                );


            progressLabel.textContent =
                "Task Progress";


            const progressValue =
                document.createElement(
                    "span"
                );


            progressValue.textContent =
                `${task.progress}%`;


            progressInfo.appendChild(
                progressLabel
            );


            progressInfo.appendChild(
                progressValue
            );


            // ---------------------------------------------
            // RANGE SLIDER
            // ---------------------------------------------

            const slider =
                document.createElement(
                    "input"
                );


            slider.type =
                "range";


            slider.className =
                "task-slider";


            slider.min =
                "0";


            slider.max =
                "100";


            slider.step =
                "1";


            slider.value =
                task.progress;


            slider.style.setProperty(
                "--progress",
                `${task.progress}%`
            );


            // ---------------------------------------------
            // SLIDER INPUT
            // ---------------------------------------------

            slider.addEventListener(
                "input",
                () => {

                    const percentage =
                        Number(
                            slider.value
                        );


                    // Update progress
                    task.progress =
                        percentage;


                    // Automatically determine status
                    if (
                        percentage ===
                        0
                    ) {

                        task.status =
                            "pending";

                        task.completed =
                            false;

                    } else if (
                        percentage >=
                        100
                    ) {

                        task.progress =
                            100;

                        task.status =
                            "completed";

                        task.completed =
                            true;

                    } else {

                        task.status =
                            "in-progress";

                        task.completed =
                            false;

                    }


                    // Update card instantly
                    progressValue.textContent =
                        `${task.progress}%`;


                    slider.style.setProperty(
                        "--progress",
                        `${task.progress}%`
                    );


                    // Update status
                    updateStatusBadge(
                        status,
                        task.status
                    );


                    // Update checkbox
                    checkbox.checked =
                        task.status ===
                        "completed";


                    // Update completed styling
                    if (
                        task.status ===
                        "completed"
                    ) {

                        li.classList.add(
                            "completed"
                        );

                    } else {

                        li.classList.remove(
                            "completed"
                        );

                    }


                    // Save while dragging
                    saveTasks();

                    updateStats();

                }
            );


            // ---------------------------------------------
            // PROGRESS CONTAINER
            // ---------------------------------------------

            progressContainer.appendChild(
                progressInfo
            );


            progressContainer.appendChild(
                slider
            );


            // ---------------------------------------------
            // ADD CONTENT
            // ---------------------------------------------

            content.appendChild(
                title
            );


            content.appendChild(
                meta
            );


            content.appendChild(
                progressContainer
            );


            // ---------------------------------------------
            // ACTIONS
            // ---------------------------------------------

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "task-actions";


            // EDIT
            const editButton =
                document.createElement(
                    "button"
                );


            editButton.className =
                "edit-btn";


            editButton.textContent =
                "✏️";


            editButton.title =
                "Edit task";


            editButton.addEventListener(
                "click",
                () => {

                    openEditModal(
                        task
                    );

                }
            );


            // DELETE
            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-btn";


            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                "Delete task";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTask(
                        task.id
                    );

                }
            );


            actions.appendChild(
                editButton
            );


            actions.appendChild(
                deleteButton
            );


            // ---------------------------------------------
            // BUILD CARD
            // ---------------------------------------------

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


        saveTasks();

    }


    // =====================================================
    // STATUS BADGE
    // =====================================================

    function updateStatusBadge(
        badge,
        status
    ) {

        badge.className =
            `status-badge status-${status}`;


        if (
            status ===
            "completed"
        ) {

            badge.textContent =
                "🟢 Completed";

        } else if (
            status ===
            "in-progress"
        ) {

            badge.textContent =
                "🟡 In Progress";

        } else {

            badge.textContent =
                "⚪ Pending";

        }

    }


    // =====================================================
    // EDIT MODAL
    // =====================================================

    function openEditModal(task) {

        taskBeingEdited =
            task;


        editTaskInput.value =
            task.text;


        editPriorityInput.value =
            task.priority ||
            "medium";


        editDueDateInput.value =
            task.dueDate ||
            "";


        editProgressInput.value =
            task.progress || 0;


        editProgressValue.textContent =
            `${task.progress || 0}%`;


        updateEditSlider();


        editModal.classList.add(
            "show"
        );


        setTimeout(() => {

            editTaskInput.focus();

        }, 100);

    }


    // =====================================================
    // EDIT SLIDER
    // =====================================================

    editProgressInput.addEventListener(
        "input",
        () => {

            editProgressValue.textContent =
                `${editProgressInput.value}%`;


            updateEditSlider();

        }
    );


    function updateEditSlider() {

        const value =
            Number(
                editProgressInput.value
            );


        const percentage =
            value;


        editProgressInput.style.background =
            `linear-gradient(
                to right,
                var(--emerald) 0%,
                var(--emerald) ${percentage}%,
                #e5e7eb ${percentage}%,
                #e5e7eb 100%
            )`;

    }


    // =====================================================
    // SAVE EDIT
    // =====================================================

    saveEditButton.addEventListener(
        "click",
        () => {

            if (!taskBeingEdited) {

                return;

            }


            const text =
                editTaskInput.value.trim();


            if (!text) {

                alert(
                    "Task cannot be empty."
                );

                editTaskInput.focus();

                return;

            }


            let progress =
                Number(
                    editProgressInput.value
                );


            // Update task
            taskBeingEdited.text =
                text;


            taskBeingEdited.priority =
                editPriorityInput.value;


            taskBeingEdited.dueDate =
                editDueDateInput.value;


            taskBeingEdited.progress =
                progress;


            // Automatically determine status
            if (
                progress === 0
            ) {

                taskBeingEdited.status =
                    "pending";

                taskBeingEdited.completed =
                    false;

            } else if (
                progress >= 100
            ) {

                taskBeingEdited.progress =
                    100;

                taskBeingEdited.status =
                    "completed";

                taskBeingEdited.completed =
                    true;

            } else {

                taskBeingEdited.status =
                    "in-progress";

                taskBeingEdited.completed =
                    false;

            }


            saveTasks();

            displayTasks();

            updateStats();

            closeEditModal();

        }
    );


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    function closeEditModal() {

        editModal.classList.remove(
            "show"
        );


        taskBeingEdited =
            null;

    }


    cancelEditButton.addEventListener(
        "click",
        closeEditModal
    );


    closeModalButton.addEventListener(
        "click",
        closeEditModal
    );


    editModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                editModal
            ) {

                closeEditModal();

            }

        }
    );


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


    // =====================================================
    // DELETE
    // =====================================================

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
                    task.id !==
                    taskId
            );


        saveTasks();

        displayTasks();

        updateStats();

    }


    // =====================================================
    // SEARCH
    // =====================================================

    searchInput.addEventListener(
        "input",
        () => {

            searchTerm =
                searchInput.value.trim();

            displayTasks();

        }
    );


    // =====================================================
    // FILTERS
    // =====================================================

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                currentFilter =
                    button.dataset.filter;


                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                displayTasks();

            }
        );

    });


    // =====================================================
    // CLEAR COMPLETED
    // =====================================================

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
                tasks[currentField] ||
                [];


            const completed =
                categoryTasks.filter(
                    task =>
                        task.status ===
                        "completed"
                );


            if (
                completed.length ===
                0
            ) {

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
                        task.status !==
                        "completed"
                );


            saveTasks();

            displayTasks();

            updateStats();

        }
    );


    // =====================================================
    // STATISTICS
    // =====================================================

    function updateStats() {

        const categoryTasks =
            tasks[currentField] ||
            [];


        const total =
            categoryTasks.length;


        const completed =
            categoryTasks.filter(
                task =>
                    task.status ===
                    "completed"
            ).length;


        const pending =
            categoryTasks.filter(
                task =>
                    task.status !==
                    "completed"
            ).length;


        // Average progress
        let average =
            0;


        if (total > 0) {

            const totalProgress =
                categoryTasks.reduce(
                    (sum, task) => {

                        return sum +
                            Number(
                                task.progress ||
                                0
                            );

                    },
                    0
                );


            average =
                Math.round(
                    totalProgress /
                    total
                );

        }


        totalTasks.textContent =
            total;


        pendingTasks.textContent =
            pending;


        completedTasks.textContent =
            completed;


        progressPercent.textContent =
            `${average}%`;

    }


    // =====================================================
    // SAVE
    // =====================================================

    function saveTasks() {

        try {

            localStorage.setItem(
                "taskhubTasks",
                JSON.stringify(
                    tasks
                )
            );

        } catch (error) {

            console.error(
                "Could not save tasks.",
                error
            );

        }

    }


    // =====================================================
    // DATE FUNCTIONS
    // =====================================================

    function formatDate(
        dateString
    ) {

        if (!dateString) {

            return "";

        }


        const date =
            new Date(
                dateString
            );


        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    function formatDueDate(
        dateString
    ) {

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


    function isOverdue(
        dateString
    ) {

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