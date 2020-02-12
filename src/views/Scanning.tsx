import React, { useCallback, useState } from 'react';
import { WebBle, DeviceId } from '../utils/bluetooth';

type ScanningViewProps = {
  onConnect: (deviceId: DeviceId) => void;
};

const ScanningView = ({ onConnect }: ScanningViewProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState(new Map());

  // Update existing device with scan results
  const handleFoundDevice = useCallback(
    (id: DeviceId, name: string) => {
      setDevices(oldDevices => {
        const newDevices = new Map(oldDevices);
        newDevices.set(id, name);
        return newDevices;
      });
    },
    [setDevices]
  );

  // Start scanning for devices
  const startScan = useCallback(() => {
    setIsScanning(true);
    WebBle.startScanning(handleFoundDevice);
  }, [handleFoundDevice]);

  //
  const handleDeviceClick = useCallback((id: DeviceId) => {
    const connect = async () => {
      await WebBle.connect(id, () => {});
      onConnect(id);
    };
    connect();
  }, []);

  return (
    <main>
      {!isScanning ? (
        <button onClick={startScan}>Scan for Devices</button>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Device ID</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(devices.entries()).map(
              ([id, name]: [DeviceId, string]) => (
                <tr key={id} onClick={() => handleDeviceClick(id)}>
                  <td>{name}</td>
                  <td>{id}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default ScanningView;
