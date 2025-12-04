/**
 * 编码测试脚本
 * 用于验证中文输出是否正常
 */

// 引入编码设置
const { initEncoding } = require('./encoding-setup.js');

// 初始化编码
initEncoding();

console.log('=== 中文编码测试 ===');
console.log('中文日志输出测试：');
console.log('数据目录初始化成功');
console.log('数据库初始化完成');
console.log('应用程序初始化失败');
console.log('设置UTF-8编码失败');
console.log('添加学生成功：张三');
console.log('删除学生成功：李四');
console.log('打开设置窗口失败：未知错误');

console.log('\n=== 中英文混合测试 ===');
console.log('Database connected successfully');
console.log('Database connection failed: 连接超时');
console.log('保存学生名单: [张三, 李四, Wang Wu]');
console.log('获取班级列表失败: 数据库查询错误');

console.log('\n=== 特殊字符测试 ===');
console.log('当前排序结果:');
console.log('1. 张三 (zhangsan)');
console.log('2. 李四 (lisi)');
console.log('3. 王五 (wangwu)');
console.log('排序逻辑：数字/符号 > 字母/中文完全混合按全拼A-Z');

console.log('\n=== 测试完成 ===');
console.log('如果以上中文都能正常显示，说明编码设置成功！');