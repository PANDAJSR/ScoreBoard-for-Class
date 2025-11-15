/**
 * 错误处理模块
 * 负责应用的错误处理和通知
 */

class ErrorHandler {
    constructor() {
        this.errorListeners = [];
        this.isHandlingError = false;
    }

    /**
     * 设置全局错误处理
     */
    setupErrorHandling() {
        // 处理JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // 处理未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || '未处理的Promise拒绝',
                reason: event.reason
            });
        });

        // 处理Vue错误（如果存在）
        if (window.Vue) {
            window.Vue.config.errorHandler = (err, vm, info) => {
                this.handleError({
                    type: 'vue',
                    message: err.message,
                    error: err,
                    vm: vm,
                    info: info
                });
            };
        }

        // 处理资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target && (event.target.src || event.target.href)) {
                this.handleError({
                    type: 'resource',
                    message: `资源加载失败: ${event.target.src || event.target.href}`,
                    target: event.target
                });
            }
        }, true);
    }

    /**
     * 处理错误
     */
    handleError(error) {
        if (this.isHandlingError) {
            return; // 防止递归错误处理
        }

        this.isHandlingError = true;

        try {
            console.error('应用错误:', error);

            // 显示错误通知
            this.showErrorNotification(error);

            // 触发错误事件
            this.dispatchErrorEvent(error);

            // 记录错误日志
            this.logError(error);

        } catch (handlerError) {
            console.error('错误处理失败:', handlerError);
        } finally {
            this.isHandlingError = false;
        }
    }

    /**
     * 显示错误通知
     */
    showErrorNotification(error) {
        // 创建错误通知元素
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4d4f;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            line-height: 1.4;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // 设置错误消息
        const message = this.getErrorMessage(error);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-exclamation-circle"></i>
                <div>
                    <div style="font-weight: 500; margin-bottom: 4px;">发生错误</div>
                    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    /**
     * 获取错误消息
     */
    getErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        }

        if (error.message) {
            return error.message;
        }

        if (error.type === 'javascript') {
            return `脚本错误: ${error.message}`;
        }

        if (error.type === 'promise') {
            return `异步操作失败: ${error.message}`;
        }

        if (error.type === 'resource') {
            return `资源加载失败`;
        }

        return '未知错误';
    }

    /**
     * 触发错误事件
     */
    dispatchErrorEvent(error) {
        const event = new CustomEvent('app-error', {
            detail: error
        });
        window.dispatchEvent(event);
    }

    /**
     * 记录错误日志
     */
    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // 存储到本地存储（限制数量）
        try {
            let logs = JSON.parse(localStorage.getItem('error-logs') || '[]');
            logs.unshift(errorLog);
            logs = logs.slice(0, 50); // 只保留最近50条
            localStorage.setItem('error-logs', JSON.stringify(logs));
        } catch (e) {
            console.warn('无法记录错误日志:', e);
        }
    }

    /**
     * 处理初始化错误
     */
    handleInitializationError(error) {
        console.error('应用初始化失败:', error);

        // 显示严重的错误提示
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
        `;

        overlay.innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 8px; text-align: center; max-width: 400px;">
                <i class="fas fa-exclamation-triangle" style="color: #ff4d4f; font-size: 48px; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 12px; color: #333;">应用初始化失败</h3>
                <p style="color: #666; margin-bottom: 20px;">请刷新页面重试，或联系技术支持。</p>
                <button onclick="location.reload()" style="background: #4a90e2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    刷新页面
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    /**
     * 添加错误监听器
     */
    addErrorListener(listener) {
        this.errorListeners.push(listener);

        // 监听错误事件
        window.addEventListener('app-error', listener);
    }

    /**
     * 移除错误监听器
     */
    removeErrorListener(listener) {
        const index = this.errorListeners.indexOf(listener);
        if (index > -1) {
            this.errorListeners.splice(index, 1);
            window.removeEventListener('app-error', listener);
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 移除所有错误监听器
        this.errorListeners.forEach(listener => {
            window.removeEventListener('app-error', listener);
        });
        this.errorListeners = [];

        // 移除错误通知
        const notifications = document.querySelectorAll('.error-notification');
        notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

module.exports = ErrorHandler;