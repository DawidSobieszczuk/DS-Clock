const {ipcRenderer} = require('electron');
const remote = require('@electron/remote');
const {padLeaddinZeros, weekdayNummberToString, updateDarkMode} = require('./functions');

// =============
//     DOM
// =============
const HTML_ELEMENT = document.getElementsByTagName('html')[0];

const MENU_MOVE_ELEMENT = document.getElementById('menu-move');
const MENU_TIMER_ELEMENT = document.getElementById('menu-timer');

const CLOCK_HOURS_ELEMENT = document.getElementById('clock-hours');
const CLOCK_MINUTES_ELEMENT = document.getElementById('clock-minutes');
const CLOCK_SECONDS_ELEMENT = document.getElementById('clock-seconds');

const DATE_WEEKDAY_ELEMENT = document.getElementById('date-weekday');
const DATE_DAY_ELEMENT = document.getElementById('date-day');
const DATE_MONTH_ELEMENT = document.getElementById('date-month');
const DATE_YEAR_ELEMENT = document.getElementById('date-year');

// =============
//   TICKTOCK 
// =============

/**
 * @param {Date} date
 */
function updateClock(date) {
    CLOCK_HOURS_ELEMENT.innerHTML = padLeaddinZeros(date.getHours(), 2);
    CLOCK_MINUTES_ELEMENT.innerHTML = padLeaddinZeros(date.getMinutes(), 2);
    CLOCK_SECONDS_ELEMENT.innerHTML = padLeaddinZeros(date.getSeconds(), 2);
}

/**
 * @param {Date} date
 */
function updateDate(date) {
    DATE_WEEKDAY_ELEMENT.innerHTML = weekdayNummberToString(date.getDay());
    DATE_DAY_ELEMENT.innerHTML = padLeaddinZeros(date.getDate(), 2);
    DATE_MONTH_ELEMENT.innerHTML = padLeaddinZeros(date.getMonth()+1, 2);
    DATE_YEAR_ELEMENT.innerHTML = date.getFullYear();
}


function tickTock() {
    let currentDate = new Date();
    updateClock(currentDate);
    updateDate(currentDate);
} 

function fastUpdate() {
    updateDarkMode();
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
//     Move
// -------------
MENU_MOVE_ELEMENT.style.webkitAppRegion = "drag";

// -------------
//    Timer
// -------------
MENU_TIMER_ELEMENT.addEventListener('click', () => {
    ipcRenderer.send('toggle-timer-window');
});