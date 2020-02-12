# electron-webbt-dialog

### Provides the missing Web Bluetooth device selection dialog to electron apps.

This small module provides the missing Web Bluetooth device select dialog to electron apps. Please note
that this dialog will not work with the Windows version, because Chrome does not support Web Bluetooth on
Windows. It works well for the Mac. For Windows versions, I recommend using a modified copy of
[web-bluetooth-polyfill](https://github.com/urish/web-bluetooth-polyfill).

## Usage

All you need to do is to add this line to your main.js file (the main process) after you created the main
window:

``` javascript
require("./electron-webbt-dialog")(mainWindow);
```

Likewise, add this line to the renderer.js file (the renderer process; note the absence of the main window parameter):

``` javascript
require("./electron-webbt-dialog")();
```

## Bugs

This code has been pulled from another project; I did not test it in a separate app.

## License

[MIT (Public Domain)](LICENSE.md)

## Acknowledgments

The dialog itself is a modified version of the dialog found in the [web-bluetooth-polyfill](https://github.com/urish/web-bluetooth-polyfill) package.
