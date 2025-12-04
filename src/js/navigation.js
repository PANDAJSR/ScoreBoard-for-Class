/**
 * 首字母导航功能模块
 * 处理左侧导航栏的字母按钮生成、点击事件和学生列表显示
 */

class LetterNavigation {
    constructor() {
        this.navButtons = document.getElementById('navButtons');
        this.students = this.getSampleStudents();
        this.currentLetter = null;
        this.init();
    }

    /**
     * 初始化导航功能
     */
    init() {
        this.createNavigation();
        this.bindEvents();
        this.showInitialContent();
    }

    /**
     * 获取示例学生数据
     */
    getSampleStudents() {
        return [
            '张三', '李四', '王五', '赵六', '钱七', '孙八', '李九', '周十',
            '白一', '陈二', '程三', '邓四', '冯五', '陈六', '白七', '程八',
            '黄九', '林十', '郑一', '王二', '张三', '李四', '赵五', '钱六',
            '孙七', '李八', '周九', '吴十', '郑一', '王二', '冯三', '陈四',
            '白五', '程六', '邓七', '黄八', '林九', '郑十', '冯一', '陈二',
            'Ava', 'Bob', 'Carl', 'David', 'Emma', 'Frank', 'Grace', 'Henry'
        ];
    }

    /**
     * 创建导航功能
     */
    createNavigation() {
        const letters = window.electronAPI.getFirstLetters(this.students);
        this.createNavButtons(letters);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航按钮点击事件
        this.navButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-button')) {
                this.handleNavButtonClick(e.target);
            }
        });

        // 导航按钮鼠标按下事件 - 添加水波纹效果
        this.navButtons.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('nav-button')) {
                this.createRipple(e.target, e);
            }
        });

        // 键盘导航支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * 显示初始内容
     */
    showInitialContent() {
        const letters = window.electronAPI.getFirstLetters(this.students);
        if (letters.length > 0) {
            this.showStudentsByLetter(letters[0]);
            this.activateButton(letters[0]);
        }
    }

    /**
     * 创建导航按钮
     */
    createNavButtons(letters) {
        this.navButtons.innerHTML = '';

        letters.forEach(letter => {
            const button = this.createNavButton(letter);
            this.navButtons.appendChild(button);
        });

        // 添加水波纹效果
        this.addRippleEffect();
    }

    /**
     * 创建单个导航按钮
     */
    createNavButton(letter) {
        const button = document.createElement('button');
        button.className = 'nav-button';
        button.textContent = letter;
        button.setAttribute('data-letter', letter);
        button.setAttribute('title', `显示以 ${letter} 开头的学生`);

        // 添加水波纹效果
        this.addButtonRippleEffect(button);

        return button;
    }

    /**
     * 处理导航按钮点击
     */
    handleNavButtonClick(button) {
        const letter = button.getAttribute('data-letter');

        // 不再在click中创建水波纹，避免重复触发
        // 激活按钮
        this.activateButton(letter);

        // 显示对应学生
        this.showStudentsByLetter(letter);

        // 触发自定义事件
        this.dispatchEvent('letter-changed', { letter, button });
    }

    /**
     * 处理学生项目点击
     */
    handleStudentClick(studentItem) {
        const studentName = studentItem.querySelector('.student-name').textContent;

        // 不再在click中创建水波纹，避免重复触发
        // 触发自定义事件
        this.dispatchEvent('student-selected', {
            name: studentName,
            element: studentItem
        });

        console.log(`选中了学生: ${studentName}`);
    }

    /**
     * 处理键盘导航
     */
    handleKeyboardNavigation(e) {
        const buttons = Array.from(this.navButtons.querySelectorAll('.nav-button'));
        const activeButton = this.navButtons.querySelector('.nav-button.active');
        let currentIndex = buttons.indexOf(activeButton);

        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    buttons[currentIndex - 1].click();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < buttons.length - 1) {
                    buttons[currentIndex + 1].click();
                }
                break;
            case 'Home':
                e.preventDefault();
                if (buttons.length > 0) {
                    buttons[0].click();
                }
                break;
            case 'End':
                e.preventDefault();
                if (buttons.length > 0) {
                    buttons[buttons.length - 1].click();
                }
                break;
        }
    }

    /**
     * 激活指定字母的按钮
     */
    activateButton(letter) {
        // 移除所有按钮的激活状态
        this.navButtons.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // 激活指定按钮
        const targetButton = this.navButtons.querySelector(`[data-letter="${letter}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
            this.currentLetter = letter;

            // 滚动到可见区域
            this.scrollToButton(targetButton);
        }
    }

    /**
     * 显示特定字母的学生
     */
    showStudentsByLetter(letter) {
        const groups = window.electronAPI.groupStudentsByLetter(this.students);
        const studentList = groups[letter] || [];

        // 由于我们移除了contentBody，现在只在控制台显示信息
        console.log(`显示字母 ${letter} 的学生:`, studentList);

        if (studentList.length === 0) {
            console.log(`没有找到以 ${letter} 开头的学生`);
            return;
        }

        // 触发自定义事件，让其他模块处理显示逻辑
        this.dispatchEvent('students-by-letter', {
            letter,
            students: studentList
        });
    }

    /**
     * 渲染学生列表（现在只在控制台显示）
     */
    renderStudentList(students, letter) {
        console.log(`字母 ${letter} 的学生列表:`);
        students.forEach((student, index) => {
            console.log(`  ${index + 1}. ${student}`);
        });

        // 触发自定义事件，让其他模块处理显示逻辑
        this.dispatchEvent('students-rendered', {
            letter,
            count: students.length,
            students
        });
    }

    /**
     * 创建学生项目
     */
    createStudentItem(student) {
        const item = document.createElement('div');
        item.className = 'student-item';
        item.setAttribute('tabindex', '0'); // 支持键盘导航
        item.setAttribute('title', `点击查看 ${student} 详情`);

        const pinyin = window.electronAPI.getPinyin(student);

        item.innerHTML = `
            <div class="student-name">${student}</div>
            <div class="student-pinyin">${pinyin}</div>
        `;

        // 添加键盘事件支持
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleStudentClick(item);
            }
        });

        return item;
    }

    /**
     * 显示空状态（现在只在控制台显示）
     */
    showEmptyState(letter) {
        console.log(`没有找到以 ${letter} 开头的学生`);

        // 触发自定义事件，让其他模块处理显示逻辑
        this.dispatchEvent('empty-state', {
            letter,
            message: `没有找到以 ${letter} 开头的学生`
        });
    }

    /**
     * 滚动到指定按钮
     */
    scrollToButton(button) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = this.navButtons.getBoundingClientRect();

        if (buttonRect.top < containerRect.top || buttonRect.bottom > containerRect.bottom) {
            button.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    /**
     * 添加水波纹效果 - 已废弃，现在使用mousedown事件
     */
    addRippleEffect() {
        // 不再添加click事件监听器，避免重复触发
        // 水波纹效果已在bindEvents方法中通过mousedown事件处理
    }

    /**
     * 添加按钮水波纹效果 - 已废弃，现在使用mousedown事件
     */
    addButtonRippleEffect(button) {
        // 不再添加click事件监听器，避免重复触发
        // 水波纹效果已在创建按钮时通过mousedown事件处理
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
     * 获取当前激活的字母
     */
    getCurrentLetter() {
        return this.currentLetter;
    }

    /**
     * 获取当前显示的学生列表
     */
    getCurrentStudents() {
        if (!this.currentLetter) return [];
        const groups = window.electronAPI.groupStudentsByLetter(this.students);
        return groups[this.currentLetter] || [];
    }

    /**
     * 更新学生数据
     */
    updateStudents(newStudents) {
        this.students = newStudents;
        this.createNavigation();
        this.showInitialContent();
    }

    /**
     * 销毁导航实例
     */
    destroy() {
        // 移除事件监听器
        this.navButtons.removeEventListener('click', this.handleNavButtonClick);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);

        // 清空内容
        this.navButtons.innerHTML = '';

        // 重置状态
        this.currentLetter = null;
        this.students = [];
    }
}

// 导出导航类供其他模块使用
window.LetterNavigation = LetterNavigation;