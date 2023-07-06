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
            console.log(currentTime);
            timeLeft.text(setLeftTime(--currentTime));
            let timeLeftRatio = (timeModes[currentMode].time - currentTime) / timeModes[currentMode].time
            let timeLeftBarWidth = Math.floor($('.time-left-container').width() * timeLeftRatio);
            console.log(currentTime, timeLeftRatio, timeLeftBarWidth);
            $('.time-left-bar').width(timeLeftBarWidth);
        } else if (currentTime === 0) {
            if (currentMode === 'Pomodoro') {
                currentMode = 'Short Break';
            } else {
                currentMode = 'Pomodoro';
            }
            $('.time-left-container').addClass('hidden');
            setState();
        }
    }, 1000)


})

