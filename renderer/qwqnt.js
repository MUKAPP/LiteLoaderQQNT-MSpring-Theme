// renderer_qwqnt.js - QWQNT框架入口文件

const sharedModulePromise = import('./index.js');

(async () => {
    try {
        const { initTheme, setupThemeFeatures } = await sharedModulePromise;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                const settings = await initTheme();
                setupThemeFeatures(settings);
            });
        } else {
            const settings = await initTheme();
            setupThemeFeatures(settings);
        }
    } catch (error) {
        console.error('[MSpring Theme] 初始化主题时出错:', error);
    }
})();

RendererEvents.onSettingsWindowCreated(async () => {
    try {
        const { settingWindowCreated, log } = await sharedModulePromise;
        
        const packageJson = __self ? __self.meta.packageJson : {};
        const view = await PluginSettings.renderer.registerPluginSettings(packageJson);
        
        settingWindowCreated(view);
    } catch (error) {
        console.error('[MSpring Theme] 设置窗口创建时出错:', error);
    }
});