/**
 * 班级管理窗口功能
 * 每个班级存储为独立的SQLite文件
 */
class ClassManagement {
    constructor() {
        this.currentClass = null; // 当前选中的班级
        this.classes = []; // 班级列表
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        await this.loadClassList();
        this.bindEvents();
        this.setupPlatformStyling();
    }

    /**
     * 加载班级列表
     */
    async loadClassList() {
        try {
            if (window.electronAPI && window.electronAPI.getClassList) {
                this.classes = await window.electronAPI.getClassList();
            } else {
                // 浏览器环境：从localStorage获取班级列表
                const stored = localStorage.getItem('classList');
                this.classes = stored ? JSON.parse(stored) : [];
            }
            this.renderClassList();
        } catch (error) {
            this.classes = [];
            this.renderClassList();
        }
    }

    /**
     * 渲染班级列表
     */
    renderClassList() {
        const classList = document.getElementById('classList');
        classList.innerHTML = '';

        if (this.classes.length === 0) {
            classList.innerHTML = '<div class="empty-message">暂无班级，请点击"新建班级"按钮创建</div>';
            return;
        }

        this.classes.forEach((classItem, index) => {
            const item = document.createElement('div');
            item.className = 'class-item';
            if (classItem.id === this.currentClass) {
                item.classList.add('selected');
            }

            item.innerHTML = `
                <input type="radio" name="class" value="${classItem.id}"
                       ${classItem.id === this.currentClass ? 'checked' : ''}>
                <span class="class-item-name">${classItem.name}</span>
                <span class="class-item-students">${classItem.studentCount || 0}人</span>
            `;

            // 点击整个项目选择
            item.addEventListener('click', () => {
                this.selectClass(classItem.id);
            });

            classList.appendChild(item);
        });
    }

    /**
     * 选择班级
     */
    selectClass(classId) {
        this.currentClass = classId;
        this.renderClassList();
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

        // 班级管理按钮事件
        const newClassBtn = document.getElementById('newClassBtn');
        if (newClassBtn) {
            newClassBtn.addEventListener('mousedown', (e) => {
                this.createRipple(newClassBtn, e);
            });
            newClassBtn.addEventListener('click', () => {
                this.createNewClass();
            });
        }

        const editClassBtn = document.getElementById('editClassBtn');
        if (editClassBtn) {
            editClassBtn.addEventListener('mousedown', (e) => {
                this.createRipple(editClassBtn, e);
            });
            editClassBtn.addEventListener('click', () => {
                this.editClassInfo();
            });
        }

        const deleteClassBtn = document.getElementById('deleteClassBtn');
        if (deleteClassBtn) {
            deleteClassBtn.addEventListener('mousedown', (e) => {
                this.createRipple(deleteClassBtn, e);
            });
            deleteClassBtn.addEventListener('click', () => {
                this.deleteClass();
            });
        }
    }

    /**
     * 显示自定义输入对话框
     */
    showInputDialog(message, defaultValue = '') {
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                min-width: 300px;
                max-width: 400px;
            `;

            // 创建标题
            const title = document.createElement('h3');
            title.textContent = message;
            title.style.cssText = `
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #333;
            `;

            // 创建输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.value = defaultValue;
            input.placeholder = '请输入班级名称';
            input.style.cssText = `
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
                margin-bottom: 15px;
            `;

            // 创建按钮容器
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            `;

            // 创建取消按钮
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '取消';
            cancelBtn.style.cssText = `
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: #f5f5f5;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;
            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(null);
            };

            // 创建确定按钮
            const okBtn = document.createElement('button');
            okBtn.textContent = '确定';
            okBtn.style.cssText = `
                padding: 8px 16px;
                border: none;
                background: #007acc;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            `;
            okBtn.onclick = () => {
                const value = input.value.trim();
                document.body.removeChild(overlay);
                resolve(value);
            };

            // 组装对话框
            buttonContainer.appendChild(cancelBtn);
            buttonContainer.appendChild(okBtn);
            dialog.appendChild(title);
            dialog.appendChild(input);
            dialog.appendChild(buttonContainer);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 自动聚焦到输入框
            input.focus();
            input.select();

            // 按Enter键确认
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    okBtn.click();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelBtn.click();
                }
            };
        });
    }

    /**
     * 创建新班级
     */
    async createNewClass() {
        // 使用自定义对话框代替prompt
        const className = await this.showInputDialog('请输入新班级名称：');
        if (!className) {
            return;
        }

        try {
            if (window.electronAPI && window.electronAPI.createClass) {
                // Electron环境：创建SQLite文件
                const result = await window.electronAPI.createClass(className);

                if (result.success) {
                    this.classes.push(result.classData);
                    this.saveClassList();
                    this.renderClassList();
                    alert(`班级"${className}"创建成功！`);
                } else {
                    alert('创建班级失败：' + result.error);
                }
            } else {
                // 浏览器环境：模拟创建班级
                const newClass = {
                    id: Date.now().toString(),
                    name: className,
                    studentCount: 0,
                    filePath: `class_${Date.now()}.db`
                };
                this.classes.push(newClass);
                this.saveClassList();
                this.renderClassList();
                alert(`班级"${className}"创建成功！`);
            }
        } catch (error) {
            alert('创建班级失败，请重试');
        }
    }

    /**
     * 编辑班级信息
     */
    async editClassInfo() {
        if (!this.currentClass) {
            alert('请先选择一个班级');
            return;
        }

        const currentClassData = this.classes.find(c => c.id === this.currentClass);
        if (!currentClassData) return;

        // 打开学生名单编辑窗口
        try {
            if (window.electronAPI && window.electronAPI.editClassStudents) {
                // Electron环境：打开学生名单编辑
                const result = await window.electronAPI.editClassStudents(this.currentClass);
                if (result.success) {
                    // 更新学生数量
                    currentClassData.studentCount = result.studentCount;
                    this.saveClassList();
                    this.renderClassList();
                }
            } else {
                // 浏览器环境：弹出学生名单编辑
                const studentsText = prompt('请输入学生名单（每行一个学生姓名）：',
                    currentClassData.students ? currentClassData.students.join('\n') : '');

                if (studentsText !== null) {
                    const students = studentsText.split('\n').map(s => s.trim()).filter(s => s);
                    currentClassData.students = students;
                    currentClassData.studentCount = students.length;
                    this.saveClassList();
                    this.renderClassList();
                }
            }
        } catch (error) {
            console.error('编辑班级信息失败:', error);
            alert('编辑班级信息失败，请重试');
        }
    }

    /**
     * 删除班级
     */
    async deleteClass() {
        if (!this.currentClass) {
            alert('请先选择一个班级');
            return;
        }

        const currentClassData = this.classes.find(c => c.id === this.currentClass);
        if (!currentClassData) return;

        if (!confirm(`确定要删除班级"${currentClassData.name}"吗？\n注意：这将同时删除该班级的所有学生数据。`)) {
            return;
        }

        try {
            if (window.electronAPI && window.electronAPI.deleteClass) {
                // Electron环境：删除SQLite文件
                const result = await window.electronAPI.deleteClass(this.currentClass);
                if (result.success) {
                    this.classes = this.classes.filter(c => c.id !== this.currentClass);
                    if (this.currentClass === currentClassData.id) {
                        this.currentClass = null;
                    }
                    this.saveClassList();
                    this.renderClassList();
                } else {
                    alert('删除班级失败：' + result.error);
                }
            } else {
                // 浏览器环境：从列表中移除
                this.classes = this.classes.filter(c => c.id !== this.currentClass);
                if (this.currentClass === currentClassData.id) {
                    this.currentClass = null;
                }
                this.saveClassList();
                this.renderClassList();
            }
        } catch (error) {
            console.error('删除班级失败:', error);
            alert('删除班级失败，请重试');
        }
    }

    /**
     * 保存班级列表
     */
    saveClassList() {
        try {
            if (window.electronAPI && window.electronAPI.saveClassList) {
                // Electron环境：通过主进程保存
                window.electronAPI.saveClassList(this.classes);
            } else {
                // 浏览器环境：保存到localStorage
                localStorage.setItem('classList', JSON.stringify(this.classes));
            }
        } catch (error) {
            console.error('保存班级列表失败:', error);
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
    new ClassManagement();
});