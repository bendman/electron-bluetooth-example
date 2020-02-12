## Notes

It seems like a scan function like `startScanning` would be more intuitive if it called the callback with an array of devices rather than each device individually, and if it returned a `Promise<BluetoothDevice>` instead of `Promise<void>`, this way the promise would resolve to the chosen device, which is more compatible with the design of the WebBluetooth API. Also, changing the structure of `startScanning` to call the callback with an array would allow it to support removing devices from the array when they go offline.
