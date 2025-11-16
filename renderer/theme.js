
async function initTheme({ log, mspring_theme }) {
    log("[渲染进程初始化]", `开始初始化`);
    try {
        // 页面加载完成时触发
        const element = document.createElement("style");
        document.head.appendChild(element);

        mspring_theme.updateStyle((event, message) => {
            element.textContent = message;
        });

        mspring_theme.rendererReady();

        const settings = await mspring_theme.getSettings();
        return settings;

    } catch (error) {
        log("[渲染进程错误]", error);
        return {};
    }
}

export {
    initTheme
}