const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => {
    window.close();
  },
  // 学生数据管理API
  getStudents: () => ipcRenderer.invoke('get-students'),
  saveStudents: (students) => ipcRenderer.invoke('save-students', students)
});