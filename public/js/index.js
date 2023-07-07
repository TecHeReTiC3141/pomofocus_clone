

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

    const timeModes = {
        'Pomodoro': {
            time: 15,
            color: 'bg-pomodoro',
        },
        'Short Break': {
            time: 3,
            color: 'bg-shortBreak',
        },
        'Long Break': {
            time: 6,
            color: 'bg-longBreak',
        },
    }
    // setting current state
    let currentMode = $('.modes button.active').text(),
        currentTime = timeModes[currentMode];
    let taskActive = false;
    const timeLeft = $('.time-left');

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
                $.get(`/update/${currentTask.data('id')}`, {}, (data) => {
                    const {pomosDone, pomosNeed} = data;
                    $('.task-pomos-need', currentTask).text(pomosNeed);
                    $('.task-pomos-done', currentTask).text(pomosDone);
                })
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

    $('.task').each(function() {
        $(this).on('click', function() {
            $('.task').each(function() {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            $('.current-task-name').text($(this).data('name'));
        })
    })

    $('.add-task').on('click', function() {
        $(this).addClass('hidden');
        $('#add-form').removeClass('hidden');
    });

    $('#cancel-add-btn').on('click', function(ev) {
        ev.preventDefault();
        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
    })

    // form for adding new Tasks
    const addForm = $('#add-form');
    $('.submit-btn', addForm).on('click', function(ev) {
        ev.preventDefault();

        $.post('/new', {
            name: $('#name', addForm).val(),
            pomosNeed: $('#pomosNeed', addForm).val(),
        }, data => {
            const newTask = $(data);
            $('.tasks').append(newTask);
        })

        $('input, textarea', addForm).val('');

        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');

    })

    $('#add-note-btn').on('click', function(ev) {
        ev.preventDefault();
    })



})

