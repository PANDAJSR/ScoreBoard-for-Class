const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  onPlatformInfo: (callback) => {
    ipcRenderer.once('platform-info', (event, data) => callback(data));
  }
});