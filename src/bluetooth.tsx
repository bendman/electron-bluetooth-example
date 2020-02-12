/**
 * Bluetooth API Abstraction
 *
 * Useful docs:
 * https://www.electronjs.org/docs/api/web-contents#event-select-bluetooth-device
 */

type DeviceId = string;

interface WebBle {
  startScanning: (
    cb: (device: DeviceId, name: string) => void
  ) => Promise<void>;
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

const RenderAPI: Pick<WebBle, 'startScanning'> = {
  startScanning: async cb => {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
    console.log('device found', device.id, device.name);
    cb(device.id, device.name || '');
  },
};

export { RenderAPI as WebBle };
