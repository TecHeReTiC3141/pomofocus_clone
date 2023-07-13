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
        modesBtns.each(function () {
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
        let start = Date.now(), timeNeeded = Math.max(1000 * (pomosLeft * timeModes['Pomodoro'].time +
            (pomosLeft - Math.floor(pomosLeft / 3) - 1) * timeModes['Short Break'].time +
            Math.floor((pomosLeft - 1) / 3) * timeModes['Long Break'].time), 0);
        if (pomosLeft) {
            start += timeNeeded;
        }

        const finishTime = new Date(start);
        let mins = finishTime.getMinutes().toString();
        if (mins.length < 2) {
            mins = '0' + mins;
        }
        $('.finish-time').text(`${finishTime.getHours()}:${mins}`);
        $('.time-needed').text((timeNeeded / 3600000).toFixed(1));
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
    modesBtns.each(function () {
        $(this).on('click', function () {
            currentMode = $(this).text()
            setState();
        })
    })
    setState();
    $('.toggle-task').on('click', function () {
        taskActive = !taskActive;
        $('.forward-btn').toggleClass('hidden');
        $('.time-left-container').toggleClass('hidden');
        $(this).text(taskActive ? 'Pause' : 'Start');
    })

    $('.forward-btn').on('click', function () {
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
        task.data('name', newData.name);
        $('.task-name', task).text(newData.name);
        $('.task-pomos-need', task).text(newData.pomosNeed);
        $('.task-description', task).text(newData.description);
    }

    function initTask(task) {

        task.on('click', function () {
            $('.task').each(function () {
                $(this).removeClass('active');
            });
            task.addClass('active');
            $('.current-task-name').text(task.data('name'));
        })

        // updating and deleting tasks
        $('.done-btn', task).on('click', function (ev) {
            ev.stopPropagation();
            $.get(`/toggle_done/${task.data('id')}`, {},
                data => {
                    if (data?.success) {
                        $(task).toggleClass('done');
                        const curTotPomosNeed = +$('.total-pomos-need').text();
                        const curTotPomosDone = +$('.total-pomos-done').text();
                        if (task.hasClass('done')) {
                            $('.total-pomos-need').text(curTotPomosNeed - +$('.task-pomos-need', task).text());
                            $('.total-pomos-done').text(curTotPomosDone - +$('.task-pomos-done', task).text());
                        } else {
                            $('.total-pomos-need').text(curTotPomosNeed + +$('.task-pomos-need', task).text());
                            $('.total-pomos-done').text(curTotPomosDone + +$('.task-pomos-done', task).text());
                        }
                        setFinishTime();
                    }
                })
        })

        const updateForm = $('#update-form', task);

        function resetUpdateForm() {
            $('#name', updateForm).val($('.task-name', task).text());
            $('#pomosNeed', updateForm).val($('.task-pomos-need', task).text());
            $('#description', updateForm).val($('.task-description', task).text().trim());
        }

        $('.toggle-update-btn', task).on('click', function (ev) {
            if (!$('.task.updated').length) {
                ev.stopPropagation();
                $(task).addClass('updated');
                resetUpdateForm()
                updateForm.removeClass('hidden');
            }

        });

        updateForm.on('click', function (ev) {
            ev.stopPropagation();
        })

        document.addEventListener('click', function (ev) {
            if (!updateForm.hasClass('hidden')) {
                const isCancelled = confirm('The change will be lost. Are you sure you want to close it?');
                if (isCancelled) {
                    $(task).removeClass('updated');
                    $('#update-form', task).addClass('hidden');
                }
            }
        })

        $('#delete-btn', updateForm).on('click', function (ev) {
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

        $('#cancel-add-btn', updateForm).on('click', function (ev) {
            ev.preventDefault();
            $(task).removeClass('updated');
            $('#update-form', task).addClass('hidden');
        })

        $('#submit-btn', updateForm).on('click', function (ev) {
            ev.preventDefault();
            $.post('/update?_method=PUT', {
                id: task.data('id'),
                name: $('#name', updateForm).val(),
                pomosNeed: +$('#pomosNeed', updateForm).val(),
                description: $('#description', updateForm).val(),
            }, data => {
                console.log(data);
                updateTask(task, data);
                $(task).removeClass('updated');
                $('#update-form', task).addClass('hidden');
            })
        })
    }

    $('.task').each(function () {
        initTask($(this));
    });

    $('.add-task').on('click', function () {
        $(this).addClass('hidden');
        $('#add-form').removeClass('hidden');
    });

    // form for adding new Tasks
    const addForm = $('#add-form');

    $('#cancel-add-btn', addForm).on('click', function (ev) {
        ev.preventDefault();
        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
        $('#add-form #description').addClass('hidden');
        $('#add-form .add-note-btn').removeClass('hidden');
    })

    $('.add-note-btn', addForm).on('click', function (ev) {
        ev.preventDefault();
        $(this).addClass('hidden');
        $('#description', addForm).removeClass('hidden').focus();
    })

    $('.submit-btn', addForm).on('click', function (ev) {
        ev.preventDefault();

        $.post('/new', {
            name: $('#name', addForm).val(),
            pomosNeed: $('#pomosNeed', addForm).val(),
            description: $('#description', addForm).val(),
        }, data => {
            const newTask = $('.blank-task .task').clone();
            updateTask(newTask, data);
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

    /*
    *
    * TODO: search for better font
    * TODO: add dark mode
    * TODO: implement user menu
    * TODO: implement adding task using cookies
    * */
    // Tasks menu

    const tasksMenu =  $('.tasks-menu');

    $('.toggle-tasks-menu').on('click', function (ev) {
        ev.stopPropagation();
        tasksMenu.toggleClass('hidden');
    })

    tasksMenu.on('click', function (ev) {
        ev.stopPropagation();
    })

    $(document).on('click', function () {
        tasksMenu.addClass('hidden');
    })

    $('.clear-finished-tasks', tasksMenu).on('click', function() {
        $.post('/delete-finished-tasks?_method=DELETE', {}, data => {
            if (data?.success) {
                $('.task.done').addClass('hidden');
            }
        });
    })

    $('.clear-all-tasks', tasksMenu).on('click', function() {
        $.post('/delete-all-tasks?_method=DELETE', {}, data => {
            if (data?.success) {
                $('.task').addClass('hidden');
            }
        });
    })

    $('.clear-act-pomos', tasksMenu).on('click', function() {
        $.post('/clear-act-pomos', {}, data => {
            if (data?.success) {
                $('.task .task-pomos-done').text(0);
                $('.total-pomos-done').text(0);
                setFinishTime();
            }
        });
    })

    // user menu

    const userMenu = $('.user-menu');

    $('.user-btn').on('click', function(ev) {
        ev.stopPropagation();
        userMenu.toggleClass('hidden');
    })

    userMenu.on('click', function (ev) {
        ev.stopPropagation();
    })

    $(document).on('click', function () {
        userMenu.addClass('hidden');
    })

    $('.logout', userMenu).on('click', function() {
        $.post('/users/logout?_method=DELETE', {});
    })

    $('.open-profile', userMenu).on('click', function() {
        userProfile.removeClass('hidden');
        userMenu.addClass('hidden');
    })

    const userProfile = $('.user-profile');

    $('.close-profile, #cancel-update-btn', userProfile).on('click', function(ev) {
        ev.preventDefault();
        userProfile.addClass('hidden');
    })

})
