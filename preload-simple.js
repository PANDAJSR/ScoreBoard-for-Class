const { contextBridge, ipcRenderer } = require('electron');

// 简化的预加载脚本，避免沙盒环境错误

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

// 安全的拼音功能实现
function getPinyinSafe(text) {
    try {
        if (!text || typeof text !== 'string' || text.length === 0) return text;
        const firstChar = text[0];
        return pinyinMap[firstChar] || text;
    } catch (error) {
        console.error('拼音转换错误:', error);
        return text;
    }
}

// 安全的字母提取实现
function getFirstLettersSafe(names) {
    try {
        if (!Array.isArray(names)) return [];
        const letters = new Set();

        names.forEach(name => {
            if (typeof name !== 'string') return;

            try {
                if (/^[a-zA-Z]/.test(name)) {
                    letters.add(name[0].toUpperCase());
                } else if (/^[一-龥]/.test(name)) {
                    const letter = firstLetterMap[name[0]] || '#';
                    letters.add(letter);
                } else {
                    letters.add('#');
                }
            } catch (error) {
                console.error('字母提取错误:', error);
            }
        });

        return Array.from(letters).sort();
    } catch (error) {
        console.error('获取首字母失败:', error);
        return [];
    }
}

// 安全的学生分组实现
function groupStudentsByLetterSafe(names) {
    try {
        if (!Array.isArray(names)) return {};

        const groups = {};
        names.forEach(name => {
            if (typeof name !== 'string') return;

            try {
                let letter = '#';
                if (/^[a-zA-Z]/.test(name)) {
                    letter = name[0].toUpperCase();
                } else if (/^[一-龥]/.test(name)) {
                    letter = firstLetterMap[name[0]] || '#';
                }

                if (!groups[letter]) groups[letter] = [];
                groups[letter].push(name);
            } catch (error) {
                console.error('学生分组错误:', error);
            }
        });

        return groups;
    } catch (error) {
        console.error('学生分组失败:', error);
        return {};
    }
}

// 简化的API实现
try {
    // 基础窗口控制API
    const windowAPI = {
        minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
        closeWindow: () => ipcRenderer.invoke('window-close'),
        openSettings: () => ipcRenderer.invoke('open-settings'),
        openClassManagement: (options) => ipcRenderer.invoke('open-class-management', options)
    };

    // 平台信息API
    const platformAPI = {
        onPlatformInfo: (callback) => {
            ipcRenderer.once('platform-info', (event, data) => callback(data));
        }
    };

    // 数据目录管理API
    const dataDirAPI = {
        getDataDirectory: () => ipcRenderer.invoke('getDataDirectory'),
        selectDataDirectory: () => ipcRenderer.invoke('selectDataDirectory'),
        resetDataDirectory: () => ipcRenderer.invoke('resetDataDirectory')
    };

    // 班级管理API
    const classAPI = {
        getClassList: () => ipcRenderer.invoke('getClassList'),
        saveClassList: (classes) => ipcRenderer.invoke('saveClassList', classes),
        createClass: (className) => ipcRenderer.invoke('createClass', className),
        deleteClass: (classId) => ipcRenderer.invoke('deleteClass', classId),
        getCurrentClass: () => ipcRenderer.invoke('getCurrentClass'),
        setCurrentClass: (classId) => ipcRenderer.invoke('setCurrentClass', classId),
        getClassStudents: (classId) => ipcRenderer.invoke('getClassStudents', classId),
        saveClassStudents: (classId, students) => ipcRenderer.invoke('saveClassStudents', classId, students),
        editClassStudents: (classId) => ipcRenderer.invoke('editClassStudents', classId)
    };

    // 班级信息事件
    const classEventAPI = {
        onClassInfo: (callback) => {
            ipcRenderer.once('class-info', (event, data) => callback(data));
        }
    };

    // 拼音功能API
    const pinyinAPI = {
        getPinyin: getPinyinSafe,
        getFirstLetters: getFirstLettersSafe,
        groupStudentsByLetter: groupStudentsByLetterSafe
    };

    // 合并所有API
    const electronAPI = {
        ...windowAPI,
        ...platformAPI,
        ...dataDirAPI,
        ...classAPI,
        ...classEventAPI,
        ...pinyinAPI
    };

    // 暴露API到渲染进程
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);

    console.log('预加载脚本初始化成功');
} catch (error) {
    console.error('预加载脚本初始化失败:', error);

    // 如果contextBridge失败，尝试备用方案
    try {
        window.electronAPI = {
            minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
            closeWindow: () => ipcRenderer.invoke('window-close'),
            openSettings: () => ipcRenderer.invoke('open-settings'),
            openClassManagement: () => ipcRenderer.invoke('open-class-management'),
            getClassList: () => Promise.resolve([]),
            saveClassList: () => Promise.resolve({ success: true }),
            createClass: () => Promise.resolve({ success: true }),
            deleteClass: () => Promise.resolve({ success: true }),
            getCurrentClass: () => Promise.resolve(null),
            setCurrentClass: () => Promise.resolve({ success: true }),
            getClassStudents: () => Promise.resolve({ success: true, students: [] }),
            saveClassStudents: () => Promise.resolve({ success: true, studentCount: 0 }),
            editClassStudents: () => Promise.resolve({ success: true }),
            onPlatformInfo: () => {},
            onClassInfo: () => {},
            getPinyin: (text) => text,
            getFirstLetters: () => [],
            groupStudentsByLetter: () => ({})
        };
        console.log('使用备用方案初始化electronAPI');
    } catch (backupError) {
        console.error('备用方案也失败:', backupError);
    }
}