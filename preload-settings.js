const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => {
    window.close();
  },
  // 学生数据管理API
  getStudents: () => ipcRenderer.invoke('get-students'),
  saveStudents: (students) => ipcRenderer.invoke('save-students', students),
  // 平台检测API
  onPlatformInfo: (callback) => {
    ipcRenderer.once('platform-info', (event, data) => callback(data));
  },
  getPlatformInfo: () => {
    ipcRenderer.send('get-platform-info');
  }
});