/**
 * 导航管理模块
 * 负责首字母导航、学生选择等功能
 */

class NavigationManager {
    constructor() {
        this.currentLetter = '';
        this.navigationHandler = null;
        this.studentSelectHandler = null;
    }

    /**
     * 初始化首字母导航功能
     */
    initLetterNavigation() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const letterNav = document.querySelector('.letter-navigation');

        if (!letterNav) {
            console.warn('字母导航元素未找到');
            return;
        }

        // 清空现有内容
        letterNav.innerHTML = '';

        // 创建字母按钮
        letters.forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.className = 'letter-item';
            letterElement.textContent = letter;
            letterElement.dataset.letter = letter;
            letterElement.title = `跳转到${letter}开头的学生`;

            // 检查是否有该字母开头的学生
            const hasStudents = this.checkLetterHasStudents(letter);
            if (!hasStudents) {
                letterElement.classList.add('disabled');
            }

            letterNav.appendChild(letterElement);
        });

        // 绑定字母点击事件
        const handleLetterClick = (e) => {
            const letterItem = e.target.closest('.letter-item');
            if (!letterItem || letterItem.classList.contains('disabled')) return;

            const letter = letterItem.dataset.letter;
            this.scrollToLetter(letter);
            this.updateActiveLetter(letter);
        };

        letterNav.addEventListener('click', handleLetterClick);
        this.navigationHandler = handleLetterClick;

        // 监听学生列表变化，更新字母导航状态
        this.updateLetterNavigationStatus();
    }

    /**
     * 检查指定字母是否有对应的学生
     */
    checkLetterHasStudents(letter) {
        const studentItems = document.querySelectorAll('.student-item');
        return Array.from(studentItems).some(item => {
            const name = item.querySelector('.student-name')?.textContent || '';
            return name.toUpperCase().startsWith(letter);
        });
    }

    /**
     * 滚动到指定字母的学生
     */
    scrollToLetter(letter) {
        const studentItems = document.querySelectorAll('.student-item');
        const targetItem = Array.from(studentItems).find(item => {
            const name = item.querySelector('.student-name')?.textContent || '';
            return name.toUpperCase().startsWith(letter);
        });

        if (targetItem) {
            targetItem.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * 更新当前激活的字母
     */
    updateActiveLetter(letter) {
        const letterItems = document.querySelectorAll('.letter-item');
        letterItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.letter === letter) {
                item.classList.add('active');
            }
        });
        this.currentLetter = letter;
    }

    /**
     * 更新字母导航状态
     */
    updateLetterNavigationStatus() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        letters.forEach(letter => {
            const letterElement = document.querySelector(`[data-letter="${letter}"]`);
            if (letterElement) {
                const hasStudents = this.checkLetterHasStudents(letter);
                letterElement.classList.toggle('disabled', !hasStudents);
            }
        });
    }

    /**
     * 处理字母变化事件
     */
    handleLetterChange(e) {
        const letter = e.detail.letter;
        if (letter) {
            this.updateActiveLetter(letter);
            this.scrollToLetter(letter);
        }
    }

    /**
     * 处理学生选择事件
     */
    handleStudentSelect(e) {
        const studentId = e.detail.studentId;
        if (studentId) {
            // 高亮选中的学生
            const studentItems = document.querySelectorAll('.student-item');
            studentItems.forEach(item => {
                item.classList.remove('selected');
                if (item.dataset.studentId === studentId) {
                    item.classList.add('selected');
                }
            });
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        const letterNav = document.querySelector('.letter-navigation');
        if (letterNav && this.navigationHandler) {
            letterNav.removeEventListener('click', this.navigationHandler);
        }
    }
}

module.exports = NavigationManager;