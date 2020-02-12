import { app, BrowserWindow } from 'electron';
import { setupBluetooth } from './utils/bluetooth';

function createWindow() {
  // Create the browser window.
  let window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  window.loadFile('./index.html');
  setupBluetooth(window);
}

app.on('ready', createWindow);
