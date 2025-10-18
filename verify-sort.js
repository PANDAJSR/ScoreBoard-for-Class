const pinyinModule = require('pinyin');
const pinyin = pinyinModule.default || pinyinModule;

// 您的排序结果
const sortedResult = [
  '114514',
  '乐乐',
  '李四',
  '孙六',
  '王五',
  '小明',
  '笑笑',
  '张三',
  'aaa',
  'bbb',
  'ccc'
];

console.log('当前排序结果:');
sortedResult.forEach((item, index) => {
  const pinyin = getPinyinForSort(item);
  console.log(`${index + 1}. ${item} (${pinyin})`);
});

// 获取拼音函数
function getPinyinForSort(text) {
  try {
    const result = pinyin(text, { style: pinyin.STYLE_NORMAL, heteronym: false });
    return result.map(item => item[0]).join('');
  } catch (error) {
    return text;
  }
}

console.log('\n全拼顺序:');
sortedResult.forEach(item => {
  const pinyin = getPinyinForSort(item);
  console.log(`  ${item}: ${pinyin}`);
});

console.log('\n排序逻辑分析:');
console.log('数字/符号: 114514');
console.log('字母/中文混合按全拼A-Z:');
sortedResult.slice(1).forEach(item => {
  const pinyin = getPinyinForSort(item);
  console.log(`  ${item}: ${pinyin}`);
});