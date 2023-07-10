function setLeftTime(timeLeft) {
    let le = Math.floor(timeLeft / 60).toString(), ri = (timeLeft % 60).toString();
    if (le.length === 1) {
        le = '0' + le;
    }
    if (ri.length === 1) {
        ri = '0' + ri;
    }
    return `${le}:${ri}`;
}

$(document).ready(() => {

    function setState() {
        modesBtns.each(function() {
            $(this).removeClass('active');
        })
        const activeBtn = $(`#${currentMode.toLowerCase().replace(' ', '-')}`);
        activeBtn.addClass('active');

        currentTime = timeModes[currentMode].time;
        taskActive = false;

        timeLeft.text(setLeftTime(currentTime));
        $('body')
            .removeClass('bg-pomodoro bg-shortBreak bg-longBreak')
            .addClass(timeModes[currentMode].color);

        $('.toggle-task').text('Start');
        $('.forward-btn').addClass('hidden');
    }

    function setFinishTime() {
        let pomosLeft = Number($('.total-pomos-need').text()) - Number($('.total-pomos-done').text());
        let start = Date.now();
        if (pomosLeft) {
            start += 1000 * (pomosLeft * timeModes['Pomodoro'].time +
                (pomosLeft - Math.floor(pomosLeft / 3) - 1) * timeModes['Short Break'].time +
                Math.floor((pomosLeft - 1) / 3) * timeModes['Long Break'].time);
        }

        const finishTime = new Date(start);
        $('.finish-time').text(`${finishTime.getHours()}:${finishTime.getMinutes()}`);
    }


    const timeModes = {
        'Pomodoro': {
            time: 1500,
            color: 'bg-pomodoro',
        },
        'Short Break': {
            time: 300,
            color: 'bg-shortBreak',
        },
        'Long Break': {
            time: 600,
            color: 'bg-longBreak',
        },
    }
    // setting current state
    let currentMode = $('.modes button.active').text(),
        currentTime = timeModes[currentMode];
    let taskActive = false;
    const timeLeft = $('.time-left');
    setFinishTime();

    const modesBtns = $('.modes button')
    modesBtns.each(function() {
        $(this).on('click', function() {
            currentMode = $(this).text()
            setState();
        })
    })

    $('.toggle-task').on('click', function() {
        taskActive = !taskActive;
        $('.forward-btn').toggleClass('hidden');
        $('.time-left-container').toggleClass('hidden');
        $(this).text(taskActive ? 'Pause' : 'Start');
    })

    $('.forward-btn').on('click', function() {
        currentTime = 0;
    })

    setInterval(() => {
        if (taskActive && currentTime > 0) {

            timeLeft.text(setLeftTime(--currentTime));
            let timeLeftRatio = (timeModes[currentMode].time - currentTime) / timeModes[currentMode].time
            let timeLeftBarWidth = Math.floor($('.time-left-container').width() * timeLeftRatio);
            $('.time-left-bar').width(timeLeftBarWidth);
        } else if (currentTime === 0) {
            if (currentMode === 'Pomodoro') {
                currentMode = 'Short Break';
                const currentTask = $('.task.active');
                $.get(`/task_done/${currentTask.data('id')}`, {}, (data) => {
                    const {pomosDone, pomosNeed} = data;
                    $('.task-pomos-need', currentTask).text(pomosNeed);
                    $('.task-pomos-done', currentTask).text(pomosDone);
                    setFinishTime();
                });

            } else {
                currentMode = 'Pomodoro';
            }
            $('.time-left-bar').width(0);

            $('.time-left-container').addClass('hidden');

            setState();
        }
    }, 1000)

    // -----------------TASKS-------------------
    const tasks = document.querySelector('.tasks');
    let sortable = Sortable.create(tasks,
        {
            animation: 150,
            ghostClass: 'ghost',
        });

    $('.task:first-child').addClass('active');

    function updateTask(task, newData) {

    }

    function initTask(task) {
        task.on('click', function() {
            $('.task').each(function() {
               $(this).removeClass('active');
            });
            task.addClass('active');
            $('.current-task-name').text(task.data('name'));
        })

        $('.done-btn', task).on('click', function(ev) {
            ev.stopPropagation();
            $(task).toggleClass('done');
        })

        $('.toggle-update-btn', task).on('click', function(ev) {
            ev.stopPropagation();
            $(task).addClass('updated');
            $('#update-form', task).removeClass('hidden');
        })

        const updateForm = $('#update-form', task);

        $('#delete-btn', updateForm).on('click', function(ev) {
            ev.preventDefault();
            $.post('/delete?_method=DELETE', {
                id: task.data('id'),
            }, (data) => {
                if (data?.deleted === true) {
                    task.addClass('hidden');
                    const curTotPomosNeed = Number($('.total-pomos-need').text());
                    $('.total-pomos-need').text(curTotPomosNeed - +$('.task-pomos-need', task).text());

                    const curTotPomosDone = Number($('.total-pomos-done').text());
                    $('.total-pomos-done').text(curTotPomosDone - +$('.task-pomos-done', task).text());

                    setFinishTime();
                }
            })
        })

        $('#cancel-add-btn', updateForm).on('click', function(ev) {
            ev.preventDefault();
            $(task).removeClass('updated');
            $('#update-form', task).addClass('hidden');
        })

        $('#submit-btn', updateForm).on('click', function(ev) {
            ev.preventDefault();
            $.post('/update?_method=PUT', {
                id: task.data('id'),
                name: $('#name', updateForm).val(),
                pomosNeed: +$('#pomosNeed', updateForm).val(),
                description: $('#description', updateForm).val(),
            }, data => {
                console.log(data);
                updateTask(task, data);
            })
        })
    }

    $('.task').each(function() {
        initTask($(this));
    });

    $('.add-task').on('click', function() {
        $(this).addClass('hidden');
        $('#add-form').removeClass('hidden');
    });

    $('#cancel-add-btn').on('click', function(ev) {
        ev.preventDefault();
        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
        $('#add-form #description').addClass('hidden');
        $('#add-form .add-note-btn').removeClass('hidden');
    })

    // form for adding new Tasks
    const addForm = $('#add-form');

    $('.add-note-btn', addForm).on('click', function(ev) {
        ev.preventDefault();
        $(this).addClass('hidden');
        $('#description', addForm).removeClass('hidden').focus();
    })

    $('.submit-btn', addForm).on('click', function(ev) {
        ev.preventDefault();

        $.post('/new', {
            name: $('#name', addForm).val(),
            pomosNeed: $('#pomosNeed', addForm).val(),
            description: $('#description', addForm).val(),
        }, data => {
            const newTask = $(data);
            initTask(newTask);
            $('.tasks').append(newTask);
        })

        const curTotPomosNeed = Number($('.total-pomos-need').text());

        $('.total-pomos-need').text(curTotPomosNeed + +$('#pomosNeed', addForm).val());

        setFinishTime();

        $('input, textarea', addForm).val('');

        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
    })

    $('#description', addForm).prop('selectionEnd', 1);

    // updating tasks
    /*
    * TODO: implement done button (tick);
    * TODO: implement task updating (form and button);
    * */


})

