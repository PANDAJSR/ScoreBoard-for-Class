/**
 * 工具函数模块
 * 提供通用的工具函数和辅助功能
 */

/**
 * 创建水波纹效果
 */
function createRipple(button, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * 获取状态信息
 */
function getStatus() {
    const status = {
        isInitialized: false,
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        hasErrors: false,
        modules: {
            windowResize: false,
            verticalSplitter: false,
            letterNavigation: false,
            globalEvents: false
        }
    };

    // 检查各个模块的状态
    if (window.appInstance) {
        status.isInitialized = window.appInstance.isInitialized || false;
        status.modules.windowResize = !!window.appInstance.windowManager;
        status.modules.verticalSplitter = !!window.appInstance.windowManager?.splitterHandler;
        status.modules.letterNavigation = !!window.appInstance.navigationManager?.navigationHandler;
        status.modules.globalEvents = !!window.appInstance.globalEventsBound;
    }

    // 检查是否有错误
    const errorNotifications = document.querySelectorAll('.error-notification');
    status.hasErrors = errorNotifications.length > 0;

    return status;
}

/**
 * 触发自定义事件
 */
function dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
        detail: detail,
        bubbles: true,
        cancelable: true
    });
    window.dispatchEvent(event);
}

/**
 * 添加事件监听器
 */
function addEventListener(eventName, handler) {
    window.addEventListener(eventName, handler);
}

/**
 * 移除事件监听器
 */
function removeEventListener(eventName, handler) {
    window.removeEventListener(eventName, handler);
}

/**
 * 等待DOM加载完成
 */
function waitForDOM() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * 等待指定元素出现
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(element);
            }
        });

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`元素 ${selector} 未在 ${timeout}ms 内出现`));
        }, timeout);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 深拷贝对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

/**
 * 本地存储管理
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('读取本地存储失败:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('写入本地存储失败:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('删除本地存储失败:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('清空本地存储失败:', e);
            return false;
        }
    }
};

/**
 * 日志管理
 */
const logger = {
    info(message, ...args) {
        console.info(`[INFO] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    },

    warn(message, ...args) {
        console.warn(`[WARN] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    },

    error(message, ...args) {
        console.error(`[ERROR] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
    },

    debug(message, ...args) {
        if (window.DEBUG_MODE) {
            console.debug(`[DEBUG] ${new Date().toLocaleTimeString()} - ${message}`, ...args);
        }
    }
};

/**
 * 平台检测
 */
function detectPlatform() {
    const platform = {
        isMac: navigator.platform.toUpperCase().indexOf('MAC') >= 0,
        isWindows: navigator.platform.toUpperCase().indexOf('WIN') >= 0,
        isLinux: navigator.platform.toUpperCase().indexOf('LINUX') >= 0,
        isElectron: !!(window.electronAPI),
        userAgent: navigator.userAgent
    };

    return platform;
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化日期时间
 */
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

module.exports = {
    createRipple,
    getStatus,
    dispatchEvent,
    addEventListener,
    removeEventListener,
    waitForDOM,
    waitForElement,
    debounce,
    throttle,
    deepClone,
    storage,
    logger,
    detectPlatform,
    formatFileSize,
    formatDateTime
};