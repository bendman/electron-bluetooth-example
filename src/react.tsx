import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import { WebBle } from './bluetooth';
require('./electron-webbt-dialog')();

const Index = () => {
  const scan = useCallback(() => {
    console.log('start scan');
    WebBle.startScanning((id, name) => {
      console.log('scan done', id, name);
    });
  }, []);

  return <button onClick={scan}>Scan</button>;
};

ReactDOM.render(<Index />, document.getElementById('app'));
