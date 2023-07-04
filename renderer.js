// 页面加载完成时触发
export function onLoad() {
    const element = document.createElement("style");
    document.head.appendChild(element);

    const plugins_data = betterQQNT.plugins.mspring_theme.path.data;

    mspring_theme.updateStyle((event, message) => {
        element.textContent = message;
    });

    mspring_theme.rendererReady();
}


// 打开设置界面时触发
function onConfigView(view) {
}