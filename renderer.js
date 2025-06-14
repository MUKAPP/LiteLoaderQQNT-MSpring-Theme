const plugin_path = LiteLoader.plugins["mspring_theme"].path.plugin;
// import style from "./src/qsetting.css" assert {type: "css"}; 此方法会导致在1.2.3+uno2版本中报错

// 动态插入 qsetting.css
const qsettingStyle = document.createElement("link");
qsettingStyle.rel = "stylesheet";
qsettingStyle.href = `local:///${plugin_path}/src/qsetting.css`;
document.head.appendChild(qsettingStyle);

function log(...args) {
    console.log(`[MSpring Theme]`, ...args);
    mspring_theme.logToMain(...args);
}

function observeElement(selector, callback, callbackEnable = true, interval = 100) {
    const timer = setInterval(function () {
        const element = document.querySelector(selector);
        if (element) {
            if (callbackEnable) {
                callback();
                log("已检测到", selector);
            }
            clearInterval(timer);
        }
    }, interval);
}

function insertHeti(before) {
    // 在页面header插入heti的css和js
    const hetiLinkElement = document.createElement("link");
    hetiLinkElement.rel = "stylesheet";
    hetiLinkElement.href = `local:///${plugin_path}/src/heti-m.css`;
    document.head.appendChild(hetiLinkElement);

    const hetiScriptElement = document.createElement("script");
    hetiScriptElement.src = `local:///${plugin_path}/src/heti-addon.min.js`;
    document.head.appendChild(hetiScriptElement);

    const hetiSpacingElementScriptElement = document.createElement("script");
    hetiSpacingElementScriptElement.textContent = `
            function hetiSpacingElement(element) {
                let heti = new Heti();
                heti.spacingElement(element);
            }
        `;
    document.head.appendChild(hetiSpacingElementScriptElement);

    // 页面变化时，遍历class中包含text-normal的所有元素，如果class不包含heti的就加入heti的class
    // 加入heti的class调用上面的函数
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                const messageContentElements = document.querySelectorAll(before + ".text-normal");
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

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < parts1.length; i++) {
        if (parts2.length === i) {
            return 1;
        }

        if (parts1[i] !== parts2[i]) {
            return parts1[i] > parts2[i] ? 1 : -1;
        }
    }

    return parts1.length === parts2.length ? 0 : -1;
}

try {

    // 页面加载完成时触发
    const element = document.createElement("style");
    document.head.appendChild(element);

    mspring_theme.updateStyle((event, message) => {
        element.textContent = message;
    });

    mspring_theme.rendererReady();

    const settings = await mspring_theme.getSettings();

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

    // 判断是否强制覆盖自己的气泡颜色
    if (settings.forceHostBubbleColor) {
        document.documentElement.classList.add("mspring_force_host_bubble_color");
    }

    // 判断插件background_plugin是否存在且启用
    if (LiteLoader.plugins["background_plugin"] && !LiteLoader.plugins["background_plugin"].disabled) {
        log("[检测]", "已启用背景插件");
        document.documentElement.classList.add("mspring_background_plugin_enabled");
    }

    // 判断插件lite_tools是否存在且启用
    if (LiteLoader.plugins["lite_tools"] && !LiteLoader.plugins["lite_tools"].disabled) {
        log("[检测]", "已启用轻量工具箱");
        const ltData = await mspring_theme.readFile(LiteLoader.plugins["lite_tools"].path.data+"/config.json");
        const ltOptions = JSON.parse(ltData);
        if (ltOptions && ltOptions.background) {
            if (ltOptions.background.enabled) {
                log("[检测]", "已启用轻量工具箱-自定义背景");
                document.documentElement.classList.add("mspring_lite_tool_background_enabled");
            }
        }
    }
    log(document.documentElement.classList);

    let more_materials_enabled = LiteLoader.plugins["more_materials"] && !LiteLoader.plugins["more_materials"].disabled;

    if (more_materials_enabled) {
        log("[检测]", "已启用 More Materials");
    }

    if (document.body.id === "login") {
        log("[检测]", "登录页面");
        // 判断窗口是否是夜间模式
        let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let colorKey = isDarkMode ? 'dark' : 'light';
        let defaultColor = isDarkMode ? '#171717' : '#ffffff';

        document.body.style.backgroundColor = more_materials_enabled ? `var(--background-color-${colorKey})` : defaultColor;
    }

    // 判断是否开启heti
    if (settings.heti) {
        log("[设置]", "开启赫蹏");
        try {
            observeElement('#ml-root .ml-list', function () { insertHeti(".ml-list ") });
        } catch (error) {
            log("[错误]", "赫蹏加载出错", error);
        }
    }

} catch (error) {
    log("[渲染进程错误]", error);
}


// 打开设置界面时触发
export const onSettingWindowCreated = async view => {
    log("[设置]", "打开设置界面");
    try {
        const html_file_path = `local:///${plugin_path}/src/settings.html`;

        view.innerHTML = await (await fetch(html_file_path)).text();

        // 获取设置
        const settings = await mspring_theme.getSettings();
        const themeColor = settings.themeColor;

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

        // 选择id为heti的setting-switch
        const hetiSwitch = view.querySelector("#heti");
        if (settings.heti) {
            hetiSwitch.setAttribute("is-active", "");
        }
        // 给hetiSwitch添加点击监听
        hetiSwitch.addEventListener("click", (event) => {
            const isActive = event.currentTarget.hasAttribute("is-active");

            if (isActive) {
                event.currentTarget.removeAttribute("is-active")
                // 修改settings的heti值为false
                settings.heti = false;
            } else {
                event.currentTarget.setAttribute("is-active", "");
                // 修改settings的heti值为true
                settings.heti = true;
            }

            // 将修改后的settings保存到settings.json
            mspring_theme.setSettings(settings);
        });

        // 选择id为force-host-bubble-color的setting-switch
        const forceHostBubbleColorSwitch = view.querySelector("#force-host-bubble-color");
        if (settings.forceHostBubbleColor) {
            forceHostBubbleColorSwitch.setAttribute("is-active", "");
        }
        // 给forceHostBubbleColorSwitch添加点击监听
        forceHostBubbleColorSwitch.addEventListener("click", (event) => {
            const isActive = event.currentTarget.hasAttribute("is-active");

            if (isActive) {
                event.currentTarget.removeAttribute("is-active")
                // 修改settings的forceHostBubbleColor值为false
                settings.forceHostBubbleColor = false;
            } else {
                event.currentTarget.setAttribute("is-active", "");
                // 修改settings的forceHostBubbleColor值为true
                settings.forceHostBubbleColor = true;
            }

            // 将修改后的settings保存到settings.json
            mspring_theme.setSettings(settings);
        });

        // 版本更新
        const version = view.querySelector("#mst-settings-version");
        version.textContent = LiteLoader.plugins["mspring_theme"].manifest.version

        const updateButton = view.querySelector("#mst-settings-go-to-update");
        updateButton.style.display = "none";

        mspring_theme.fetchData("https://github.com/MUKAPP/LiteLoaderQQNT-MSpring-Theme/releases/latest")
            .then(({ url, content }) => {
                const versionMatch = content.match(/\/releases\/tag\/v(\d+\.\d+\.\d+)/);
                const urlMatch = content.match(/https:\/\/github\.com\/[\w-]+\/[\w-]+\/releases\/tag\/v\d+\.\d+\.\d+/);
                log("urlMatch", urlMatch[0]);
                if (versionMatch) {
                    const new_version = versionMatch[1];
                    log("[版本]", "最新版本", new_version);
                    if (compareVersions(new_version, LiteLoader.plugins["mspring_theme"].manifest.version) > 0) {
                        updateButton.style.display = "block";
                        version.innerHTML += ` <span style="color: #ff4d4f;">(有新版本: ${new_version})</span>`;

                        // 判断 plugininstaller 插件是否存在并启用
                        if (LiteLoader.plugins["plugininstaller"] && !LiteLoader.plugins["plugininstaller"].disabled) {
                            updateButton.addEventListener("click", () => {
                                plugininstaller.updateBySlug("mspring_theme");
                            });
                        } else {
                            version.innerHTML += "<br>未安装PluginInstaller，安装之后可以一键更新，当前需要手动更新"
                            updateButton.addEventListener("click", () => {
                                LiteLoader.api.openExternal(urlMatch[0]);
                            });
                        }
                    } else {
                        version.innerHTML += ` (已是最新版本)`;
                    }
                } else {
                    version.innerHTML += ` (版本更新检查失败)`;
                    log("版本更新检查失败", content);
                }
            })
            .catch((error) => {
                version.innerHTML += ` (版本更新检查失败: ${error.message})`;
                log("版本更新检查失败", error);
            });

        // tg 频道
        const tgChannel = view.querySelector("#msp-tg-channel");
        tgChannel.addEventListener("click", () => {
            deepl_plugin.openWeb("https://t.me/MUKAPP_Personal");
        });

        // 修改设置页面的样式
        SettingElementStyleSheets.styleSheets = [...SettingElementStyleSheets.styleSheets, style];

    } catch (error) {
        log("[设置页面错误]", error);
    }
}
