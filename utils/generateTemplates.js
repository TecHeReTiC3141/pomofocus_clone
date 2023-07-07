function generateTask(task) {
    return `<div class="task" data-name="${task.name}" data-id="${task.id}">
        <div>
            <div class="flex gap-1 items-center">
                <button class="text-gray-300 text-2xl hover:text-opacity-80">
                    <i class="fa-solid fa-circle-check"></i>
                </button>
                <p class="text-black font-bold">
                    ${ task.name }
                </p>
            </div>
            <div class="text-gray-500 flex">
                <p class="tracking-wider"><span class="task-pomos-done text-lg">${ task.pomosDone }</span>
                    / <span class="task-pomos-need">${ task.pomosNeed }</span></p>
                <button class="border py-1 px-4 ml-2 rounded-md">
                    <i class="fa-solid fa-ellipsis-vertical text-2lg"></i>
                </button>
            </div>
        </div>
        
    </div>`
}

module.exports.getTask = generateTask;