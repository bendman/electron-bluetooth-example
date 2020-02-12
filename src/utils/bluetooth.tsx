import { BrowserWindow, ipcRenderer, ipcMain } from 'electron';

/** Utility function for waiting for async tasks */
const sleep = (time: number) =>
  new Promise((res, rej) => setTimeout(res, time));

/**
 * Bluetooth API Abstraction
 *
 * Useful docs:
 * https://www.electronjs.org/docs/api/web-contents#event-select-bluetooth-device
 */
export type DeviceId = string;
interface WebBle {
  /**
   * Start scanning for bluetooth devices
   * @param cb Called for each found device
   */
  startScanning: (
    cb: (device: DeviceId, name: string) => void
  ) => Promise<void>;
  /**
   * Connect to a device with a given DeviceId
   */
  connect: (device: DeviceId, onDisconnect: () => void) => Promise<void>;
  read: (
    device: DeviceId,
    serviceUuid: string,
    characteristicUuid: string
  ) => Promise<Uint8Array>;
  subscribe: (
    device: DeviceId,
    serviceUuid: string,
    characteristicUuid: string,
    cb: (data: Uint8Array) => void
  ) => Promise<void>;

  disconnect: (device: DeviceId) => Promise<void>;
}

const btValueToInt8Array = (value: DataView) => new Uint8Array(value.buffer);
let chosenDevice: BluetoothDevice = null;
let server: BluetoothRemoteGATTServer = null;
let subscribed = false;

/**
 * Bluetooth API accessible from within rendered windows.
 */
const RenderAPI: WebBle = {
  startScanning: async cb => {
    const sendDeviceResults = (_: any, devices: Electron.BluetoothDevice[]) => {
      // Allow the UI to update for each found device
      // Note: this structure doesn't allow for devices that go offline
      devices.forEach(({ deviceId, deviceName }) => cb(deviceId, deviceName));
    };

    // Setup listeners
    ipcRenderer.on('webble-scan', sendDeviceResults);

    // Make the request for devices
    chosenDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['battery_service'] }],
    });
  },
  connect: async (deviceId, onDisconnect) => {
    // Connect to the given device
    ipcRenderer.send('webble-selected', deviceId);

    // Give time for the event loop to resolve
    // TODO: find a mapping between the device address and the device id
    // or restructure this to use addresses and deviceIds more precisely
    await sleep(100);

    console.log('connecting', deviceId, chosenDevice);
    server = await chosenDevice.gatt.connect();
  },
  read: async (deviceId, serviceUuid, characteristicUuid) => {
    await sleep(100);
    const service = await server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);
    const value = await characteristic.readValue();

    return btValueToInt8Array(value);
  },
  subscribe: async (deviceId, serviceUuid, characteristicUuid, cb) => {
    // TODO: add unsubscribe
    subscribed = true;

    const service = await server.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(characteristicUuid);

    characteristic.addEventListener(
      'characteristicvaluechanged',
      (event: any) => {
        console.log(event.target.value);
        cb(btValueToInt8Array(event.target.value));
      }
    );

    await characteristic.startNotifications();
  },
  disconnect: async deviceId => {
    await server.disconnect();
    subscribed = false;
    chosenDevice = null;
    server = null;
  },
};
export { RenderAPI as WebBle };

/**
 * Setup bluetooth event listeners on the window from the main process.
 *
 * This should be called on any window that tries to access
 * `navigator.bluetooth.requestDevice`
 */
export const setupBluetooth = (win: BrowserWindow) => {
  let btCallback: (deviceId: DeviceId) => void;

  // Setup handling of bluetooth scan results
  win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
    // Store the callback for calling once a device is selected
    btCallback = callback;

    // Allow the WebBluetooth API to wait for a custom UI chooser
    event.preventDefault();

    // Notify the render process of found devices
    win.webContents.send('webble-scan', devices);
  });

  // Resolve a request when a device is selected
  ipcMain.on('webble-selected', (event, deviceId) => {
    if (btCallback) btCallback(deviceId);
    btCallback = null;
  });
};
