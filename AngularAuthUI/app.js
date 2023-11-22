const { app, BrowserWindow, globalShortcut } = require('electron');

let appWindow;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: false,
      nodeIntegration: true, // Enable Node.js integration in the renderer process
    },
  });

  mainWindow.loadURL('https://opravila-7f9581a718fe.herokuapp.com');

  app.on('ready', () => {
    // Register a shortcut listener for Ctrl + Shift + I
    globalShortcut.register('Control+Shift+I', () => {
        return false;
    });
});

  appWindow.on('closed', function () {
    appWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});