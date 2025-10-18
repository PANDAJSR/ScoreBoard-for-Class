const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  onPlatformInfo: (callback) => {
    ipcRenderer.once('platform-info', (event, data) => callback(data));
  }
});