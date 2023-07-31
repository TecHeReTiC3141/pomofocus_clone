/*
    *
    * TODO: search for better font
    * TODO: implement adding task using cookies
    *  Tasks for TOMORROW:
    * TODO: add top users;
    *  Add information about pomofocus usage in readme and on main page
    * TODO: start implementing responsive layout;
    *
*/

async function generateUsers() {

    const randomUserGeneratorURL = 'https://randomuser.me/api/';
    const randomUserGeneratorSearchParams = new URLSearchParams({
        results: 100,
        inc: 'name,email,login,picture',
        noinfo: true,
        // dl: true,
    })
    $.get(`${randomUserGeneratorURL}?${randomUserGeneratorSearchParams}`, {}, data => {
        for (let user of data.results) {
            user.name = user.name.first + ' ' + user.name.last;
            user.avatar = user.picture.medium;
            user.password = user.login.password;

            $.post('/users/create_user', { ...user }, data => {
                console.log(data);
            } )

        }
    })
}
//
// (async () => {
//     await generateUsers();
// })();

function processForm(form) {
    let data = {};
    for (let { name, value } of form.serializeArray()) {
        data[name] = value;
    }

    $('input:checkbox', form).map(function() {
        data[this.name] = this.checked;
    })
    console.log(data);
    return data;
}

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
        time: 15,
        color: 'pomodoro',
    },
    'Short Break': {
        time: 3,
        color: 'shortBreak',
    },
    'Long Break': {
        time: 6,
        color: 'longBreak',
    },
}

$(document).ready(() => {

    let notificationsAllowed, notification;
    (async () => {
        notificationsAllowed = (await Notification.requestPermission()) === 'granted';
        console.log(notificationsAllowed);
    })()

    let userSettings = {};

    function updateSettings(newSettings) {
        userSettings = newSettings;
        timeModes['Pomodoro'].time = userSettings.pomoTime * 60;
        timeModes['Short Break'].time = userSettings.shortBreakTime * 60;
        timeModes['Long Break'].time = userSettings.longBreakTime * 60;
        setState();
    }

    function setUser() {
        $.get('/users/get_user_settings', {}, data => {
            updateSettings(data);

            modesBtns.each(function () {
                $(this).on('click', function () {
                    currentMode = $(this).text()
                    setState();
                })
            })
            setState();
        })
    }

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
            .addClass('bg-' + timeModes[currentMode].color);

        $('.toggle-task')
            .removeClass('text-pomodoro text-shortBreak text-longBreak')
            .addClass('text-' + timeModes[currentMode].color);

        $('.toggle-task').text('Start');
        $('.forward-btn').addClass('hidden');

        getTotalPomos();

        document.title = `${timeLeft.text()} - ${currentMode === 'Pomodoro' ? 
            $('.current-task-name').text() : 'Time for a break'}`;
    }

    // setting current state
    let currentMode = $('.modes button.active').text(),
        currentTime = timeModes[currentMode],
        lastStart = Date.now();
    let taskActive = false;
    const timeLeft = $('.time-left');

    const modesBtns = $('.modes button');

    setUser();

    function toggleDarkMode() {
        console.log(userSettings);
        if (userSettings.darkMode === 'false' || !userSettings.darkMode) return;
        if (taskActive) {
            $('body')
                .removeClass('bg-pomodoro bg-shortBreak bg-longBreak')
                .addClass('bg-black');

            $('.toggle-task')
                .removeClass('text-pomodoro text-shortBreak text-longBreak')
                .addClass('text-black');
        } else {
            $('body')
                .removeClass('bg-pomodoro bg-shortBreak bg-longBreak')
                .addClass('bg-' + timeModes[currentMode].color);

            $('.toggle-task')
                .removeClass('text-pomodoro text-shortBreak text-longBreak')
                .addClass('text-' + timeModes[currentMode].color);
        }
        $('.logo, .user-btn, .modes').toggleClass('opacity-0');
        $('.tasks, .pomo-stats, .add-task, .tasks-header').toggleClass('hidden');
        $('body').toggleClass('dark');
    }

    $('.toggle-task').on('click', function () {
        taskActive = !taskActive;
        $('.forward-btn').toggleClass('hidden');
        $('.time-left-container').toggleClass('hidden');
        $(this).text(taskActive ? 'Pause' : 'Start');
        if (currentMode === 'Pomodoro') {
            if (taskActive) lastStart = Date.now();
            else {
                console.log(typeof(lastStart))
                $.post('/save_task', {
                    name: $('.current-task-name').text(),
                    startTime: lastStart,
                    finishTime: Date.now(),
                }, data => {
                    if (data.success && data.newTask) {
                        $('.user-hours-focused').text((+data.totalHoursFocused / 60).toFixed(1) )
                        $('.user-days-accessed').text(data.totalDaysAccessed);
                        $('.user-day-streak').text(data.dayStreak);
                    }
                })
            }
        }
        toggleDarkMode();
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

            document.title = `${timeLeft.text()} - ${currentMode === 'Pomodoro' ?
                $('.current-task-name').text() : 'Time for a break'}`;

        } else if (currentTime === 0) {
            if (currentMode === 'Pomodoro') {
                currentMode = (+$('.total-pomos-done').text() + 1) % userSettings.longBreakInterval === 0
                    ? 'Long Break' : 'Short Break';
                const currentTask = $('.task.active');
                $.get(`/task_done/${currentTask.data('id')}`, {}, data => {
                    const {pomosDone, pomosNeed} = data;
                    $('.task-pomos-need', currentTask).text(pomosNeed);
                    $('.task-pomos-done', currentTask).text(pomosDone);
                    getTotalPomos();
                    console.log( +$('.total-pomos-done').text() )
                });
                if (notificationsAllowed && document.visibilityState === 'hidden') {
                    notification = new Notification(`Time to take a ${currentMode.toLowerCase()}!`)
                    notification.onclick = function() {
                        window.focus();
                    }
                }
                $.post('/save_task', {
                    name: $('.current-task-name').text(),
                    startTime: lastStart,
                    finishTime: Date.now(),
                }, () => {});

            } else {
                currentMode = 'Pomodoro';
                if (notificationsAllowed && document.visibilityState === 'hidden') {
                    notification = new Notification('Time to focus!')
                    notification.onclick = function() {
                        window.focus();
                    }
                }
            }
            $('.time-left-bar').width(0);

            $('.time-left-container').addClass('hidden');
            toggleDarkMode();
            setState();
        }
    }, 1000)

    // -----------------TASKS-------------------
    const tasks = document.querySelector('.tasks');
    if (tasks) {
        let sortable = Sortable.create(tasks,
            {
                animation: 150,
                ghostClass: 'ghost',
            });
    }


    function updateTask(task, newData) {
        task.data('name', newData.name);
        $('.task-name', task).text(newData.name);
        $('.task-pomos-need', task).text(newData.pomosNeed);
        $('.task-description', task).text(newData.description);
        if (newData.description) {
            $('.task-description', task).removeClass('hidden');
        } else {
            $('.task-description', task).addClass('hidden');

        }
    }

    function getTotalPomos() {
        let totalPomosNeed = 0, totalPomosDone = 0;
        $('.task').each(function() {
            if ($(this).hasClass('done') || $(this).hasClass('hidden')) return;
            totalPomosNeed += +$('.task-pomos-need', this).text();
            totalPomosDone += +$('.task-pomos-done', this).text();
        })
        console.log(totalPomosNeed, totalPomosDone);
        $('.total-pomos-need').text(totalPomosNeed);
        $('.total-pomos-done').text(totalPomosDone);
        setFinishTime();
    }

    function initTask(task) {

        task.on('click', function () {
            if (taskActive && currentMode === 'Pomodoro') {
                const confTaskSwitch = confirm('Are you sure to switch the task?');
                if (!confTaskSwitch) return;
            }
            $('.task').each(function () {
                $(this).removeClass('active');
            });
            task.addClass('active');
            $('.current-task-name').text(task.data('name'));
            if (currentMode === 'Pomodoro') {
                document.title = `${timeLeft.text()} - ${$('.current-task-name').text()}`;
            }
        })

        // updating and deleting tasks
        $('.done-btn', task).on('click', function (ev) {
            ev.stopPropagation();
            $.get(`/toggle_done/${task.data('id')}`, {},
                data => {
                    if (data?.success) {
                        $(task).toggleClass('done');
                        getTotalPomos()
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
            if (!updateForm.hasClass('hidden') && !task.hasClass('hidden')) {
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
                    task.addClass('hidden').removeClass('updated');
                    getTotalPomos();
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
                ...processForm(updateForm),
            }, data => {
                console.log(data);
                updateTask(task, data);
                $(task).removeClass('updated');
                $('#update-form', task).addClass('hidden');
                getTotalPomos();
            })
        })
    }

    $('.task').each(function () {
        initTask($(this));
    });

    $('.task:first-child').addClass('active');

    $('.add-task').on('click', function () {
        $(this).addClass('hidden');
        $('#add-form').removeClass('hidden');
    });

    // form for adding new Tasks
    const addTaskForm = $('#add-form');

    $('#cancel-add-btn', addTaskForm).on('click', function (ev) {
        ev.preventDefault();
        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
        $('#add-form #description').addClass('hidden');
        $('#add-form .add-note-btn').removeClass('hidden');
    })

    $('.add-note-btn', addTaskForm).on('click', function (ev) {
        ev.preventDefault();
        $(this).addClass('hidden');
        $('#description', addTaskForm).removeClass('hidden').focus();
    })

    $('.submit-btn', addTaskForm).on('click', function (ev) {
        ev.preventDefault();

        $.post('/new', processForm(addTaskForm), data => {
            const newTask = $('.blank-task .task').clone();
            updateTask(newTask, data);
            initTask(newTask);
            newTask.data('id', data.id);
            $('.tasks').append(newTask);
            getTotalPomos();
        })

        $('input, textarea', addTaskForm).val('');

        $('.add-task').removeClass('hidden');
        $('#add-form').addClass('hidden');
    })

    $('#description', addTaskForm).prop('selectionEnd', 1);


    // -------TASKS MENU------------

    const tasksMenu =  $('.tasks-menu');

    $('.toggle-tasks-menu').on('click', function (ev) {
        ev.stopPropagation();
        tasksMenu.toggleClass('hidden');
    })

    $('.clear-finished-tasks', tasksMenu).on('click', function() {
        $.post('/delete-finished-tasks?_method=DELETE', {}, data => {
            if (data?.success) {
                $('.task.done').addClass('hidden');
                triggerNotification({
                    message_type: 'info',
                    message_title: 'Tasks cleaned',
                    message_body: 'Finished tasks are removed',
                })
            }
        });

    })

    $('.clear-all-tasks', tasksMenu).on('click', function() {
        $.post('/delete-all-tasks?_method=DELETE', {}, data => {
            if (data?.success) {
                $('.task').addClass('hidden');
                triggerNotification({
                    message_type: 'info',
                    message_title: 'Tasks erased',
                    message_body: 'All tasks are removed',
                })
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
            triggerNotification({
                message_type: 'info',
                message_title: 'Tasks erased',
                message_body: 'Tasks progress is removed',
            })
        });
    })

    // -------USER MENU------------
    const userMenu = $('.user-menu');

    $('.user-btn').on('click', function(ev) {
        ev.stopPropagation();
        userMenu.toggleClass('hidden');
    })

    userMenu.on('click', function (ev) {
        ev.stopPropagation();
    })

    $('.logout', userMenu).on('click', function() {
        $.post('/users/logout?_method=DELETE', {}, path => {
            location.replace(path);
        });

    })

    $('.delete-account', userMenu).on('click', function() {
        $.post('/users/delete?_method=DELETE', {}, () => {
            location.reload();
        });
    })
    // -------USER PROFILE PAGE------------

    const blurPage = $('.blur-page'), layout = $('.layout');
    const userProfile = $('.user-profile');

    function toggleFixLayout() {
        for (let cl of ['fixed', 'top-0', 'left-[50%]', '-translate-x-[50%]']) {
            layout.toggleClass(cl);
        }
    }

    $('.open-profile', userMenu).on('click', function() {
        userProfile.removeClass('hidden');
        blurPage.removeClass('hidden');
        userMenu.addClass('hidden');
        toggleFixLayout();
    })

    userProfile.on('click', function(ev) {
        ev.stopPropagation();
    })

    $('.avatar-field', userProfile).on('click', async function() {
        const [ fileHandle ] = await window.showOpenFilePicker({
            types: [{
                accept: {
                    'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp']
                }
            }],
        });
        const fileData = await fileHandle.getFile();

        const buffer = await fileData.arrayBuffer();
        const blob = new Blob([buffer]);
        $('#avatar', userProfile).prop('src', URL.createObjectURL(blob));
        let file = new File([blob], fileData.name, {
            type: fileData.type,
            lastModified:new Date().getTime()
        }, );
        console.log(fileData.name, file);
        let container = new DataTransfer();
        container.items.add(file);
        $('#filedata', userProfile).prop('files', container.files);
        console.log($('#filedata', userProfile).prop('files'));
    })

    $('.close-profile, #cancel-update-btn', userProfile).on('click', function(ev) {
        ev.preventDefault();
        blurPage.addClass('hidden');
        userProfile.addClass('hidden');
        toggleFixLayout();
    })

    // -------USER SETTINGS ------------

    const settingsForm = $('.settings-form');

    $('.settings-btn').on('click', function(ev) {
        ev.stopPropagation();
        blurPage.removeClass('hidden');
        settingsForm.removeClass('hidden');
        toggleFixLayout();
    })


    settingsForm.on('click', function(ev) {
        ev.stopPropagation();
    })

    $('.close-settings', settingsForm).on('click', function(ev) {
        ev.preventDefault();
        blurPage.addClass('hidden');
        settingsForm.addClass('hidden');
        toggleFixLayout();
    });

    $('.toggle', settingsForm).each(function() {
        const checkbox = $(`#${$(this).data('field')}`, settingsForm);
        console.log(checkbox);
        if (checkbox.prop('checked')) {
            $(this).addClass('active');
        }
        $(this).on('click', function(ev) {
            ev.preventDefault();
            $(this).toggleClass('active');
            checkbox.prop('checked', $(this).hasClass('active'));
        })
    });

    $('#submit-btn', settingsForm).on('click', function(ev) {
        ev.preventDefault();
        let newSettings = processForm(settingsForm);

        $.post('/users/update_user_settings', { settings: newSettings }, data => {
            if (data.success) {
                updateSettings(newSettings);
                triggerNotification({
                    message_type: 'success',
                    message_title: 'Settings Updated',
                    message_body: 'Your settings successfully updated',
                })
            }
        } );
        blurPage.addClass('hidden');
        settingsForm.addClass('hidden');
        toggleFixLayout();
    });

    // ------- USER REPORT ------------

    const userStats = $('.user-report');

    $('.report-btn').on('click', function(ev) {
        ev.stopPropagation();
        blurPage.removeClass('hidden');
        userStats.removeClass('hidden');
        toggleFixLayout();
    });

    userStats.on('click', function(ev) {
        ev.stopPropagation();
    })

    $('.close-report', userStats).on('click', function(ev) {
        ev.preventDefault();
        userStats.addClass('hidden');
        blurPage.addClass('hidden');
        toggleFixLayout();
    });

    function formatTaskDate(startDate, finishDate) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let startMins = startDate.getMinutes().toString(),
            startHours = startDate.getHours().toString();
        if (startMins.length === 1) {
            startMins = '0' + startMins;
        }
        if (startHours.length === 1) {
            startHours = '0' + startHours;
        }

        let finishMins = finishDate.getMinutes().toString(),
            finishHours = finishDate.getHours().toString();
        if (finishMins.length === 1) {
            finishMins = '0' + finishMins;
        }
        if (finishHours.length === 1) {
            finishHours = '0' + finishHours;
        }
        return `${startDate.getDate()}-${monthNames[startDate.getMonth()].slice(0, 3)}-${startDate.getFullYear()} 
                ${startHours}:${startMins} ~ ${finishHours}:${finishMins}`;
    }

    $('.report-nav > button').on('click', function() {
        $('.report-nav > button').each(function() {
            $(this).removeClass('active');
            const section = $(this).prop('class').split(' ')[0];
            $(`.user-report > .${section}`).addClass('hidden');
        })
        $(this).addClass('active');
        const section = $(this).prop('class').split(' ')[0];
        $(`.user-report > .${section}`).removeClass('hidden');

        if ($(this).hasClass('detail')) {
            $('.done-task tr.task').remove();
            $.get('/users/get_done_tasks', {}, data => {
                if (!data.success) return;
                const tasks = data.data;
                console.log(tasks);
                for (let task of tasks) {
                    const startDate = new Date(task.startTime),
                          finishDate = new Date(task.finishTime);
                    $('.done-task').append($(`
                        <tr class="task border-b border-gray-100">
                            <td class="text-sm">${formatTaskDate(startDate, finishDate)}</td>
                            <td class="font-bold text-gray-800 py-3">${task.name.trim()}</td>
                            <td class="text-gray-600 py-3">${task.duration}</td>
                        </tr>
                    `))
                }
            });
        }
    })

    // ------- USERS TOP ------------

    const usersTopTable = $('.users-top');
    const prevPageBtn = $('.ranking .prev-page'),
            nextPageBtn = $('.ranking .next-page'),
            currentUserTopPageInd = $('.ranking .current-page')

    let usersTopData, currentUsersTopPage = 1, usersOnPage = 25, usersTopMaxPages;

    function renderUserInfo(currentInd, user) {
        return `
                <tr class="user-row border-b border-gray-100">
                    <td class="text-gray-600 text-xl">${currentInd}</td>
                    <td class="text-gray-800 text-xl py-3 flex items-center gap-4">
                        <div class="w-8 h-8 rounded-full overflow-hidden">
                            <img src="${user.avatar || '/images/user-icon.png'}" alt="${user.name}">
                        </div>
                        ${user.name.trim()}
                    </td>
                    <td class="text-gray-800 font-bold text-xl py-3 text-end">
                        ${setLeftTime(user.totalFocusTime)}
                    </td>
                </tr>
            `
    }

    function renderUsersTopPage() {
        $('.user-row', usersTopTable).remove();
        let currentInd = (currentUsersTopPage - 1) * usersOnPage + 1;

        for (let user of usersTopData.slice(
            (currentUsersTopPage - 1) * usersOnPage,
                currentUsersTopPage * usersOnPage)) {
            usersTopTable.append($(renderUserInfo(currentInd++, user)));
        }
    }

    // generateUsers().then(
    //     $.get('/users/get_top_users', {}, data => {
    //         if (data.success) {
    //             usersTopData = data.usersTop;
    //             renderUsersTopPage();
    //             console.log('From db');
    //         }
    //     })
    // ).catch(err => {
    //     console.log(err);
    // })
    //

    $.get('/users/get_top_users', {}, data => {
        if (data.success) {
            usersTopData = data.usersTop;
            usersTopMaxPages = Math.floor((usersTopData.length + usersOnPage - 1) / usersOnPage);
            console.log(usersTopMaxPages);
            renderUsersTopPage();
            console.log('From db');
        }
    });

    prevPageBtn.on('click', function() {
        if (currentUsersTopPage === 1) {
            return;
        } if (currentUsersTopPage === 2) {
            $(this).addClass('opacity-0').addClass('cursor-default');
        } else if (currentUsersTopPage === usersTopMaxPages) {
            nextPageBtn.removeClass('opacity-0').removeClass('cursor-default');
        }

        currentUserTopPageInd.text(--currentUsersTopPage);
        renderUsersTopPage();
    });

    nextPageBtn.on('click', function() {
        if (currentUsersTopPage === usersTopMaxPages) {
            return;
        } if (currentUsersTopPage === usersTopMaxPages - 1) {
            $(this).addClass('opacity-0').addClass('cursor-default');
        } else if (currentUsersTopPage === 1) {
            prevPageBtn.removeClass('opacity-0').removeClass('cursor-default');
        }

        currentUserTopPageInd.text(++currentUsersTopPage);
        renderUsersTopPage();
    });

    $(document).on('click', function() {
        blurPage.addClass('hidden');
        settingsForm.addClass('hidden');
        userProfile.addClass('hidden');
        userStats.addClass('hidden');
        userMenu.addClass('hidden');
        tasksMenu.addClass('hidden');
    })

    // ------- TOAST NOTIFICATION ------------

    const toastNotification = $('.toast-not'), notificationLifeTime = 5000;

    function triggerNotification({ message_type, message_title, message_body }) {
        toastNotification.removeClass('success error info').addClass(message_type);
        $('.title', toastNotification).text(message_title);
        $('.body', toastNotification).text(message_body);
        toastNotification.show('slide', {
            direction: 'right',
        }, 500);
        setTimeout(() => {
            toastNotification.hide('slide', {
                direction: 'right',
            }, 500);
        }, notificationLifeTime);
    }

    if (!toastNotification.hasClass('hidden')) {
        toastNotification.addClass('hidden')
        toastNotification.hide('slide', {
            direction: 'right',
        }, 500, () => {
            toastNotification.removeClass('hidden')
            toastNotification.show('slide', {
                direction: 'right',
            }, 500);
        });

        setTimeout(() => {
            toastNotification.hide('slide', {
                direction: 'right',
            }, 500);
        }, notificationLifeTime);

        // const searchParams = new URLSearchParams(location.href.split('?')[1]);
        // searchParams.delete('message_type');
    }

    $('.close-notification', toastNotification).on('click', function() {
        console.log('not closed')
        toastNotification.hide('slide', {
            direction: 'right',
        }, 500);
    });
})
