/**
 * 窗口管理模块
 * 负责窗口大小调整、分割条拖拽等功能
 */

class WindowManager {
    constructor() {
        this.resizeHandler = null;
        this.splitterHandler = null;
        this.isDragging = false;
        this.startX = 0;
        this.startWidth = 0;
    }

    /**
     * 初始化窗口调整大小功能
     */
    initWindowResize() {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // 根据窗口大小调整布局
            if (width < 800) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }

            // 通知其他组件窗口大小已改变
            window.dispatchEvent(new CustomEvent('window-resized', {
                detail: { width, height }
            }));
        };

        // 初始化时执行一次
        handleResize();

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);
        this.resizeHandler = handleResize;
    }

    /**
     * 初始化垂直分割线拖拽功能
     */
    initVerticalSplitter() {
        const splitter = document.querySelector('.vertical-splitter');
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = document.querySelector('.right-panel');

        if (!splitter || !leftPanel || !rightPanel) {
            console.warn('分割条或面板元素未找到');
            return;
        }

        const handleMouseDown = (e) => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.startWidth = leftPanel.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.startX;
            const newWidth = Math.max(200, Math.min(600, this.startWidth + deltaX));
            const containerWidth = window.innerWidth;
            const leftPercent = (newWidth / containerWidth) * 100;
            const rightPercent = 100 - leftPercent;

            leftPanel.style.width = leftPercent + '%';
            rightPanel.style.width = rightPercent + '%';

            // 保存分割位置到本地存储
            localStorage.setItem('splitter-position', leftPercent);
        };

        const handleMouseUp = () => {
            if (!this.isDragging) return;

            this.isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        // 绑定事件
        splitter.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // 恢复之前保存的分割位置
        const savedPosition = localStorage.getItem('splitter-position');
        if (savedPosition) {
            const leftPercent = parseFloat(savedPosition);
            const rightPercent = 100 - leftPercent;
            leftPanel.style.width = leftPercent + '%';
            rightPanel.style.width = rightPercent + '%';
        }

        this.splitterHandler = {
            mouseDown: handleMouseDown,
            mouseMove: handleMouseMove,
            mouseUp: handleMouseUp
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        if (this.splitterHandler) {
            const splitter = document.querySelector('.vertical-splitter');
            if (splitter) {
                splitter.removeEventListener('mousedown', this.splitterHandler.mouseDown);
            }
            document.removeEventListener('mousemove', this.splitterHandler.mouseMove);
            document.removeEventListener('mouseup', this.splitterHandler.mouseUp);
        }
    }
}

module.exports = WindowManager;