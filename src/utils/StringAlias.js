// StringAlias.js - 类似Rust的字符串别名实现
class StringAlias {
  constructor(value = "") {
    this._value = String(value);
  }

  // 获取字符串值
  toString() {
    return this._value;
  }

  // 获取原始值
  valueOf() {
    return this._value;
  }

  // 设置新值
  setValue(value) {
    this._value = String(value);
    return this;
  }

  // 获取长度
  get length() {
    return this._value.length;
  }

  // 检查是否为空
  isEmpty() {
    return this._value.length === 0;
  }

  // 字符串操作方法
  concat(str) {
    return new StringAlias(this._value + str);
  }

  toLowerCase() {
    return new StringAlias(this._value.toLowerCase());
  }

  toUpperCase() {
    return new StringAlias(this._value.toUpperCase());
  }

  trim() {
    return new StringAlias(this._value.trim());
  }

  slice(start, end) {
    return new StringAlias(this._value.slice(start, end));
  }

  replace(search, replacement) {
    return new StringAlias(this._value.replace(search, replacement));
  }

  // 比较方法
  equals(other) {
    return this._value === String(other);
  }

  startsWith(prefix) {
    return this._value.startsWith(String(prefix));
  }

  endsWith(suffix) {
    return this._value.endsWith(String(suffix));
  }

  includes(substring) {
    return this._value.includes(String(substring));
  }

  // 模板字符串支持
  [Symbol.toPrimitive]() {
    return this._value;
  }

  // 验证方法
  isValidEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this._value);
  }

  isValidUsername() {
    return this._value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(this._value);
  }

  isValidPassword() {
    return this._value.length >= 6;
  }

  // 转换为JSON
  toJSON() {
    return this._value;
  }

  // 静态方法
  static from(value) {
    return new StringAlias(value);
  }

  static empty() {
    return new StringAlias("");
  }

  // 创建今天日期的便捷方法
  static today() {
    return new StringAlias(new Date().toISOString().split('T')[0]);
  }

  // 创建指定日期的便捷方法
  static date(dateInput) {
    if (dateInput instanceof Date) {
      return new StringAlias(dateInput.toISOString().split('T')[0]);
    }
    return new StringAlias(String(dateInput));
  }
}

export default StringAlias;
