/**
 * 学生编辑窗口功能
 * 用于编辑班级的学生名单
 */
class StudentEditWindow {
    constructor() {
        this.classId = null;
        this.className = '';
        this.originalStudents = [];
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        await this.loadClassInfo();
        await this.loadStudents();
        this.bindEvents();
        this.setupPlatformStyling();
        this.updateStudentCount();
    }

    /**
     * 加载班级信息
     */
    async loadClassInfo() {
        return new Promise((resolve) => {
            if (window.electronAPI && window.electronAPI.onClassInfo) {
                window.electronAPI.onClassInfo((data) => {
                    this.classId = data.classId;
                    this.className = data.className;
                    document.getElementById('classNameDisplay').textContent = `班级：${this.className}`;
                    resolve();
                });

                // 请求班级信息
                if (window.electronAPI.getClassInfo) {
                    window.electronAPI.getClassInfo();
                }
            } else {
                // 浏览器环境：使用测试数据
                this.classId = 'test-class';
                this.className = '测试班级';
                document.getElementById('classNameDisplay').textContent = `班级：${this.className}`;
                resolve();
            }
        });
    }

    /**
     * 加载学生列表
     */
    async loadStudents() {
        try {
            if (window.electronAPI && window.electronAPI.getClassStudents) {
                const result = await window.electronAPI.getClassStudents(this.classId);
                if (result.success) {
                    this.originalStudents = result.students || [];
                    document.getElementById('studentTextarea').value = this.originalStudents.join('\n');
                } else {
                    console.error('加载学生失败:', result.error);
                    this.originalStudents = [];
                }
            } else {
                // 浏览器环境：使用测试数据
                this.originalStudents = ['张三', '李四', '王五'];
                document.getElementById('studentTextarea').value = this.originalStudents.join('\n');
            }
        } catch (error) {
            console.error('加载学生失败:', error);
            this.originalStudents = [];
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮事件
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('mousedown', (e) => {
                this.createRipple(closeBtn, e);
            });

            closeBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.closeWindow();
                }, 200);
            });
        }

        // 取消按钮事件
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('mousedown', (e) => {
                this.createRipple(cancelBtn, e);
            });

            cancelBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.closeWindow();
                }, 200);
            });
        }

        // 保存按钮事件
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('mousedown', (e) => {
                this.createRipple(saveBtn, e);
            });

            saveBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.saveStudents();
                }, 200);
            });
        }

        // 文本变化事件
        const textarea = document.getElementById('studentTextarea');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.updateStudentCount();
            });
        }
    }

    /**
     * 更新学生数量显示
     */
    updateStudentCount() {
        const textarea = document.getElementById('studentTextarea');
        const text = textarea.value.trim();
        const students = text ? text.split('\n').map(s => s.trim()).filter(s => s) : [];
        document.getElementById('studentCount').textContent = `当前学生数量：${students.length}人`;
    }

    /**
     * 保存学生列表
     */
    async saveStudents() {
        const textarea = document.getElementById('studentTextarea');
        const text = textarea.value.trim();
        const students = text ? text.split('\n').map(s => s.trim()).filter(s => s) : [];

        try {
            if (window.electronAPI && window.electronAPI.saveClassStudents) {
                const result = await window.electronAPI.saveClassStudents(this.classId, students);
                if (result.success) {
                    alert('学生名单保存成功！');
                    this.closeWindow();
                } else {
                    alert('保存失败：' + result.error);
                }
            } else {
                // 浏览器环境：模拟保存
                console.log('保存学生名单:', students);
                alert('学生名单保存成功！');
                this.closeWindow();
            }
        } catch (error) {
            console.error('保存学生失败:', error);
            alert('保存失败，请重试');
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
    new StudentEditWindow();
});