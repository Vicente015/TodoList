
function genRandomId () {
  return Math.random().toString(30).substring(2)
}

function createTask ({ name, save = true, id, state = false }) {
  id ||= genRandomId()
  if (save) saveToStorage({ id, name, state })
  let newTask = `
  <li class="task ${state === true && 'disabled-task'}" id=${id} >
    <input onclick="onCheckboxChange(event)" type="checkbox" name="check" id="check" ${state === true && 'checked'}>
      <h4>${name.trim()}</h4>
    <div class="icons">
      <i title="Editar tarea" onclick="editTask(this)" class="fa-solid fa-pen-to-square"></i>
      <i title="Borrar tarea" onclick="removeTask(this)" class="fa-solid fa-trash"></i>
    </div>
  </li>
  `

  // ? Añade el elemento al principio de la lista
  const tasksListElement = document.getElementById('tasks')
  tasksListElement.innerHTML = newTask + tasksListElement.innerHTML
}

function onInputChange (event) {
  const value = event.target.value
  if (!value || value === ' ') return
  createTask({ name: value })
  // Reiniciar valor del input al añadir tarea
  event.target.value = ''
}

function onCheckboxChange (event) {
  const parentElement = event.target.parentElement
  parentElement.classList.toggle('disabled-task')
  const taskId = parentElement.id
  console.debug(parentElement)
  saveToStorage({ id: taskId, state: parentElement.classList.contains('disabled-task') })
}

function removeTask (icon) {
  const parent = icon.parentElement.parentElement
  const taskTitleElement = Array.from(parent.children).at(1)
  removeFromStorage(taskTitleElement.innerText)
  parent.remove()
}

function editTask (icon) {
  /**
   * @type {HTMLParagraphElement}
   */
  const taskTitleElement = Array.from(icon.parentElement.parentElement.children).at(1)
  taskTitleElement.toggleAttribute('contenteditable')
  taskTitleElement.focus()
  const taskId = icon.parentElement.parentElement.id
  saveToStorage({ id: taskId, name: taskTitleElement.innerText.trim() })
}

function saveToStorage (task) {
  if (!task) return
  const setTasks = (tasks) => window.localStorage.setItem('tasks', JSON.stringify(tasks))
  let tasks = JSON.parse(window.localStorage.getItem('tasks'))

  if (Array.isArray(tasks)) {
    const taskIndex = tasks.findIndex(({ id }) => id === task.id)
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...task }
    } else {
      tasks.push(task)
    }
  } else {
    tasks = [task]
  }
  setTasks(tasks)
}

function removeFromStorage (task) {
  /**
   * @type {string[]}
   */
  let tasks = JSON.parse(window.localStorage.getItem('tasks'))
  if (Array.isArray(tasks)) {
    const taskIndex = tasks.findIndex(({ id }) => id === task.id)
    tasks.splice(taskIndex, 1)
  }
  window.localStorage.setItem('tasks', JSON.stringify(tasks))
}

function main () {
  const taskInput = document.getElementById('new_task')
  taskInput.value = null
  taskInput.addEventListener('change', onInputChange)

  let tasksFromLocalStorage = JSON.parse(window.localStorage.getItem('tasks'))
  if (!Array.isArray(tasksFromLocalStorage) || tasksFromLocalStorage.length < 1) {
    document.querySelector('ul').innerHTML = "No hay tareas."
  } else {
    for (let task of tasksFromLocalStorage) {
      createTask(task)
    }
  }
}

main()
