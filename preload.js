const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopTimerApi', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setDuration: (seconds) => ipcRenderer.invoke('settings:setDuration', seconds),
  setClickThrough: (enabled) => ipcRenderer.invoke('window:setClickThrough', enabled),
  onClickThroughChanged: (callback) => ipcRenderer.on('window:clickThroughChanged', (_event, value) => callback(value)),
});
