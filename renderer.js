// 页面加载完成时触发
export function onLoad(_,LiteLoader) {
    const element = document.createElement("style");
    document.head.appendChild(element);

    const plugins_data = betterQQNT.plugins.mspring_theme.path.data;

    mspring_theme.updateStyle((event, message) => {
        element.textContent = message;
    });

    mspring_theme.rendererReady();

    // 判断操作系统类型
    var osType = "";
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("win") !== -1) {
        osType = "windows";
    } else if (userAgent.indexOf("linux") !== -1) {
        osType = "linux";
    }

    document.documentElement.classList.add(osType);

}


// 打开设置界面时触发
function onConfigView(view) {
}