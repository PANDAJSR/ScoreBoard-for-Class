/**
 * 窗口调整大小功能模块
 * 处理窗口边缘拖拽调整大小功能
 */

class WindowResize {
    constructor() {
        this.minWidth = 300;
        this.minHeight = 400;
        this.handles = [];
        this.isResizing = false;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.init();
    }

    /**
     * 初始化窗口调整大小功能
     */
    init() {
        this.createResizeHandles();
        this.bindEvents();
    }

    /**
     * 创建调整大小手柄
     */
    createResizeHandles() {
        const handles = [
            { class: 'resize-handle-bottom', cursor: 'ns-resize', position: 'bottom' },
            { class: 'resize-handle-right', cursor: 'ew-resize', position: 'right' },
            { class: 'resize-handle-bottom-right', cursor: 'nw-resize', position: 'bottom-right' }
        ];

        handles.forEach(handle => {
            const element = document.querySelector(`.${handle.class}`);
            if (element) {
                this.handles.push({
                    element,
                    cursor: handle.cursor,
                    position: handle.position
                });
            }
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        this.handles.forEach(handle => {
            handle.element.addEventListener('mousedown', (e) => {
                this.startResize(e, handle);
            });
        });

        document.addEventListener('mousemove', (e) => {
            this.handleResize(e);
        });

        document.addEventListener('mouseup', () => {
            this.endResize();
        });

        // 防止拖拽时选中文本
        document.addEventListener('selectstart', (e) => {
            if (this.isResizing) {
                e.preventDefault();
            }
        });
    }

    /**
     * 开始调整大小
     */
    startResize(e, handle) {
        e.preventDefault();

        this.isResizing = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = window.innerWidth;
        this.startHeight = window.innerHeight;
        this.currentHandle = handle;

        // 改变鼠标样式
        document.body.style.cursor = handle.cursor;

        // 添加调整状态类
        document.body.classList.add('resizing');

        // 触发自定义事件
        this.dispatchEvent('resize-start', {
            handle: handle.position,
            startWidth: this.startWidth,
            startHeight: this.startHeight
        });
    }

    /**
     * 处理调整大小
     */
    handleResize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        let newWidth = this.startWidth;
        let newHeight = this.startHeight;

        switch (this.currentHandle.position) {
            case 'bottom':
                newHeight = Math.max(this.minHeight, this.startHeight + deltaY);
                break;
            case 'right':
                newWidth = Math.max(this.minWidth, this.startWidth + deltaX);
                break;
            case 'bottom-right':
                newWidth = Math.max(this.minWidth, this.startWidth + deltaX);
                newHeight = Math.max(this.minHeight, this.startHeight + deltaY);
                break;
        }

        // 应用新尺寸
        window.resizeTo(newWidth, newHeight);

        // 触发自定义事件
        this.dispatchEvent('resize', {
            width: newWidth,
            height: newHeight,
            deltaX: deltaX,
            deltaY: deltaY
        });
    }

    /**
     * 结束调整大小
     */
    endResize() {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.currentHandle = null;

        // 恢复鼠标样式
        document.body.style.cursor = '';

        // 移除调整状态类
        document.body.classList.remove('resizing');

        // 触发自定义事件
        this.dispatchEvent('resize-end', {
            finalWidth: window.innerWidth,
            finalHeight: window.innerHeight
        });
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
     * 获取当前窗口尺寸
     */
    getCurrentSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    /**
     * 设置最小尺寸
     */
    setMinSize(width, height) {
        this.minWidth = width;
        this.minHeight = height;
    }

    /**
     * 显示/隐藏调整手柄
     */
    toggleHandles(show) {
        this.handles.forEach(handle => {
            handle.element.style.display = show ? 'block' : 'none';
        });
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 移除事件监听器
        this.handles.forEach(handle => {
            handle.element.removeEventListener('mousedown', this.startResize);
        });

        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.endResize);
        document.removeEventListener('selectstart', this.preventSelection);

        // 重置状态
        this.isResizing = false;
        this.currentHandle = null;
        document.body.style.cursor = '';
        document.body.classList.remove('resizing');
    }

    /**
     * 防止文本选择
     */
    preventSelection(e) {
        if (this.isResizing) {
            e.preventDefault();
        }
    }

    /**
     * 添加视觉反馈
     */
    addVisualFeedback() {
        // 为调整手柄添加悬停效果
        this.handles.forEach(handle => {
            handle.element.addEventListener('mouseenter', () => {
                if (!this.isResizing) {
                    handle.element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
            });

            handle.element.addEventListener('mouseleave', () => {
                if (!this.isResizing) {
                    handle.element.style.backgroundColor = 'transparent';
                }
            });
        });
    }

    /**
     * 获取调整手柄状态
     */
    getHandleStatus() {
        return this.handles.map(handle => ({
            position: handle.position,
            visible: handle.element.style.display !== 'none',
            active: this.isResizing && this.currentHandle === handle
        }));
    }

    /**
     * 启用/禁用调整功能
     */
    setEnabled(enabled) {
        this.handles.forEach(handle => {
            handle.element.style.pointerEvents = enabled ? 'auto' : 'none';
        });
    }
}

// 导出窗口调整大小类
window.WindowResize = WindowResize;