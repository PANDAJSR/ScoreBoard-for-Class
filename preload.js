const { contextBridge, ipcRenderer } = require('electron');

// 定义拼音功能，优先使用pinyin模块，如果失败则使用备用实现
let pinyinImpl = null;
let pinyinAvailable = false;

// 首先检查模块是否存在，避免在预加载脚本中抛出异常
function checkPinyinModule() {
    try {
        // 使用require.resolve检查模块是否存在
        require.resolve('pinyin');
        return true;
    } catch (e) {
        return false;
    }
}

try {
    console.log('正在尝试加载pinyin模块...');

    // 检查模块是否存在
    if (!checkPinyinModule()) {
        console.warn('pinyin模块未找到，将使用备用实现');
        pinyinAvailable = false;
    } else {
        // 检查是否在Electron环境中
        if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
            console.log('运行在Electron环境中');
        }

        // 尝试加载segmentit分词器（轻量级，适合Electron）
        let segmentit = null;
        try {
            segmentit = require('segmentit');
            console.log('segmentit分词器加载成功');
        } catch (segError) {
            console.warn('segmentit分词器加载失败:', segError.message);
        }

        // 尝试加载pinyin模块
        const pinyinModule = require('pinyin');
        console.log('pinyin模块原始导出:', pinyinModule);

        if (pinyinModule) {
            // 处理不同的模块导出格式
            let pinyinFunc = null;
            if (typeof pinyinModule === 'function') {
                pinyinFunc = pinyinModule;
            } else if (pinyinModule.default) {
                pinyinFunc = pinyinModule.default;
            } else if (pinyinModule.pinyin) {
                pinyinFunc = pinyinModule.pinyin;
            } else {
                pinyinFunc = pinyinModule;
            }

            if (pinyinFunc) {
                // 创建自定义pinyin实例，指定使用segmentit分词
                pinyinImpl = function(text, options = {}) {
                    const defaultOptions = {
                        style: pinyinFunc.STYLE_NORMAL || 'normal',
                        heteronym: false,
                        segment: segmentit ? 'segmentit' : undefined
                    };

                    // 合并选项
                    const finalOptions = { ...defaultOptions, ...options };

                    try {
                        return pinyinFunc(text, finalOptions);
                    } catch (pinyinError) {
                        console.warn('pinyin转换失败，使用备用方案:', pinyinError.message);
                        // 如果pinyin失败，返回原始文本
                        return Array.from(text).map(char => [char]);
                    }
                };

                // 复制pinyin的静态属性
                if (pinyinFunc.STYLE_NORMAL) pinyinImpl.STYLE_NORMAL = pinyinFunc.STYLE_NORMAL;
                if (pinyinFunc.compare) pinyinImpl.compare = pinyinFunc.compare;

                pinyinAvailable = true;
                console.log('pinyin模块加载成功，使用segmentit分词器');
            } else {
                console.warn('pinyin模块无法解析为函数');
                pinyinAvailable = false;
            }
        } else {
            console.warn('pinyin模块导出为空');
            pinyinAvailable = false;
        }
    }
} catch (error) {
    console.warn('无法加载pinyin模块，将使用备用实现:', error.message);
    console.warn('错误详情:', error);
    console.warn('错误堆栈:', error.stack);
    pinyinAvailable = false;
}

// 备用拼音映射表
const pinyinMap = {
    '张': 'zhang', '李': 'li', '王': 'wang', '赵': 'zhao', '钱': 'qian',
    '孙': 'sun', '周': 'zhou', '吴': 'wu', '郑': 'zheng', '冯': 'feng',
    '陈': 'chen', '褚': 'chu', '卫': 'wei', '蒋': 'jiang', '沈': 'shen',
    '韩': 'han', '杨': 'yang', '朱': 'zhu', '秦': 'qin', '尤': 'you',
    '许': 'xu', '何': 'he', '吕': 'lv', '施': 'shi',
    '白': 'bai', '程': 'cheng', '邓': 'deng', '黄': 'huang', '林': 'lin',
    '刘': 'liu', '徐': 'xu', '马': 'ma', '于': 'yu', '董': 'dong',
    '梁': 'liang', '肖': 'xiao', '田': 'tian', '胡': 'hu', '袁': 'yuan',
    '潘': 'pan', '陆': 'lu', '高': 'gao', '郭': 'guo', '曹': 'cao',
    '彭': 'peng', '曾': 'zeng', '谢': 'xie', '苏': 'su', '卢': 'lu',
    '蒋': 'jiang', '蔡': 'cai', '贾': 'jia', '丁': 'ding', '魏': 'wei',
    '薛': 'xue', '叶': 'ye', '阎': 'yan', '余': 'yu', '潘': 'pan'
};

const firstLetterMap = {
    '张': 'Z', '李': 'L', '王': 'W', '赵': 'Z', '钱': 'Q',
    '孙': 'S', '周': 'Z', '吴': 'W', '郑': 'Z', '冯': 'F',
    '陈': 'C', '褚': 'C', '卫': 'W', '蒋': 'J', '沈': 'S',
    '韩': 'H', '杨': 'Y', '朱': 'Z', '秦': 'Q', '尤': 'Y',
    '许': 'X', '何': 'H', '吕': 'L', '施': 'S', '白': 'B',
    '程': 'C', '邓': 'D', '黄': 'H', '林': 'L', '刘': 'L',
    '徐': 'X', '马': 'M', '于': 'Y', '董': 'D', '梁': 'L',
    '肖': 'X', '田': 'T', '胡': 'H', '袁': 'Y', '潘': 'P',
    '陆': 'L', '高': 'G', '郭': 'G', '曹': 'C', '彭': 'P',
    '曾': 'Z', '谢': 'X', '苏': 'S', '卢': 'L', '蒋': 'J',
    '蔡': 'C', '贾': 'J', '丁': 'D', '魏': 'W', '薛': 'X',
    '叶': 'Y', '阎': 'Y', '余': 'Y'
};

// 统一的API实现
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    openSettings: () => ipcRenderer.invoke('open-settings'),
    onPlatformInfo: (callback) => {
        ipcRenderer.once('platform-info', (event, data) => callback(data));
    },
    getPlatformInfo: () => {
        ipcRenderer.send('get-platform-info');
    },
    // 拼音功能实现
    getPinyin: (text) => {
        if (!text || text.length === 0) return text;

        if (pinyinAvailable && pinyinImpl) {
            try {
                const result = pinyinImpl(text, {
                    style: pinyinImpl.STYLE_NORMAL,
                    heteronym: false
                });
                return result.map(item => item[0]).join('');
            } catch (error) {
                console.warn('pinyin转换失败，使用备用方案:', error);
            }
        }

        // 备用实现
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
            } else if (/^[一-龥]/.test(name)) {
                let letter = '#';
                if (pinyinAvailable && pinyinImpl) {
                    try {
                        const result = pinyinImpl(name[0], {
                            style: pinyinImpl.STYLE_NORMAL,
                            heteronym: false
                        });
                        if (result && result[0] && result[0][0]) {
                            letter = result[0][0].charAt(0).toUpperCase();
                        }
                    } catch (error) {
                        console.warn('pinyin获取首字母失败，使用备用方案:', error);
                    }
                }
                // 如果pinyin失败或使用备用方案
                if (letter === '#') {
                    letter = firstLetterMap[name[0]] || '#';
                }
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
            } else if (/^[一-龥]/.test(name)) {
                if (pinyinAvailable && pinyinImpl) {
                    try {
                        const result = pinyinImpl(name[0], {
                            style: pinyinImpl.STYLE_NORMAL,
                            heteronym: false
                        });
                        if (result && result[0] && result[0][0]) {
                            letter = result[0][0].charAt(0).toUpperCase();
                        }
                    } catch (error) {
                        console.warn('pinyin分组失败，使用备用方案:', error);
                    }
                }
                // 如果pinyin失败或使用备用方案
                if (letter === '#') {
                    letter = firstLetterMap[name[0]] || '#';
                }
            }
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(name);
        });
        return groups;
    }
});