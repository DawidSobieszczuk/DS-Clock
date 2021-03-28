const {app, BrowserWindow, Tray, Menu, ipcMain, nativeTheme, nativeImage , MenuItem} = require('electron');
const storage = require('electron-json-storage');
const AutoLaunch = require('auto-launch');
const { isDataEmpty } = require('./functions');

require('@electron/remote/main').initialize();


let mainWindow = null;
let timerWindow = null;
let tray = null;
let alarmSoundVolume = 1;
let dsClockAutoStart = new AutoLaunch({
    name: 'DS Clock'
});
let startupisEnabled = false;
dsClockAutoStart.isEnabled().then((isEnabled) => {
    startupisEnabled = isEnabled;
});
nativeTheme.themeSource = 'dark';


function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 240, 
        height: 126,
        frame: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    //mainWindow.openDevTools({mode:'undocked'});

    mainWindow.setSkipTaskbar(true);
    mainWindow.setResizable(false);
    mainWindow.loadURL('file://' + __dirname + '/main.html');
    storage.get('windowPosition', (error, data) => {
        if (error) throw error;

        if(data && Object.keys(data).length === 0 && data.constructor == Object) return;
        if(Object.keys(data).length < 2) return;
        if(typeof(data[0]) != 'number' && typeof(data[1]) != 'number') return;

        mainWindow.setPosition(data[0], data[1]);
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
        timerWindow = null;
    });

    mainWindow.on('moved', () => {
        storage.set('windowPosition', mainWindow.getPosition());
    });
    mainWindow.on('move', () => {
        timerWindow.hide();
    });
}

function createTimerWindow() {
    timerWindow = new BrowserWindow({
        width: 230,
        height: 200,
        show: false,
        frame: false,
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    //timerWindow.openDevTools({mode:'undocked'});

    timerWindow.setSkipTaskbar(true); 
    timerWindow.setMenu(null);

    timerWindow.loadURL('file://' + __dirname + '/timer.html');

    timerWindow.on('close', (event) => {
        event.preventDefault();
        timerWindow.hide();
    });
}

function toggleTimerWindow() {
    if(timerWindow.isVisible()) {
        timerWindow.hide();
    } else {
        showTimerWindow();
    }
}

function showTimerWindow() {
    let mainWindowPosition = mainWindow.getPosition();
    let mainWindowWidth = mainWindow.getSize()[0];

    let timeWindowSize = timerWindow.getSize();

    let offsetY = -5;

    timerWindow.setPosition(mainWindowPosition[0] + (mainWindowWidth-timeWindowSize[0])/2, mainWindowPosition[1] - (timeWindowSize[1] + offsetY));

    timerWindow.show();
}

function createWindows() {
    createMainWindow();
    createTimerWindow();
}

function createAndShowTrayMenu() {
    if(tray == null) return;

    const constextMenu = Menu.buildFromTemplate([
        {
            label: 'Timer',
            click: toggleTimerWindow,
        },
        {
            label: 'Alarm Volume',
            type: 'submenu',
            submenu: Menu.buildFromTemplate([
                {
                    label: '1',
                    type: 'radio',
                    checked: alarmSoundVolume === 1,
                    click: changeAlarmVolume,
                },
                {
                    label: '0.5',
                    type: 'radio',
                    checked: alarmSoundVolume === 0.5,
                    click: changeAlarmVolume,
                },
                {
                    label: '0',
                    type: 'radio',
                    checked: alarmSoundVolume === 0,
                    click: changeAlarmVolume,
                },
            ]),
        },
        { type:'separator' },
        {
            label: 'Startup',
            type:'checkbox',
            checked: startupisEnabled,
            click: toggleStartup,
        },
        {
            label: 'Dark Mode',
            type: 'checkbox',
            checked: nativeTheme.themeSource == 'dark',
            click: toggleDarkMode,
        },
        {
            label: 'Always On Top',
            type: 'checkbox',
            checked: mainWindow.isAlwaysOnTop(),
            click: toggleAllwaysOnTop,
        },
        { type:'separator' },
        {
            label: 'Exit', 
            role: 'quit'
        },
    ]);
    constextMenu.popup();
    tray.setContextMenu(constextMenu);
}

function createTray() {
    tray = new Tray(nativeImage.createFromPath(__dirname + '/icon.png'));

    tray.on('click', () => {
        mainWindow.focus();
    });

    tray.on('right-click', () => {
        createAndShowTrayMenu();
    });
}

function changeAlarmVolume(menuItem, browserWindow, event) {
    storage.set('alarmVolume', Number(menuItem.label));
}

function toggleStartup() {
    startupisEnabled = !startupisEnabled;

    if(startupisEnabled) dsClockAutoStart.enable();
    else dsClockAutoStart.disable();
}

function toggleDarkMode() {
    if(nativeTheme.themeSource == 'light') nativeTheme.themeSource = 'dark';
    else nativeTheme.themeSource = 'light';

    storage.set('darkMode', nativeTheme.themeSource == 'dark' ? true : false);
} 

function toggleAllwaysOnTop() {
    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());

    storage.set('alwaysOnTop', mainWindow.isAlwaysOnTop());
}


app.on('ready',() => {
    createWindows();
    createTray();
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});



ipcMain.on('toggle-timer-window', () => {    
    toggleTimerWindow();
});

ipcMain.on('focus-timer-window', () => {
    showTimerWindow();
    timerWindow.focus();
});

// =============
//   STORAGE
// =============
storage.get('alarmSound', (error, data) => {
    if (error) throw error;

    if(isDataEmpty(data)) {
        storage.set('alarmSound', './sounds/classic_alarm.mp3');
        return;
    };
});

storage.getMany(['darkMode', 'alwaysOnTop', 'alarmVolume'], (error, data) => {
    if (error) throw error;

    if(isDataEmpty(data.darkMode)) {
        nativeTheme.themeSource = 'dark';
        storage.set('darkMode', 'dark');
    } else {
        nativeTheme.themeSource = data.darkMode ? 'dark' : 'light';
    }

    if(isDataEmpty(data.alwaysOnTop)) {
        mainWindow.setAlwaysOnTop(false);
        storage.set('alwaysOnTop', false);
    } else {
        mainWindow.setAlwaysOnTop(data.alwaysOnTop); 
    }

    if(isDataEmpty(data.alarmVolume)) {
        alarmSoundVolume = 1;
        storage.set('alarmVolume', 1);
    } else {
        alarmSoundVolume = data.alarmVolume;
    }
});