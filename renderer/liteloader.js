import { settingWindowCreated, initTheme, setupThemeFeatures } from './index.js';

// 1. 设置主题特性
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const settings = await initTheme();
        setupThemeFeatures(settings);
    });
} else {
    initTheme().then(settings => {
        setupThemeFeatures(settings);
    });
}

// 2. 导出设置窗口创建函数，以满足LiteLoader的要求
export const onSettingWindowCreated = async (view) => {
    settingWindowCreated(view);
};