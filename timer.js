const remote = require('@electron/remote');
const storage = require('electron-json-storage');
const { ipcRenderer } = require('electron');
const {padLeaddinZeros, updateDarkMode, dateAdd, isDataEmpty} = require('./functions.js');

let countDownDate = null;
let alarm = null;
let alarmVolume = 1;
let alarmPath = './sounds/classic_alarm.mp3'; 
let stopAlarmTimeout = null;

// =============
//     DOM
// =============

const HTML_ELEMENT = document.getElementsByTagName('html')[0];
const INPUT_TIMER_HOURS_ELEMENT = document.getElementById('input-timer-hours');
const INPUT_TIMER_MINUTES_ELEMENT = document.getElementById('input-timer-minutes');
const INPUT_TIMER_SECONDS_ELEMENT = document.getElementById('input-timer-seconds');

const TIMER_ELEMENT = document.getElementById('timer');
const TIMER_HOURS_ELEMENT = document.getElementById('timer-hours');
const TIMER_MINUTES_ELEMENT = document.getElementById('timer-minutes');
const TIMER_SECONDS_ELEMENT = document.getElementById('timer-seconds');

const MENU_PLAY_ELEMENT = document.getElementById('menu-play');
const MENU_STOP_ELEMENT = document.getElementById('menu-stop');
const MENU_CLOSE_ELEMENT = document.getElementById('menu-close');

// =============
//   HELPERS 
// =============
function displayTimer(hours, minutes, seconds) {
    TIMER_HOURS_ELEMENT.innerHTML = padLeaddinZeros(hours, 2);
    TIMER_MINUTES_ELEMENT.innerHTML = padLeaddinZeros(minutes, 2);
    TIMER_SECONDS_ELEMENT.innerHTML = padLeaddinZeros(seconds, 2);
}


function startAlarm() {
    ipcRenderer.send('focus-timer-window');

    alarm = new Audio(alarmPath);
    alarm.volume = alarmVolume;
    alarm.loop = true;
    alarm.play();
    countDownDate = null;
    displayTimer(0, 0, 0);

    TIMER_ELEMENT.classList.add('animate-bounce');

    stopAlarmTimeout = setTimeout(stopAlarm, 1000*30);
}

function stopAlarm() {
    if(alarm != null) alarm.pause();
    TIMER_ELEMENT.classList.remove('animate-bounce');
    clearTimeout(stopAlarmTimeout);
}

// =============
//   TICKTOCK 
// =============
function updateTimer() {
    if(countDownDate == null) return;
    let curentTime = new Date();

    // Milliseconds
    let distance = countDownDate - curentTime;

    // Time calculations
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    displayTimer(hours, minutes, seconds);

    if(distance <= 0) {
        startAlarm();
    }
}


function tickTock() {
    updateTimer();
}

function fastUpdate() {
    updateDarkMode();

    storage.getMany(['alarmSound', 'alarmVolume'], (error, data) => {
        if(error) throw error;

        alarmVolume = isDataEmpty(data.alarmVolume) ? 1 : data.alarmVolume;
        alarmPath = isDataEmpty(data.alarmSound) ? './sounds/classic_alarm.mp3' : data.alarmSound ;
    });

    if(alarm != null) alarm.volume = alarmVolume;
}

setTimeout(() =>{
    setInterval(tickTock, 1000);
},1000 - new Date().getMilliseconds());
tickTock();

setInterval(fastUpdate, 100);
fastUpdate();

// =============
//     MENU 
// =============

// -------------
//     Play
// -------------
MENU_PLAY_ELEMENT.addEventListener('click', () => {
    let hours = INPUT_TIMER_HOURS_ELEMENT.value;
    let minutes = INPUT_TIMER_MINUTES_ELEMENT.value;
    let seconds = INPUT_TIMER_SECONDS_ELEMENT.value;

    countDownDate = new Date();
    countDownDate = dateAdd(countDownDate, 'hour', hours);
    countDownDate = dateAdd(countDownDate, 'minute', minutes);
    countDownDate = dateAdd(countDownDate, 'second', seconds);

    displayTimer(hours, minutes, seconds);
    stopAlarm();
});

// -------------
//     Stop
// -------------
MENU_STOP_ELEMENT.addEventListener('click', () => {
    countDownDate = null;
    displayTimer(0, 0, 0);
    stopAlarm();
});

// -------------
//     Close
// -------------
MENU_CLOSE_ELEMENT.addEventListener('click', () => {
    ipcRenderer.send('toggle-timer-window');
    stopAlarm();
});