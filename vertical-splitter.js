/**
 * 垂直分割线拖拽功能模块
 * 处理中间垂直分割线的拖拽功能，支持左右移动
 */

class VerticalSplitter {
    constructor(options = {}) {
        this.minSideWidth = options.minSideWidth || 150;
        this.onChange = options.onChange || (() => {});
        this.splitter = null;
        this.leftPanel = null;
        this.rightPanel = null;
        this.isDragging = false;
        this.startX = 0;
        this.startLeft = 0;
        this.init();
    }

    /**
     * 初始化垂直分割线拖拽功能
     */
    init() {
        this.getElements();
        this.bindEvents();
        this.initializePosition();
    }

    /**
     * 获取DOM元素
     */
    getElements() {
        this.splitter = document.getElementById('verticalLine');
        this.leftPanel = document.getElementById('leftPanel');
        this.rightPanel = document.getElementById('rightPanel');

        // 如果分割线不存在，禁用拖拽功能
        if (!this.splitter) {
            console.log('垂直分割线元素不存在，拖拽功能已禁用');
            return false;
        }

        if (!this.leftPanel || !this.rightPanel) {
            console.error('无法找到面板元素');
            return false;
        }

        return true;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.splitter) return;

        // 鼠标事件
        this.splitter.addEventListener('mousedown', (e) => {
            this.startDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e);
        });

        document.addEventListener('mouseup', () => {
            this.endDrag();
        });

        // 触摸事件支持
        this.splitter.addEventListener('touchstart', (e) => {
            this.startDrag(e.touches[0]);
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleDrag(e.touches[0]);
        });

        document.addEventListener('touchend', () => {
            this.endDrag();
        });

        // 窗口大小变化时重新计算
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // 防止拖拽时选中文本
        document.addEventListener('selectstart', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    /**
     * 初始化位置
     */
    initializePosition() {
        if (!this.splitter) return;

        const windowWidth = window.innerWidth;
        const initialLeft = windowWidth / 2;

        // 设置分割线位置 (使用fixed定位，相对于视口)
        this.splitter.style.left = initialLeft + 'px';
        this.splitter.style.top = '60px';
        this.splitter.style.bottom = '60px';
        this.splitter.style.transform = 'none';

        // 初始化面板
        this.updatePanels(initialLeft);
    }

    /**
     * 开始拖拽
     */
    startDrag(e) {
        e.preventDefault();

        this.isDragging = true;
        this.startX = e.clientX;
        this.startLeft = parseInt(window.getComputedStyle(this.splitter).left) || 0;

        // 添加拖拽状态类
        this.splitter.classList.add('dragging');
        document.body.style.cursor = 'ew-resize';

        // 触发自定义事件
        this.dispatchEvent('drag-start', {
            startLeft: this.startLeft,
            startX: this.startX
        });
    }

    /**
     * 处理拖拽
     */
    handleDrag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.startX;
        const windowWidth = window.innerWidth;
        const newLeft = this.startLeft + deltaX;

        // 计算左右两侧宽度
        const leftWidth = newLeft;
        const rightWidth = windowWidth - newLeft;

        // 确保左右两侧都不小于最小宽度
        if (leftWidth >= this.minSideWidth && rightWidth >= this.minSideWidth) {
            // 更新分割线位置
            this.splitter.style.left = newLeft + 'px';

            // 更新面板
            this.updatePanels(newLeft);

            // 触发自定义事件
            this.dispatchEvent('drag', {
                left: newLeft,
                leftWidth: leftWidth,
                rightWidth: rightWidth,
                percentage: (newLeft / windowWidth) * 100
            });
        }
    }

    /**
     * 结束拖拽
     */
    endDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;

        // 移除拖拽状态
        this.splitter.classList.remove('dragging');
        document.body.style.cursor = '';

        // 获取最终位置
        const finalLeft = parseInt(window.getComputedStyle(this.splitter).left);
        const windowWidth = window.innerWidth;
        const percentage = (finalLeft / windowWidth) * 100;

        // 触发自定义事件
        this.dispatchEvent('drag-end', {
            finalLeft: finalLeft,
            percentage: percentage
        });

        // 执行回调
        this.onChange({
            left: finalLeft,
            percentage: percentage,
            leftWidth: finalLeft,
            rightWidth: windowWidth - finalLeft
        });
    }

    /**
     * 更新面板
     */
    updatePanels(leftPosition) {
        if (!this.leftPanel || !this.rightPanel) return;

        const windowWidth = window.innerWidth;
        const splitterWidth = 4; // 分割线宽度

        // 更新左侧面板
        const leftWidth = leftPosition - splitterWidth/2;
        this.leftPanel.style.width = leftWidth + 'px';
        this.leftPanel.style.left = '0px';

        // 更新右侧面板
        const rightWidth = windowWidth - leftPosition - splitterWidth/2;
        const rightLeft = leftPosition + splitterWidth/2;
        this.rightPanel.style.width = rightWidth + 'px';
        this.rightPanel.style.left = rightLeft + 'px';
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        if (this.isDragging) return;

        // 重新计算分割线位置 (fixed定位)
        this.splitter.style.top = '60px';
        this.splitter.style.bottom = '60px';

        // 保持当前比例
        const currentLeft = parseInt(window.getComputedStyle(this.splitter).left) || 0;
        const windowWidth = window.innerWidth;
        const percentage = (currentLeft / windowWidth) * 100;

        // 重新计算位置
        const newLeft = (percentage / 100) * windowWidth;

        // 确保不超出边界
        if (newLeft >= this.minSideWidth && (windowWidth - newLeft) >= this.minSideWidth) {
            this.splitter.style.left = newLeft + 'px';
            this.updatePanels(newLeft);
        } else {
            // 如果超出边界，重置到中间位置
            const centerLeft = windowWidth / 2;
            this.splitter.style.left = centerLeft + 'px';
            this.updatePanels(centerLeft);
        }

        // 触发自定义事件
        this.dispatchEvent('window-resized', {
            windowWidth: windowWidth,
            splitterLeft: parseInt(window.getComputedStyle(this.splitter).left),
            percentage: percentage
        });
    }

    /**
     * 设置最小宽度
     */
    setMinWidth(width) {
        this.minSideWidth = width;
    }

    /**
     * 获取当前位置
     */
    getPosition() {
        if (!this.splitter) return null;

        const left = parseInt(window.getComputedStyle(this.splitter).left) || 0;
        const windowWidth = window.innerWidth;
        const percentage = (left / windowWidth) * 100;

        return {
            left: left,
            percentage: percentage,
            leftWidth: left,
            rightWidth: windowWidth - left
        };
    }

    /**
     * 设置位置
     */
    setPosition(left) {
        if (!this.splitter) return;

        const windowWidth = window.innerWidth;
        const leftWidth = left;
        const rightWidth = windowWidth - left;

        // 检查边界
        if (leftWidth >= this.minSideWidth && rightWidth >= this.minSideWidth) {
            this.splitter.style.left = left + 'px';
            this.updatePanels(left);

            // 触发自定义事件
            this.dispatchEvent('position-set', {
                left: left,
                percentage: (left / windowWidth) * 100
            });
        }
    }

    /**
     * 重置到中间位置
     */
    resetToCenter() {
        const windowWidth = window.innerWidth;
        const centerLeft = windowWidth / 2;
        this.setPosition(centerLeft);
    }

    /**
     * 启用/禁用拖拽
     */
    setEnabled(enabled) {
        if (!this.splitter) return;

        this.splitter.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    /**
     * 显示/隐藏分割线
     */
    setVisible(visible) {
        if (!this.splitter) return;

        this.splitter.style.display = visible ? 'block' : 'none';
    }

    /**
     * 获取状态
     */
    getStatus() {
        return {
            isDragging: this.isDragging,
            minWidth: this.minSideWidth,
            currentPosition: this.getPosition(),
            enabled: this.splitter ? this.splitter.style.pointerEvents !== 'none' : false,
            visible: this.splitter ? this.splitter.style.display !== 'none' : false
        };
    }

    /**
     * 销毁实例
     */
    destroy() {
        if (!this.splitter) return;

        // 移除事件监听器
        this.splitter.removeEventListener('mousedown', this.startDrag);
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.endDrag);
        document.removeEventListener('touchstart', this.startDrag);
        document.removeEventListener('touchmove', this.handleDrag);
        document.removeEventListener('touchend', this.endDrag);
        window.removeEventListener('resize', this.handleWindowResize);
        document.removeEventListener('selectstart', this.preventSelection);

        // 重置样式
        this.splitter.style.cursor = '';
        this.splitter.classList.remove('dragging');
        document.body.style.cursor = '';

        // 重置状态
        this.isDragging = false;
        this.currentHandle = null;
    }

    /**
     * 防止文本选择
     */
    preventSelection(e) {
        if (this.isDragging) {
            e.preventDefault();
        }
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
     * 添加视觉反馈
     */
    addVisualFeedback() {
        if (!this.splitter) return;

        // 为分割线添加悬停效果
        this.splitter.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                this.splitter.style.backgroundColor = '#b8bfc4';
                this.splitter.style.width = '6px';
            }
        });

        this.splitter.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.splitter.style.backgroundColor = '#999ea3';
                this.splitter.style.width = '4px';
            }
        });
    }

    /**
     * 添加拖拽时的视觉反馈
     */
    addDragFeedback() {
        if (!this.splitter) return;

        this.splitter.addEventListener('mousedown', () => {
            this.splitter.style.backgroundColor = '#4a9eff';
            this.splitter.style.width = '6px';
        });

        this.splitter.addEventListener('mouseup', () => {
            if (!this.isDragging) {
                this.splitter.style.backgroundColor = '#999ea3';
                this.splitter.style.width = '4px';
            }
        });
    }
}

// 导出垂直分割线类
window.VerticalSplitter = VerticalSplitter;