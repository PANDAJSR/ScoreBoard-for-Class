const { contextBridge, ipcRenderer } = require('electron');

// 尝试加载pinyin模块，如果失败则提供备用实现
try {
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
} catch (error) {
    console.error('无法加载pinyin模块，使用备用实现:', error);

    // 备用实现：简单的首字母提取
    contextBridge.exposeInMainWorld('electronAPI', {
        minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
        closeWindow: () => ipcRenderer.invoke('window-close'),
        openSettings: () => ipcRenderer.invoke('open-settings'),
        onPlatformInfo: (callback) => {
            ipcRenderer.once('platform-info', (event, data) => callback(data));
        },
        // 简化的拼音功能
        getPinyin: (text) => {
            // 简单的拼音映射
            const pinyinMap = {
                '张': 'zhang', '李': 'li', '王': 'wang', '赵': 'zhao', '钱': 'qian',
                '孙': 'sun', '周': 'zhou', '吴': 'wu', '郑': 'zheng', '冯': 'feng',
                '陈': 'chen', '褚': 'chu', '卫': 'wei', '蒋': 'jiang', '沈': 'shen',
                '韩': 'han', '杨': 'yang', '朱': 'zhu', '秦': 'qin', '尤': 'you',
                '许': 'xu', '何': 'he', '吕': 'lv', '施': 'shi', '张': 'zhang',
                '白': 'bai', '程': 'cheng', '邓': 'deng', '黄': 'huang', '林': 'lin'
            };

            if (pinyinMap[text[0]]) {
                return pinyinMap[text[0]];
            }
            return text;
        },
        getFirstLetters: (names) => {
            const letters = new Set();
            names.forEach(name => {
                if (/^[a-zA-Z]/.test(name)) {
                    letters.add(name[0].toUpperCase());
                } else if (/^[\u4e00-\u9fa5]/.test(name)) {
                    // 简单的首字母映射
                    const firstLetterMap = {
                        '张': 'Z', '李': 'L', '王': 'W', '赵': 'Z', '钱': 'Q',
                        '孙': 'S', '周': 'Z', '吴': 'W', '郑': 'Z', '冯': 'F',
                        '陈': 'C', '褚': 'C', '卫': 'W', '蒋': 'J', '沈': 'S',
                        '韩': 'H', '杨': 'Y', '朱': 'Z', '秦': 'Q', '尤': 'Y',
                        '许': 'X', '何': 'H', '吕': 'L', '施': 'S', '白': 'B',
                        '程': 'C', '邓': 'D', '黄': 'H', '林': 'L'
                    };
                    const letter = firstLetterMap[name[0]] || '#';
                    letters.add(letter);
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
                    const firstLetterMap = {
                        '张': 'Z', '李': 'L', '王': 'W', '赵': 'Z', '钱': 'Q',
                        '孙': 'S', '周': 'Z', '吴': 'W', '郑': 'Z', '冯': 'F',
                        '陈': 'C', '白': 'B', '程': 'C', '邓': 'D', '黄': 'H',
                        '林': 'L'
                    };
                    letter = firstLetterMap[name[0]] || '#';
                }
                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(name);
            });
            return groups;
        }
    });
}