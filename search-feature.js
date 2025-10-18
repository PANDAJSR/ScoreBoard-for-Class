// 学生搜索功能
function searchStudents(keyword) {
  const students = getAllStudents();
  return students.filter(student =>
    student.toLowerCase().includes(keyword.toLowerCase())
  );
}

// 搜索示例
console.log("搜索'张':", searchStudents('张'));
console.log("搜索'aa':", searchStudents('aa'));