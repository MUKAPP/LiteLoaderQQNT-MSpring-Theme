// 页面加载完成时触发
async function onLoad() {
    const element = document.createElement("style");
    document.head.appendChild(element);

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
    } else if (userAgent.indexOf("mac") !== -1) {
        osType = "mac";
    }
    document.documentElement.classList.add(osType);

}


// 打开设置界面时触发
async function onConfigView(view) {
    const plugin_path = LiteLoader.plugins.mspring_theme.path.plugin;
    const css_file_path = `file://${plugin_path}/src/settings.css`;
    const html_file_path = `file://${plugin_path}/src/settings.html`;

    // CSS
    const link_element = document.createElement("link");
    link_element.rel = "stylesheet";
    link_element.href = css_file_path;
    document.head.appendChild(link_element);

    // HTMl
    const html_text = await (await fetch(html_file_path)).text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html_text, "text/html");
    doc.querySelectorAll("section").forEach(node => view.appendChild(node));

    // 获取设置
    const settings = await mspring_theme.getSettings();
    const themeColor = settings.themeColor;
    const backgroundTransparent = settings.backgroundTransparent;

    // 给pick-color(input)设置默认颜色
    const pickColor = view.querySelector(".pick-color");
    pickColor.value = themeColor;

    // 给pick-color(input)添加事件监听
    pickColor.addEventListener("change", (event) => {
        // 修改settings的themeColor值
        settings.themeColor = event.target.value;
        // 将修改后的settings保存到settings.json
        mspring_theme.setSettings(settings);
    });

    // 背景颜色透明
    const backgroundOpacity = settings.backgroundOpacity;
    // 给pick-opacity(input)设置默认值
    const pickOpacity = view.querySelector(".pick-opacity");
    pickOpacity.value = backgroundOpacity;
    // 给pick-opacity(input)添加事件监听 
    pickOpacity.addEventListener("change", (event) => {
        // 修改settings的backgroundOpacity值 
        settings.backgroundOpacity = event.target.value;
        // 将修改后的settings保存到settings.json 
        mspring_theme.setSettings(settings);
    });
}


export {
    onLoad,
    onConfigView
}