/**
 * Heti 浏览器注入入口。
 * 将默认导出挂到全局，保持与当前主题脚本注入方式兼容。
 */
import Heti from './heti-addon.js';

globalThis.Heti = Heti;
