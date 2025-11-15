/**
 * 设置页面脚本
 * 数据目录管理和界面交互
 */

// 数据目录管理
let currentDataDir = '';
const defaultDataDir = 'data';

/**
 * 关闭窗口
 */
function handleClose() {
    if (window.electronAPI) {
        window.electronAPI.closeWindow();
    } else {
        window.close();
    }
}

/**
 * 创建水波纹效果
 */
function createRipple(event, button) {
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
 * 加载当前数据目录
 */
async function loadDataDirectory() {
    try {
        if (window.electronAPI && window.electronAPI.getDataDirectory) {
            const result = await window.electronAPI.getDataDirectory();
            if (result.success) {
                currentDataDir = result.directory;
                updateDirectoryDisplay();
            } else {
                currentDataDir = defaultDataDir;
                updateDirectoryDisplay();
            }
        } else {
            // 浏览器环境：使用默认目录
            currentDataDir = defaultDataDir;
            updateDirectoryDisplay();
        }
    } catch (error) {
        console.error('加载数据目录失败:', error);
        currentDataDir = defaultDataDir;
        updateDirectoryDisplay();
    }
}

/**
 * 更新目录显示
 */
function updateDirectoryDisplay() {
    const display = document.getElementById('currentDataDir');
    if (display) {
        display.textContent = currentDataDir || defaultDataDir;
    }
}

/**
 * 选择数据目录
 */
async function selectDataDirectory() {
    try {
        if (window.electronAPI && window.electronAPI.selectDataDirectory) {
            const result = await window.electronAPI.selectDataDirectory();
            if (result.success) {
                currentDataDir = result.directory;
                updateDirectoryDisplay();
                updateStatus('数据目录已更新', 'success');
            } else {
                updateStatus('选择目录失败：' + result.error, 'error');
            }
        } else {
            updateStatus('浏览器环境无法选择目录', 'error');
        }
    } catch (error) {
        console.error('选择数据目录失败:', error);
        updateStatus('选择目录失败，请重试', 'error');
    }
}

/**
 * 重置为默认目录
 */
async function resetToDefaultDirectory() {
    try {
        if (window.electronAPI && window.electronAPI.resetDataDirectory) {
            const result = await window.electronAPI.resetDataDirectory();
            if (result.success) {
                currentDataDir = defaultDataDir;
                updateDirectoryDisplay();
                updateStatus('已恢复为默认数据目录', 'success');
            } else {
                updateStatus('恢复失败：' + result.error, 'error');
            }
        } else {
            currentDataDir = defaultDataDir;
            updateDirectoryDisplay();
            updateStatus('已恢复为默认数据目录', 'success');
        }
    } catch (error) {
        console.error('恢复默认目录失败:', error);
        currentDataDir = defaultDataDir;
        updateDirectoryDisplay();
        updateStatus('已恢复为默认数据目录', 'success');
    }
}

/**
 * 更新状态提示
 */
function updateStatus(message, type) {
    const statusElement = document.getElementById('dirStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'form-hint ' + type;

        // 3秒后恢复默认提示
        setTimeout(() => {
            statusElement.textContent = '💡 提示：点击"选择目录"按钮可以更改数据存储位置';
            statusElement.className = 'form-hint';
        }, 3000);
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 选择目录按钮
    const selectBtn = document.getElementById('selectDirBtn');
    if (selectBtn) {
        selectBtn.addEventListener('click', selectDataDirectory);
    }

    // 恢复默认按钮
    const resetBtn = document.getElementById('resetDirBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefaultDirectory);
    }

    // 关闭按钮
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('mousedown', (e) => {
            createRipple(closeBtn, e);
        });

        closeBtn.addEventListener('click', () => {
            setTimeout(() => {
                handleClose();
            }, 200);
        });
    }
}

/**
 * 平台检测功能
 */
function detectPlatform() {
    const titleBar = document.getElementById('titleBar');
    const closeBtn = document.getElementById('closeBtn');

    // 强制应用Windows样式
    if (titleBar) {
        titleBar.classList.remove('mac', 'other');
        titleBar.classList.add('other');

        if (closeBtn) {
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '14px';
            closeBtn.style.right = '16px';
            closeBtn.style.left = 'auto';
        }
    }

    if (window.electronAPI && window.electronAPI.onPlatformInfo) {
        window.electronAPI.onPlatformInfo((data) => {
            if (titleBar) {
                titleBar.classList.remove('mac', 'other');
                if (data.isMac) {
                    titleBar.classList.add('mac');
                } else {
                    titleBar.classList.add('other');
                    if (closeBtn) {
                        closeBtn.style.position = 'absolute';
                        closeBtn.style.top = '16px';
                        closeBtn.style.right = '16px';
                    }
                }
            }
        });

        if (window.electronAPI.getPlatformInfo) {
            window.electronAPI.getPlatformInfo();
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    bindEvents();
    detectPlatform();
    loadDataDirectory();
});