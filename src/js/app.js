/**
 * 主应用初始化模块
 * 负责初始化所有功能模块，重构版本
 */

const WindowManager = require('./app-window-manager.js');
const NavigationManager = require('./app-navigation-manager.js');
const ErrorHandler = require('./app-error-handler.js');
const ClassManager = require('./app-class-manager.js');
const {
    getStatus,
    dispatchEvent,
    waitForDOM,
    detectPlatform,
    logger,
    storage
} = require('./app-utils.js');

class ScoreBoardApp {
    constructor() {
        this.windowManager = null;
        this.navigationManager = null;
        this.errorHandler = null;
        this.classManager = null;
        this.isInitialized = false;
        this.globalEventsBound = false;
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 等待DOM加载完成
        waitForDOM().then(() => {
            this.initialize();
        }).catch(error => {
            console.error('等待DOM加载失败:', error);
            this.handleInitializationError(error);
        });
    }

    /**
     * 初始化所有功能模块
     */
    async initialize() {
        try {
            logger.info('开始初始化应用模块');

            // 1. 初始化错误处理器
            this.errorHandler = new ErrorHandler();
            this.errorHandler.setupErrorHandling();

            // 2. 初始化窗口管理器
            this.windowManager = new WindowManager();
            this.windowManager.initWindowResize();
            this.windowManager.initVerticalSplitter();

            // 3. 初始化导航管理器
            this.navigationManager = new NavigationManager();
            this.navigationManager.initLetterNavigation();

            // 4. 初始化班级管理器
            this.classManager = new ClassManager();
            this.classManager.bindClassButtonEvents();
            this.classManager.bindStudentSelectEvents();

            // 5. 绑定全局事件
            this.bindGlobalEvents();

            // 6. 处理平台信息
            this.handlePlatformInfo();

            this.isInitialized = true;
            this.globalEventsBound = true;

            logger.info('应用模块初始化完成');

            // 触发自定义事件
            dispatchEvent('app-initialized');

        } catch (error) {
            logger.error('应用初始化失败:', error);
            this.errorHandler.handleInitializationError(error);
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听平台信息事件
        window.addEventListener('platform-info', (e) => {
            if (this.classManager) {
                this.classManager.handlePlatformInfo(e.detail);
            }
        });

        // 监听班级变更事件
        window.addEventListener('class-changed', (e) => {
            logger.info('班级已变更:', e.detail);
            // 重新加载学生数据
            this.reloadStudentData();
        });

        // 监听学生选择事件
        window.addEventListener('student-selected', (e) => {
            logger.info('学生已选择:', e.detail);
            // 处理学生选择逻辑
            this.handleStudentSelection(e.detail);
        });

        // 监听窗口大小变化事件
        window.addEventListener('window-resized', (e) => {
            logger.debug('窗口大小已改变:', e.detail);
            // 处理窗口大小变化
            this.handleWindowResize(e.detail);
        });

        // 监听字母导航事件
        window.addEventListener('letter-change', (e) => {
            if (this.navigationManager) {
                this.navigationManager.handleLetterChange(e);
            }
        });

        // 监听应用错误事件
        window.addEventListener('app-error', (e) => {
            logger.error('应用错误:', e.detail);
        });

        logger.info('全局事件绑定完成');
    }

    /**
     * 处理平台信息
     */
    handlePlatformInfo() {
        // 检测平台信息
        const platform = detectPlatform();

        // 触发平台信息事件
        dispatchEvent('platform-info', platform);

        logger.info('平台信息:', platform);
    }

    /**
     * 重新加载学生数据
     */
    async reloadStudentData() {
        try {
            logger.info('重新加载学生数据');
            // 这里可以添加具体的学生数据加载逻辑

            // 更新导航状态
            if (this.navigationManager) {
                this.navigationManager.updateLetterNavigationStatus();
            }

        } catch (error) {
            logger.error('重新加载学生数据失败:', error);
        }
    }

    /**
     * 处理学生选择
     */
    handleStudentSelection(studentInfo) {
        // 这里可以添加具体的学生选择处理逻辑
        logger.info('处理学生选择:', studentInfo);
    }

    /**
     * 处理窗口大小变化
     */
    handleWindowResize(sizeInfo) {
        // 这里可以添加具体的窗口大小变化处理逻辑
        logger.debug('处理窗口大小变化:', sizeInfo);
    }

    /**
     * 处理初始化错误
     */
    handleInitializationError(error) {
        if (this.errorHandler) {
            this.errorHandler.handleInitializationError(error);
        } else {
            // 备用错误处理
            console.error('应用初始化失败:', error);
            alert('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 获取应用状态
     */
    getStatus() {
        return getStatus();
    }

    /**
     * 清理资源
     */
    cleanup() {
        logger.info('开始清理应用资源');

        try {
            // 清理各个模块
            if (this.windowManager) {
                this.windowManager.cleanup();
            }

            if (this.navigationManager) {
                this.navigationManager.cleanup();
            }

            if (this.errorHandler) {
                this.errorHandler.cleanup();
            }

            if (this.classManager) {
                this.classManager.cleanup();
            }

            this.isInitialized = false;
            this.globalEventsBound = false;

            logger.info('应用资源清理完成');

        } catch (error) {
            logger.error('清理应用资源失败:', error);
        }
    }
}

// 创建全局应用实例
window.appInstance = new ScoreBoardApp();

// 导出应用类
module.exports = ScoreBoardApp;