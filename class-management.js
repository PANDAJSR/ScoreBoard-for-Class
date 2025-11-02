/**
 * 班级管理窗口功能
 */
class ClassManagement {
    constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        this.setupPlatformStyling();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮事件
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            // 鼠标按下时创建水波纹
            closeBtn.addEventListener('mousedown', (e) => {
                this.createRipple(closeBtn, e);
            });

            // 点击时关闭窗口
            closeBtn.addEventListener('click', (e) => {
                setTimeout(() => {
                    this.closeWindow();
                }, 200);
            });
        }

        // 保存按钮事件
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveClassInfo();
            });
        }

        // 取消按钮事件
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeWindow();
            });
        }
    }

    /**
     * 设置平台特定样式
     */
    setupPlatformStyling() {
        const titleBar = document.getElementById('titleBar');
        if (!titleBar) return;

        if (window.electronAPI && window.electronAPI.getPlatformInfo) {
            try {
                const result = window.electronAPI.getPlatformInfo();
                if (result && result.then) {
                    // 如果是Promise
                    result.then(data => {
                        if (data && data.isMac) {
                            titleBar.classList.add('mac');
                        } else {
                            titleBar.classList.add('other');
                        }
                    }).catch(error => {
                        console.error('获取平台信息失败:', error);
                        titleBar.classList.add('other');
                    });
                } else if (result) {
                    // 如果是同步数据
                    if (result.isMac) {
                        titleBar.classList.add('mac');
                    } else {
                        titleBar.classList.add('other');
                    }
                } else {
                    titleBar.classList.add('other');
                }
            } catch (error) {
                console.error('获取平台信息出错:', error);
                titleBar.classList.add('other');
            }
        } else {
            titleBar.classList.add('other');
        }
    }

    /**
     * 创建水波纹效果
     */
    createRipple(button, event) {
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
     * 保存班级信息
     */
    saveClassInfo() {
        const classNameInput = document.getElementById('classNameInput');
        const className = classNameInput.value.trim();

        if (!className) {
            alert('请输入班级名称');
            return;
        }

        // 保存到主窗口
        if (window.electronAPI && window.electronAPI.saveClassInfo) {
            window.electronAPI.saveClassInfo(className).then(result => {
                if (result.success) {
                    // 关闭窗口
                    this.closeWindow();
                } else {
                    alert('保存失败：' + result.error);
                }
            }).catch(error => {
                console.error('保存班级信息失败:', error);
                alert('保存失败，请重试');
            });
        } else {
            // 如果没有electronAPI，直接关闭
            this.closeWindow();
        }
    }

    /**
     * 关闭窗口
     */
    closeWindow() {
        if (window.electronAPI && window.electronAPI.closeWindow) {
            window.electronAPI.closeWindow();
        } else {
            // 如果没有electronAPI，尝试关闭当前窗口
            window.close();
        }
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    new ClassManagement();
});