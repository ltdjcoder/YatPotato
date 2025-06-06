// StringAlias使用示例 - 日期存储和管理
import StringAlias from './StringAlias';

// 示例用法
function dateStorageExample() {
  // 创建今天的日期
  const today = StringAlias.today();
  console.log('今天:', today.toString()); // 输出：2025-06-06

  // 创建指定日期
  const specificDate = StringAlias.date(new Date('2025-06-01'));
  console.log('指定日期:', specificDate.toString()); // 输出：2025-06-01

  // 创建日期数组（不允许重复）
  const dateArray = [];
  const newDate1 = StringAlias.today();
  const newDate2 = StringAlias.date('2025-06-05');
  const newDate3 = StringAlias.today(); // 重复的今天日期

  // 检查并添加日期（避免重复）
  function addDateIfNotExists(dateArray, newDate) {
    const exists = dateArray.some(date => date.equals(newDate));
    if (!exists) {
      dateArray.push(newDate);
    }
    return dateArray;
  }

  addDateIfNotExists(dateArray, newDate1);
  addDateIfNotExists(dateArray, newDate2);
  addDateIfNotExists(dateArray, newDate3); // 这个不会被添加，因为重复

  console.log('唯一日期数组:', dateArray.map(date => date.toString()));
  // 输出：['2025-06-06', '2025-06-05']

  // 验证功能
  const emailAlias = new StringAlias('user@example.com');
  console.log('邮箱验证:', emailAlias.isValidEmail()); // true

  const usernameAlias = new StringAlias('john_doe123');
  console.log('用户名验证:', usernameAlias.isValidUsername()); // true

  // 字符串操作
  const greeting = StringAlias.from('Hello, ')
    .concat(usernameAlias)
    .concat('! Today is ')
    .concat(today);
  console.log('问候语:', greeting.toString());
  // 输出：Hello, john_doe123! Today is 2025-06-06

  return {
    today,
    dateArray,
    greeting
  };
}

export default dateStorageExample;
