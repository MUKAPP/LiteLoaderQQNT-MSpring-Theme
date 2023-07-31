const plugin_path = LiteLoader.plugins.mspring_theme.path.plugin;

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
    if (LiteLoader.os.platform === "win32") {
        osType = "windows";
    } else if (LiteLoader.os.platform === "linux") {
        osType = "linux";
    } else if (LiteLoader.os.platform === "darwin") {
        osType = "mac";
    }
    document.documentElement.classList.add(osType);

    // 判断是否开启heti
    const settings = await mspring_theme.getSettings();
    if (settings.heti) {
        // 在页面header插入heti的css和js
        const hetiLinkElement = document.createElement("link");
        hetiLinkElement.rel = "stylesheet";
        hetiLinkElement.href = "https://unpkg.com/heti/umd/heti.min.css";
        document.head.appendChild(hetiLinkElement);

        const hetiScriptElement = document.createElement("script");
        hetiScriptElement.src = "https://unpkg.com/heti/umd/heti-addon.min.js";
        document.head.appendChild(hetiScriptElement);

        // 在页面header插入一段script，写一个函数
        // 需要传入一个元素，这个元素是heti的spacingElement方法的参数
        // let heti = new Heti()
        // heti.spacingElement(这个元素)
        const hetiSpacingElementScriptElement = document.createElement("script");
        hetiSpacingElementScriptElement.textContent = `
            function hetiSpacingElement(element) {
                let heti = new Heti();
                heti.spacingElement(element);
            }
        `;
        document.head.appendChild(hetiSpacingElementScriptElement);

        // 页面变化时，遍历class中包含message-content的所有元素，如果class不包含heti的就加入heti的class
        // 加入heti的class调用上面的函数
        const observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "childList") {
                    const messageContentElements = document.querySelectorAll(".message-content");
                    messageContentElements.forEach(element => {
                        if (!element.classList.contains("heti")) {
                            element.classList.add("heti");
                            hetiSpacingElement(element);
                        }
                    });
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

    }

}

// 打开设置界面时触发
async function onConfigView(view) {
    const css_file_path = `llqqnt://local-file/${plugin_path}/src/settings.css`;
    const html_file_path = `llqqnt://local-file/${plugin_path}/src/settings.html`;

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

    // 判断操作系统，如果不是windows就隐藏id为mst-settings-background-opacity的div
    if (LiteLoader.os.platform !== "win32") {
        view.querySelector("#mst-settings-background-opacity").style.display = "none";
    }

    // 选择id为heti的q-switch
    const hetiSwitch = view.querySelector("#heti");
    // 判断settings的heti值，如果为false就移除is-active
    if (!settings.heti) {
        hetiSwitch.classList.remove("is-active");
    }
    // 给hetiSwitch添加点击监听
    hetiSwitch.addEventListener("click", (event) => {
        // 判断是否有is-active，如果有就移除，如果没有就添加
        if (hetiSwitch.classList.contains("is-active")) {
            hetiSwitch.classList.remove("is-active");
            // 修改settings的heti值为false
            settings.heti = false;
        } else {
            hetiSwitch.classList.add("is-active");
            // 修改settings的heti值为true
            settings.heti = true;
        }
        // 将修改后的settings保存到settings.json
        mspring_theme.setSettings(settings);
    });
}


export {
    onLoad,
    onConfigView
}