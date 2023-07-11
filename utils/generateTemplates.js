function generateTask(task) {
    return `<div class="task" data-name="${task.name}" data-id="${task.id}">
        <div class="flex w-full justify-between items-center
         mb-2 rounded-md cursor-pointer">
            <div class="flex gap-1 items-center">
                <button class="done-btn text-gray-300 text-2xl hover:text-opacity-80">
                    <i class="fa-solid fa-circle-check"></i>
                </button>
                <p class="task-name text-black font-bold ml-2">
                    ${ task.name }
                </p>
            </div>
            <div class="text-gray-500 flex">
                <p class="tracking-wider"><span class="task-pomos-done text-lg">${ task.pomosDone }</span>
                    / <span class="task-pomos-need">${ task.pomosNeed }</span></p>
                <button class="toggle-update-btn border py-1 px-3 ml-2
                     rounded-md hover:bg-gray-300 relative active:top-0.5">
                    <i class="fa-solid fa-ellipsis-vertical text-2lg"></i>
                </button>
            </div>
        </div>
        ${
            task.description && 
            `<div class="bg-yellow-100 w-[28rem] mx-4\n text-gray-700 p-2 text-left rounded shadow">
                ${task.description}           
            </div>`
        }
        
        <form action="/update" method="POST" class="w-full
                bg-white rounded-t-md py-4 px-6 hidden
                text-black flex flex-col items-start relative mb-12 cursor-default"
              id="update-form">
            <label for="" class="w-full">
                <input type="text" placeholder="What are you working on?" class="text-2xl border-0
                focus:outline-none w-full my-2" name="name" id="name" required value="${task.name}">
            </label>
            <p class="text-left font-bold mb-4">Est Pomodoros</p>
            <label for="pomosNeed">
                <input type="number" min="1" class="bg-gray-200 w-16 mb-4
                focus:outline-none rounded-md text-black p-1 indent-1.5" name="pomosNeed" id="pomosNeed" 
                value="${task.pomosNeed}" required>
            </label>
        
        <!--    <button class="text-gray-600 text-sm underline" id="add-note-btn">+ Add Note</button>-->
        
            <textarea name="description" id="description" cols="55" rows="5"
                      placeholder="Leave blank if you want"
                      class="rounded-md bg-gray-200 resize-y mt-4 focus:outline-none p-2">${task.description}"
            </textarea>
        
            <div class="absolute left-0 top-full w-full p-3 rounded-b-md
                    flex justify-end gap-3 bg-gray-300">
        
                <button class="text-gray-500 text-sm mr-auto ml-4 font-bold" id="delete-btn">Delete</button>
                <button class="text-gray-500 text-sm font-bold" id="cancel-add-btn">Cancel</button>
                <button class="bg-black text-white py-2 px-4 rounded" id="submit-btn">Save</button>
            </div>
        
        </form>
    </div>`
}

module.exports.getTask = generateTask;