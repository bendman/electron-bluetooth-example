import { app, BrowserWindow } from 'electron';
const webbtPolyfill = require('./electron-webbt-dialog');

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile('./index.html');

  console.log('webbt_init', win);
  webbtPolyfill(win);
}

app.on('ready', createWindow);
