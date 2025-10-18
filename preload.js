const { contextBridge, ipcRenderer } = require('electron');
const pinyinModule = require('pinyin');
const pinyin = pinyinModule.default || pinyinModule;

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  onPlatformInfo: (callback) => {
    ipcRenderer.once('platform-info', (event, data) => callback(data));
  },
  // 添加拼音功能
  getPinyin: (text, options = {}) => {
    try {
      const result = pinyin(text, {
        style: pinyin.STYLE_NORMAL,
        heteronym: false,
        ...options
      });
      return result.map(item => item[0]).join('');
    } catch (error) {
      console.error('拼音转换失败:', error);
      return text;
    }
  },
  getFirstLetters: (names) => {
    const letters = new Set();
    names.forEach(name => {
      if (/^[a-zA-Z]/.test(name)) {
        letters.add(name[0].toUpperCase());
      } else if (/^[\u4e00-\u9fa5]/.test(name)) {
        try {
          const result = pinyin(name[0], {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
          });
          if (result && result[0] && result[0][0]) {
            const firstLetter = result[0][0].charAt(0).toUpperCase();
            letters.add(firstLetter);
          }
        } catch (error) {
          letters.add('#');
        }
      } else {
        letters.add('#');
      }
    });
    return Array.from(letters).sort();
  },
  groupStudentsByLetter: (names) => {
    const groups = {};
    names.forEach(name => {
      let letter = '#';
      if (/^[a-zA-Z]/.test(name)) {
        letter = name[0].toUpperCase();
      } else if (/^[\u4e00-\u9fa5]/.test(name)) {
        try {
          const result = pinyin(name[0], {
            style: pinyin.STYLE_NORMAL,
            heteronym: false
          });
          if (result && result[0] && result[0][0]) {
            letter = result[0][0].charAt(0).toUpperCase();
          }
        } catch (error) {
          letter = '#';
        }
      }
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(name);
    });
    return groups;
  }
});