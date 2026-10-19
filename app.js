 
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const emptyMessage = document.getElementById("emptyMessage");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];

let currentFilter = "all";

// Browser se saved tasks load karo
try {
  const savedTasks = localStorage.getItem("myTodoTasks");

  if (savedTasks) {
    const parsedTasks = JSON.parse(savedTasks);

    if (Array.isArray(parsedTasks)) {
      tasks = parsedTasks.filter(task =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
      );
    }
  }
} catch (error) {
  console.error("Tasks load nahi ho sake:", error);
}

// Tasks ko browser mein save karo
function saveTasks() {
  try {
    localStorage.setItem("myTodoTasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Tasks save nahi ho sake:", error);
  }
}

// Naya task add karo
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (text === "") {
    return;
  }

  const newTask = {
    id: crypto.randomUUID(),
    text: text,
    completed: false
  };

  tasks.unshift(newTask);

  saveTasks();

  currentFilter = "all";
  updateActiveFilter();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
});

// Filter ke according tasks dikhao
function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

// Saare tasks screen par render karo
function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task-item";

    if (task.completed) {
      li.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      "Mark task as completed"
    );

    checkbox.addEventListener("change", function () {
      task.completed = checkbox.checked;

      saveTasks();
      renderTasks();
    });

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", function () {
      tasks = tasks.filter(item => item.id !== task.id);

      saveTasks();
      renderTasks();
    });

    li.append(checkbox, span, deleteButton);
    taskList.appendChild(li);
  });

  // Empty message
  emptyMessage.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    if (currentFilter === "pending" && tasks.length > 0) {
      emptyMessage.textContent = "No pending tasks!";
    } else if (
      currentFilter === "completed" &&
      tasks.length > 0
    ) {
      emptyMessage.textContent = "No completed tasks yet!";
    } else {
      emptyMessage.textContent =
        "No tasks yet. Add your first task!";
    }
  }

  // Statistics update karo
  totalTasks.textContent = tasks.length;

  pendingTasks.textContent =
    tasks.filter(task => !task.completed).length;

  completedTasks.textContent =
    tasks.filter(task => task.completed).length;
}

// Filter buttons ko active dikhao
function updateActiveFilter() {
  filterButtons.forEach(function (button) {
    const isActive =
      button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
  });
}

// All, Pending aur Completed filters
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;

    updateActiveFilter();
    renderTasks();
  });
});

// Saare completed tasks clear karo
clearCompleted.addEventListener("click", function () {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
});

// Page open hone par tasks dikhao
renderTasks();
