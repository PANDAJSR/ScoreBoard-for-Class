const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const pinyinModule = require('pinyin');
const pinyin = pinyinModule.default || pinyinModule;

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  require('child_process').exec('chcp 65001', (err) => {
    if (err) console.log('设置UTF-8编码失败:', err);
  });
}

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'data.db');
  }

  // 初始化数据库
  initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection failed:', err);
          reject(err);
        } else {
          console.log('Database connected successfully');
          this.createTable().then(resolve).catch(reject);
        }
      });
    });
  }

  // 创建学生表
  createTable() {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error('Create table failed:', err);
          reject(err);
        } else {
          console.log('Students table created successfully');
          resolve();
        }
      });
    });
  }

  // 获取所有学生（按混合排序返回）
  getAllStudents() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT name FROM students';
      this.db.all(sql, (err, rows) => {
        if (err) {
          console.error('Query students failed:', err);
          reject(err);
        } else {
          const students = rows.map(row => row.name);
          // 按混合排序重新排序：数字/符号 > 字母/中文全拼A-Z
          const sortedStudents = students.sort((a, b) => this.mixedSort(a, b));
          resolve(sortedStudents);
        }
      });
    });
  }

  // 判断是否为数字/符号（用于严格排序）
  isNumberOrSymbol(str) {
    return !/^[a-zA-Z\u4e00-\u9fa5]/.test(str);
  }

  // 获取用于排序的拼音
  getPinyinForSort(text) {
    try {
      const result = pinyin(text, {
        style: pinyin.STYLE_NORMAL,
        heteronym: false
      });
      return result.map(item => item[0]).join('');
    } catch (error) {
      return text;
    }
  }

  // 混合排序函数：数字/符号 > 字母/中文完全混合按全拼A-Z
  mixedSort(a, b) {
    const isNumSymA = this.isNumberOrSymbol(a);
    const isNumSymB = this.isNumberOrSymbol(b);

    // 如果一个是数字/符号，另一个不是，数字/符号排在前面
    if (isNumSymA !== isNumSymB) {
      return isNumSymA ? -1 : 1;
    }

    // 如果都是数字/符号，按字符串排序
    if (isNumSymA && isNumSymB) {
      return a.localeCompare(b);
    }

    // 如果都是字母/中文，完全混合按全拼A-Z排序
    const pinyinA = this.getPinyinForSort(a);
    const pinyinB = this.getPinyinForSort(b);
    return pinyinA.localeCompare(pinyinB);
  }

  // 保存学生列表（先清空再插入，按严格排序：数字/符号 > 字母/中文全拼A-Z）
  saveStudents(students) {
    return new Promise((resolve, reject) => {
      // 过滤空值并按严格排序：数字/符号 > 字母/中文全拼A-Z
      const validStudents = students
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .sort((a, b) => this.mixedSort(a, b));

      const deleteSql = 'DELETE FROM students';

      this.db.run(deleteSql, (err) => {
        if (err) {
          console.error('Clear students table failed:', err);
          reject(err);
          return;
        }

        if (validStudents.length === 0) {
          resolve();
          return;
        }

        const insertSql = 'INSERT INTO students (name) VALUES (?)';
        let completed = 0;

        validStudents.forEach((student) => {
          this.db.run(insertSql, [student], (err) => {
            if (err) {
              console.error('Insert student failed:', err);
              reject(err);
              return;
            }

            completed++;
            if (completed === validStudents.length) {
              console.log(`Saved ${completed} students in mixed order (numbers/symbols > mixed letters/chinese A-Z)`);
              resolve();
            }
          });
        });
      });
    });
  }

  // 添加单个学生
  addStudent(name) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO students (name) VALUES (?)';
      this.db.run(sql, [name], function(err) {
        if (err) {
          console.error('添加学生失败:', err);
          reject(err);
        } else {
          console.log(`添加学生成功: ${name}`);
          resolve(this.lastID);
        }
      });
    });
  }

  // 删除学生
  deleteStudent(name) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM students WHERE name = ?';
      this.db.run(sql, [name], function(err) {
        if (err) {
          console.error('删除学生失败:', err);
          reject(err);
        } else {
          console.log(`删除学生成功: ${name}`);
          resolve(this.changes);
        }
      });
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('关闭数据库失败:', err);
        } else {
          console.log('数据库连接已关闭');
        }
      });
    }
  }
}

module.exports = DatabaseManager;