import React, { useCallback, useState, useEffect } from 'react';
import { WebBle, DeviceId } from '../utils/bluetooth';

type DetailViewProps = {
  deviceId: DeviceId;
  onDisconnect: () => void;
};

const DetailView = ({ deviceId, onDisconnect }: DetailViewProps) => {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    const startReading = async () => {
      const level = await WebBle.read(
        deviceId,
        'battery_service',
        'battery_level'
      );
      console.log('found level', level);
      setBattery(level);
    };
    startReading();

    const subscribe = async () => {
      WebBle.subscribe(deviceId, 'battery_service', 'battery_level', value => {
        console.log('subbed', value);
        setBattery(value);
      });
    };

    subscribe();
  }, [setBattery]);

  const handleDisconnect = useCallback(() => {
    const disconnect = async () => {
      await WebBle.disconnect(deviceId);
      onDisconnect();
    };
    disconnect();
  }, []);

  return (
    <main>
      <div className="battery-level" style={{ '--level': battery || 0 }}>
        Battery Level: {battery === null ? 'unknown' : battery}
      </div>
      <button onClick={handleDisconnect}>Disconnect</button>
    </main>
  );
};

export default DetailView;
