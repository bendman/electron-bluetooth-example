const electron = require('electron');

async function showWebBluetooth() {
  const { ipcRenderer } = electron;
  const WebBluetoothChooser = require('./WebBluetoothChooser.js');

  var chooser = new WebBluetoothChooser();
  ipcRenderer.on('webbluetooth.select', (event, data) => {
    console.log('ipc webbluetooth.select', { event, data });
    if (!chooser)
      // dialog dismissed already?
      ipcRenderer.send('webbluetooth.selected', '');
    var devices = [];
    var devicesById = {};
    // Remove duplicates
    data.devices.forEach(device => {
      if (!devicesById[device.deviceId]) {
        devicesById[device.deviceId] = device;
        devices.push(device);
      }
    });
    devices.forEach(device => {
      console.log('index adding device', device);
      chooser.updateDevice(device.deviceId, device.deviceName, 0);
    });
  });
  var id = await chooser.show();
  chooser = null;
  ipcRenderer.send('webbluetooth.selected', id);
}

var requestDevice = null;

module.exports = function(mainWin) {
  if (mainWin) {
    let webBluetoothCallback = null;

    const { ipcMain } = electron;
    mainWin.webContents.on(
      'select-bluetooth-device',
      (event, devices, callback) => {
        event.preventDefault();
        webBluetoothCallback = callback;
        console.log('\n\n============= web contents =============\n', devices);
        mainWin.webContents.send('webbluetooth.select', { devices });
      }
    );

    ipcMain.on('webbluetooth.selected', (event, data) => {
      if (webBluetoothCallback) webBluetoothCallback(data);
      webBluetoothCallback = null;
    });
  } else {
    if (navigator.bluetooth) {
      requestDevice = navigator.bluetooth.requestDevice;
      navigator.bluetooth.requestDevice = function(options) {
        showWebBluetooth();
        return requestDevice.call(navigator.bluetooth, options);
      };
    }
  }
};
