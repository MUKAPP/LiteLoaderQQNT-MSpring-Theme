// QWQNT框架入口文件

const sharedModulePromise = import('./index.js');

RendererEvents.onSettingsWindowCreated(async () => {
    const { settingWindowCreated, log } = await sharedModulePromise;
    try {

        const packageJson = __self ? __self.meta.packageJson : {};
        const view = await PluginSettings.renderer.registerPluginSettings(packageJson);

        settingWindowCreated(view);
    } catch (error) {
        log('[MSpring Theme] 设置窗口创建时出错:', error);
    }
});