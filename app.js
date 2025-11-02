/**
 * 主应用初始化模块
 * 负责初始化所有功能模块
 */

class ScoreBoardApp {
    constructor() {
        this.navigation = null;
        this.windowResize = null;
        this.verticalSplitter = null;
        this.isInitialized = false;
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * 初始化所有功能模块
     */
    initialize() {
        try {
            // 1. 初始化窗口调整大小功能
            this.initWindowResize();

            // 2. 初始化垂直分割线拖拽功能
            this.initVerticalSplitter();

            // 3. 初始化首字母导航功能
            this.initLetterNavigation();

            // 4. 绑定全局事件
            this.bindGlobalEvents();

            // 5. 设置全局错误处理
            this.setupErrorHandling();

            this.isInitialized = true;

            // 触发自定义事件
            this.dispatchEvent('app-initialized');

        } catch (error) {
            console.error('应用初始化失败:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 初始化窗口调整大小功能
     */
    initWindowResize() {
        this.windowResize = new WindowResize();

        // 监听窗口大小变化事件
        document.addEventListener('resize', (e) => {
            // 窗口大小改变处理
        });

        document.addEventListener('resize-start', (e) => {
            // 开始调整窗口大小处理
        });

        document.addEventListener('resize-end', (e) => {
            // 完成调整窗口大小处理
        });
    }

    /**
     * 初始化垂直分割线拖拽功能
     */
    initVerticalSplitter() {
        this.verticalSplitter = new VerticalSplitter({
            minSideWidth: 150,
            onChange: (data) => {
                // 分割线位置改变处理
            }
        });

        // 监听分割线拖拽事件
        document.addEventListener('drag-start', (e) => {
            // 拖拽开始事件处理
        });

        document.addEventListener('drag', (e) => {
            // 实时更新可以在这里处理
        });

        document.addEventListener('drag-end', (e) => {
            // 拖拽结束事件处理
        });
    }

    /**
     * 初始化首字母导航功能
     */
    initLetterNavigation() {
        this.navigation = new LetterNavigation();

        // 监听导航事件
        document.addEventListener('letter-changed', (e) => {
            // 字母切换处理
        });

        document.addEventListener('student-selected', (e) => {
            // 学生选中处理
        });

        document.addEventListener('students-rendered', (e) => {
            // 学生列表渲染完成处理
        });
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 平台信息事件
        window.electronAPI.onPlatformInfo((data) => {
            console.log('平台信息:', data);
            this.handlePlatformInfo(data);
        });

        // 窗口事件
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 错误事件
        window.addEventListener('error', (e) => {
            this.handleError(e.error);
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason);
        });

        console.log('🔗 全局事件绑定完成');
    }

    /**
     * 处理平台信息
     */
    handlePlatformInfo(data) {
        const titleBar = document.getElementById('titleBar');
        if (titleBar) {
            if (data.isMac) {
                titleBar.classList.add('mac');
            } else {
                titleBar.classList.add('other');

                // 绑定窗口控制按钮事件
                this.bindWindowControls();
            }
        }

        // 触发自定义事件
        this.dispatchEvent('platform-detected', data);
    }

    /**
     * 绑定窗口控制按钮事件
     */
    bindWindowControls() {
        const minimizeBtn = document.getElementById('minimizeBtn');
        const closeBtn = document.getElementById('closeBtn');
        const settingsBtn = document.getElementById('settingsBtn');

        if (minimizeBtn) {
            // 鼠标按下时创建水波纹
            minimizeBtn.addEventListener('mousedown', (e) => {
                this.createRipple(minimizeBtn, e);
            });

            // 点击时执行功能
            minimizeBtn.addEventListener('click', (e) => {
                setTimeout(() => {
                    window.electronAPI.minimizeWindow();
                }, 200);
            });
        }

        if (closeBtn) {
            // 鼠标按下时创建水波纹
            closeBtn.addEventListener('mousedown', (e) => {
                this.createRipple(closeBtn, e);
            });

            // 点击时执行功能
            closeBtn.addEventListener('click', (e) => {
                setTimeout(() => {
                    window.electronAPI.closeWindow();
                }, 200);
            });
        }

        if (settingsBtn) {
            // 鼠标按下时创建水波纹
            settingsBtn.addEventListener('mousedown', (e) => {
                this.createRipple(settingsBtn, e);
            });

            // 点击时执行功能
            settingsBtn.addEventListener('click', (e) => {
                setTimeout(() => {
                    window.electronAPI.openSettings();
                }, 200);
            });
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
     * 设置全局错误处理
     */
    setupErrorHandling() {
        // 全局错误处理
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message));
            return true;
        };
    }

    /**
     * 处理错误
     */
    handleError(error) {
        console.error('应用错误:', error);

        // 显示用户友好的错误信息
        this.showErrorNotification(error);

        // 触发自定义事件
        this.dispatchEvent('error', {
            error: error,
            message: error.message,
            stack: error.stack
        });
    }

    /**
     * 显示错误通知
     */
    showErrorNotification(error) {
        // 创建错误通知元素
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <strong>发生错误</strong>
                <p>${error.message}</p>
                <button class="close-btn">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // 自动隐藏
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // 关闭按钮
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * 处理初始化错误
     */
    handleInitializationError(error) {
        console.error('初始化错误:', error);

        // 显示错误页面或通知
        document.body.innerHTML = `
            <div class="error-page">
                <h1>应用初始化失败</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()">重新加载</button>
            </div>
        `;

        // 尝试恢复
        setTimeout(() => {
            location.reload();
        }, 5000);
    }

    /**
     * 清理资源
     */
    cleanup() {
        console.log('🧹 清理应用资源...');

        // 销毁功能模块
        if (this.navigation) {
            this.navigation.destroy();
        }

        if (this.windowResize) {
            this.windowResize.destroy();
        }

        if (this.verticalSplitter) {
            this.verticalSplitter.destroy();
        }

        // 移除事件监听器
        document.removeEventListener('letter-changed', this.handleLetterChange);
        document.removeEventListener('student-selected', this.handleStudentSelect);
        document.removeEventListener('error', this.handleError);

        console.log('✅ 应用资源清理完成');
    }

    /**
     * 获取应用状态
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            navigation: this.navigation ? this.navigation.getStatus() : null,
            windowResize: this.windowResize ? this.windowResize.getHandleStatus() : null,
            verticalSplitter: this.verticalSplitter ? this.verticalSplitter.getStatus() : null
        };
    }

    /**
     * 分发自定义事件
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 事件处理函数
     */
    handleLetterChange(e) {
        console.log('字母改变:', e.detail);
    }

    handleStudentSelect(e) {
        console.log('学生选中:', e.detail);
    }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.app = new ScoreBoardApp();
});