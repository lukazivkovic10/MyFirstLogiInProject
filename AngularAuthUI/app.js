const { app, BrowserWindow } = require('electron');

let appWindow;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration in the renderer process
    },
  });

  appWindow.loadFile(`dist/angular-auth-ui/index.html`); // Load your Angular app's index.html file

  appWindow.on('closed', function () {
    appWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});