// 修复排序边界情况
function improvedSort(students) {
  // 原逻辑：处理空值和特殊字符
  const validStudents = students
    .map(name => name?.trim())
    .filter(name => name && name.length > 0);

  // 新增：处理重复名称，保持稳定性
  const uniqueStudents = [...new Set(validStudents)];

  // 修复：更准确的拼音转换
  return uniqueStudents.sort((a, b) => {
    // 处理数字和符号
    const isNumSymA = !/^[a-zA-Z\u4e00-\u9fa5]/.test(a);
    const isNumSymB = !/^[a-zA-Z\u4e00-\u9fa5]/.test(b);

    if (isNumSymA !== isNumSymB) {
      return isNumSymA ? -1 : 1;
    }

    // 使用更准确的拼音转换
    const pinyinA = getPinyinForSort(a);
    const pinyinB = getPinyinForSort(b);

    // 修复：处理拼音相同的情况
    if (pinyinA === pinyinB) {
      return a.localeCompare(b);
    }

    return pinyinA.localeCompare(pinyinB);
  });
}

function getPinyinForSort(text) {
  try {
    const pinyinModule = require('pinyin');
    const pinyin = pinyinModule.default || pinyinModule;
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    });
    return result.map(item => item[0]).join('');
  } catch (error) {
    return text;
  }
}

module.exports = { improvedSort, getPinyinForSort };