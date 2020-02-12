/*
 * Borrowed from the WebBluetooth polyfill. the show() method returns either
 * null or the selected device's ID. Call updateDevice(addr, name) to add a device.
 */

class WebBluetoothChooser {
  constructor() {
    this.createElements();
    this.resolve = () => null;
    this.counting = true;
    this.countdownId = 0;
  }

  createElements() {
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.zIndex = 99999;
    this.container.style.top = 0;
    this.container.style.left = 0;
    this.container.style.bottom = 0;
    this.container.style.right = 0;
    this.container.addEventListener('click', () => this.cancel());
    //		document.body.appendChild(this.container);

    const shadowRoot = this.container.attachShadow({ mode: 'closed' });
    this.shadowRoot = shadowRoot;
    shadowRoot.innerHTML = `
			<style>
				#chooser-dialog {
					width: 380px;
					background: white;
					margin: 0 auto;
					border: solid #bababa 1px;
					border-radius: 2px;
					padding: 16px;
					box-shadow: 0 2px 3px rgba(0,0,0,0.4);
					user-select: none;
					color: black;
					font-family: sans-serif;
					font-size: 10pt;
					text-align: left;
				}

				#device-list {
					height: 200px;
					border: solid #9e9e9e 1px;
					margin: 8px 0;
					overflow: auto;
				}

				.device-item {
					padding: 4px;
					cursor: pointer;
				}

				.device-item:hover {
					background: #ddddee;
				}

				.device-item.selected {
					background: #aaaaff;
					color: white;
				}

				#buttons {
					display: flex;
					justify-content: flex-end;
					padding: 5px 0px;
				}
		
				#help {
					height: 25px;
					padding: 10px 0 4px 10px;
					background-color: #f7f7f7;
					margin: 10px -16px -16px -16px;
				}

				#buttons button {
					cursor: pointer;
					border: solid #c0c0c0 1px;
					border-radius: 3px;
					margin-left: 8px;
					background: #edebea;
					padding: 4px 12px;
					width: 80px;
				}

			</style>

			<div id="chooser-dialog">
				<span id="hostname"> </span> wants to pair
				<div id="device-list">
				</div>
				<div id="buttons">
					<button id="btn-cancel">Cancel</button>
					<button id="btn-pair">Pair</button>
				</div>
				<!--div id="help">
					<a href="https://support.google.com/chrome/answer/6362090?p=bluetooth" target="_blank">Get Help</a> while scanning for devices...
				</div-->
		`;

    var appUrl = document.location.hostname;
    if (!appUrl) {
      appUrl = 'localhost';
      // appUrl = appinfo.description;
    }
    this.btnPair = shadowRoot.getElementById('btn-pair');
    this.deviceListElement = shadowRoot.getElementById('device-list');

    shadowRoot
      .getElementById('chooser-dialog')
      .addEventListener('click', e => e.stopPropagation());
    shadowRoot.getElementById('hostname').innerText = appUrl;
    shadowRoot
      .getElementById('btn-cancel')
      .addEventListener('click', () => this.cancel());
    this.btnPair.addEventListener('click', () => this.pair());
  }

  /**
   * Extended: return a Promise that resolves to "" or the device id.
   * @returns {Promise}
   */
  async show() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.btnPair.disabled = true;
      while (this.deviceListElement.firstChild) {
        this.deviceListElement.removeChild(this.deviceListElement.firstChild);
      }
      var seconds = 60;
      var msg = ' Scanning, please wait...';
      var entry = this.addEntry(seconds + msg, '');
      this.countdownId = setInterval(() => {
        if (--seconds === 0) {
          clearInterval(this.countdownId);
          entry.innerText = 'No devices found';
          this.countdownId = 0;
        } else entry.innerText = seconds + msg;
      }, 1000);
      document.body.appendChild(this.container);
      // TODO listen for escape key to close the dialog
    });
  }

  hide() {
    if (this.contdownId) {
      clearInterval(this.countdownId);
      this.countdownid = 0;
      this.counting = false;
    }
    document.body.removeChild(this.container);
  }

  cancel() {
    this.hide();
    this.resolve('');
  }

  pair() {
    this.hide();
    this.resolve(this.selectedDeviceId);
  }

  updateDevice(address, name, rssi) {
    if (this.counting) {
      clearInterval(this.countdownId);
      this.countdownid = 0;
      this.counting = false;
      this.deviceListElement.innerHTML = '';
      this.btnPair.disabled = false;
    }
    let deviceElement = this.shadowRoot.querySelector(
      `.device-item[bluetoothId='${address}']`
    );
    if (!deviceElement) {
      deviceElement = this.addEntry(name, address);
      deviceElement.addEventListener('click', () =>
        this.selectDevice(address, deviceElement)
      );
      deviceElement.addEventListener('keydown', e => {
        console.log('keydown', e);
        if (e.keyCode === 13 || e.keyCode === 32) {
          this.selectDevice(address, deviceElement);
        }
      });
    }
    if (!name) {
      deviceElement.innerText = address.toUpperCase();
    }
  }

  addEntry(name, address) {
    let deviceElement = document.createElement('div');
    deviceElement.tabIndex = 0;
    deviceElement.ariaRole = 'button';
    deviceElement.classList.add('device-item');
    this.deviceListElement.appendChild(deviceElement);
    deviceElement.innerText = name;
    deviceElement.setAttribute('bluetoothId', address);
    return deviceElement;
  }

  selectDevice(address, deviceElement) {
    this.selectedDeviceId = address;
    this.btnPair.disabled = false;
    const previousSelected = this.deviceListElement.querySelector('.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }
    deviceElement.classList.add('selected');
  }
}

module.exports = WebBluetoothChooser;
