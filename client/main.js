const { app, BrowserWindow } = require('electron');

let appWindow;

function initWindow() {
    appWindow = new BrowserWindow({
        height: 1080,
        width: 1920,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });

    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);

    appWindow.setMenuBarVisibility(false);
    // appWindow.webContents.openDevTools();

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (appWindow && !appWindow.isDestroyed()) {
        appWindow.webContents.send('app-close');
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});