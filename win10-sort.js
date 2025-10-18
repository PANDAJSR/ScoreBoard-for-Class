const pinyin = require('pinyin');

// 测试数据
const testData = [
  '114514',
  '王五',
  '小明',
  '笑笑',
  '张三',
  'aaa',
  'bbb',
  'ccc',
  '乐乐',
  '李四',
  '孙六'
];

// Win10风格的排序函数
function win10Sort(a, b) {
  // 判断类型：数字/特殊字符、英文、中文
  const typeA = getStringType(a);
  const typeB = getStringType(b);

  // 不同类型按优先级排序：数字 < 英文 < 中文
  const typePriority = { number: 0, english: 1, chinese: 2 };

  if (typeA !== typeB) {
    return typePriority[typeA] - typePriority[typeB];
  }

  // 同类型内部排序
  switch (typeA) {
    case 'number':
      // 数字和特殊字符按原始字符串排序
      return a.localeCompare(b);

    case 'english':
      // 英文不区分大小写排序
      return a.toLowerCase().localeCompare(b.toLowerCase());

    case 'chinese':
      // 中文按拼音排序，但保持自然感觉
      const pinyinA = getPinyinForSort(a);
      const pinyinB = getPinyinForSort(b);
      return pinyinA.localeCompare(pinyinB);
  }
}

// 判断字符串类型
function getStringType(str) {
  if (/^[a-zA-Z]/.test(str)) {
    return 'english';
  } else if (/^[\u4e00-\u9fa5]/.test(str)) {
    return 'chinese';
  } else {
    return 'number'; // 包括数字、特殊字符等
  }
}

// 获取用于排序的拼音（优化版）
function getPinyinForSort(text) {
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

// 测试Win10风格排序
console.log('Win10风格排序结果:');
const win10Sorted = [...testData].sort(win10Sort);
win10Sorted.forEach(item => {
  const type = getStringType(item);
  const pinyin = type === 'chinese' ? getPinyinForSort(item) : item;
  console.log(`  ${item} (${type}${type === 'chinese' ? ': ' + pinyin : ''})`);
});

// 对比：普通全拼排序
console.log('\n普通全拼排序对比:');
const pinyinSorted = [...testData].sort((a, b) => {
  const pinyinA = getPinyinForSort(a);
  const pinyinB = getPinyinForSort(b);
  return pinyinA.localeCompare(pinyinB);
});
pinyinSorted.forEach(item => console.log(`  ${item}`));