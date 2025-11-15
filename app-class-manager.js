/**
 * 班级管理模块
 * 负责班级相关的操作和管理
 */

class ClassManager {
    constructor() {
        this.currentClass = null;
        this.classButtonHandler = null;
        this.studentSelectHandler = null;
    }

    /**
     * 绑定班级按钮事件
     */
    bindClassButtonEvents() {
        const classButton = document.querySelector('.class-button');
        if (!classButton) {
            console.warn('班级按钮未找到');
            return;
        }

        const handleClassButtonClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 检查是否是Electron环境
            if (window.electronAPI && window.electronAPI.openClassManagement) {
                window.electronAPI.openClassManagement();
            } else {
                // 浏览器环境下的备用方案
                this.openClassManagementFallback();
            }
        };

        // 绑定点击事件
        classButton.addEventListener('click', handleClassButtonClick);
        this.classButtonHandler = handleClassButtonClick;

        // 添加工具提示
        classButton.title = '班级管理（管理班级和学生名单）';
    }

    /**
     * 打开班级管理（备用方案）
     */
    openClassManagementFallback() {
        // 创建一个简单的模态对话框
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 8px; text-align: center; max-width: 400px;">
                <i class="fas fa-info-circle" style="color: #4a90e2; font-size: 48px; margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 12px; color: #333;">班级管理</h3>
                <p style="color: #666; margin-bottom: 20px;">班级管理功能需要在Electron环境中运行。</p>
                <button onclick="this.closest('.modal').remove()"
                        style="background: #4a90e2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    确定
                </button>
            </div>
        `;

        modal.className = 'modal';
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * 绑定学生选择事件
     */
    bindStudentSelectEvents() {
        const handleStudentSelect = (e) => {
            const studentItem = e.target.closest('.student-item');
            if (!studentItem) return;

            // 移除其他选中状态
            document.querySelectorAll('.student-item').forEach(item => {
                item.classList.remove('selected');
            });

            // 添加选中状态
            studentItem.classList.add('selected');

            // 触发自定义事件
            const event = new CustomEvent('student-selected', {
                detail: {
                    studentId: studentItem.dataset.studentId,
                    studentName: studentItem.querySelector('.student-name')?.textContent,
                    studentScore: studentItem.querySelector('.student-score')?.textContent
                }
            });
            window.dispatchEvent(event);
        };

        // 使用事件委托
        document.addEventListener('click', handleStudentSelect);
        this.studentSelectHandler = handleStudentSelect;
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
     * 处理平台信息
     */
    handlePlatformInfo(data) {
        const { isMac } = data;

        // 更新按钮样式
        const classButton = document.querySelector('.class-button');
        if (classButton) {
            if (isMac) {
                classButton.classList.add('mac');
            } else {
                classButton.classList.add('windows');
            }
        }

        // 更新窗口控制按钮
        const windowControls = document.querySelector('.window-controls');
        if (windowControls) {
            windowControls.dataset.platform = isMac ? 'mac' : 'windows';
        }
    }

    /**
     * 获取当前班级信息
     */
    getCurrentClass() {
        return this.currentClass;
    }

    /**
     * 设置当前班级
     */
    setCurrentClass(classInfo) {
        this.currentClass = classInfo;

        // 更新UI
        const classNameElement = document.querySelector('.current-class-name');
        if (classNameElement && classInfo) {
            classNameElement.textContent = classInfo.name;
        }

        // 触发班级变更事件
        const event = new CustomEvent('class-changed', {
            detail: classInfo
        });
        window.dispatchEvent(event);
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.classButtonHandler) {
            const classButton = document.querySelector('.class-button');
            if (classButton) {
                classButton.removeEventListener('click', this.classButtonHandler);
            }
        }

        if (this.studentSelectHandler) {
            document.removeEventListener('click', this.studentSelectHandler);
        }
    }
}

module.exports = ClassManager;