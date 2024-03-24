const plugin_path = LiteLoader.plugins["mspring_theme"].path.plugin;

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

try {


    // 页面加载完成时触发
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

    // 判断插件background_plugin是否存在且启用
    if (LiteLoader.plugins["background_plugin"] && !LiteLoader.plugins["background_plugin"].disabled) {
        log("[检测]", "已启用背景插件");
        document.documentElement.classList.add(`mspring_background_plugin_enabled`);
    }

    // 判断插件lite_tools是否存在且启用
    if (LiteLoader.plugins["lite_tools"] && !LiteLoader.plugins["lite_tools"].disabled) {
        log("[检测]", "已启用轻量工具箱");
        const ltOptions = await lite_tools.getOptions();
        if (ltOptions.background.enabled) {
            log("[检测]", "已启用轻量工具箱-自定义背景");
            document.documentElement.classList.add(`mspring_lite_tool_background_enabled`);
        }
    }

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
    const settings = await mspring_theme.getSettings();
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

        // 添加插件图标
        document.querySelectorAll(".nav-item.liteloader").forEach((node) => {
            // 本插件图标
            if (node.textContent === "MSpring Theme") {
                node.querySelector(".q-icon").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" stroke="currentColor" fill="currentColor"><path d="M247.693-147.694q-34.328 0-67.894-15.077-33.565-15.076-55.95-40.306 22.923-6.539 43.384-27.808 20.461-21.27 20.461-56.808 0-41.922 29.038-70.96 29.038-29.038 70.961-29.038 41.922 0 70.96 29.038 29.038 29.038 29.038 70.96 0 57.75-41.124 98.874-41.125 41.125-98.874 41.125Zm0-59.999q33 0 56.5-23.5t23.5-56.5q0-17-11.5-28.5t-28.5-11.5q-17 0-28.5 11.5t-11.5 28.5q0 23-5.5 42t-14.5 36q5 2 10 2h10Zm212.306-162.308L370.77-459.23l342.614-342.614q11-11 27.5-11.5t28.5 11.5l33.23 33.229q12 12 12 28t-12 28L459.999-370.001Zm-172.306 82.308Z"/></svg>`;
            }
            // LiteLoaderQQNT 图标
            if (node.textContent === "LiteLoaderQQNT") {
                node.querySelector(".q-icon").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" stroke="currentColor" fill="currentColor"><path d="M355.077-140.001H200q-24.922 0-42.461-17.538-17.538-17.539-17.538-42.461v-155.077q41.077-5.001 70.538-34.154Q240-418.385 240-460q0-41.615-29.461-70.769-29.461-29.153-70.538-34.154V-720q0-24.922 17.538-42.461 17.539-17.538 42.461-17.538h160q5.385-38.153 33.423-62.922Q421.462-867.69 460-867.69t66.577 24.769q28.038 24.769 33.423 62.922h160q24.922 0 42.461 17.538 17.538 17.539 17.538 42.461v160q38.153 5.385 62.922 33.423Q867.69-498.538 867.69-460t-24.769 66.577Q818.152-365.385 779.999-360v160q0 24.922-17.538 42.461-17.539 17.538-42.461 17.538H564.923q-5.385-43.077-35.154-71.538Q500-240 460-240q-40 0-69.769 28.461-29.769 28.461-35.154 71.538ZM200-200h108.463q20.538-52.922 64.884-76.46 44.346-23.539 86.653-23.539 42.307 0 86.653 23.539 44.346 23.538 64.884 76.46H720v-217.691h49.229q18.385-2.308 28.424-14.846 10.038-12.539 10.038-27.463 0-14.924-10.038-27.463-10.039-12.538-28.424-14.846H720V-720H502.309v-49.229q-2.308-18.385-14.846-28.424-12.539-10.038-27.463-10.038-14.924 0-27.463 10.038-12.538 10.039-14.846 28.424V-720H200v109.54q45.538 18.846 72.768 59.884 27.231 41.038 27.231 90.576 0 48.922-27.231 89.961-27.23 41.038-72.768 60.499V-200Zm260-260Z"/></svg>`;
            }
        });

        // 等待200ms，给无图标的插件添加图标
        setTimeout(function () {
            document.querySelectorAll(".nav-item.liteloader").forEach((node) => {
                if (node.textContent !== "MSpring Theme" && node.textContent !== "LiteLoaderQQNT" && node.querySelector(".q-icon").innerHTML === "") {
                    node.querySelector(".q-icon").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" stroke="currentColor" fill="currentColor"><path d="m315.001-690.153 108.153-141.923q10.769-14.411 25.577-21.167 14.808-6.756 31.269-6.756t31.269 6.756q14.808 6.756 25.577 21.167l108.153 141.923 165.385 55.846q23.692 7.616 36.961 26.869 13.269 19.254 13.269 42.538 0 10.746-3.141 21.428-3.141 10.681-10.321 20.472L739.46-373.539l4 158.615q1 31.594-20.826 53.258-21.826 21.665-50.865 21.665-.847 0-20.077-2.616L480-191.848l-171.692 49.231q-5 2-10.321 2.308-5.321.308-9.756.308-29.307 0-50.999-21.665-21.692-21.664-20.692-53.258l4-159.615L113.463-523q-7.18-9.83-10.321-20.553T100.001-565q0-22.627 13.182-42.086 13.182-19.46 36.818-27.605l165-55.462Zm37.076 51.691-182.846 60.923q-5.769 1.923-7.885 7.885-2.115 5.962 1.731 10.963l117.846 166.306-4.385 178.692q-.384 6.539 4.616 10.385 5 3.847 11.155 1.923L480-254.077l187.691 53.692q6.155 1.924 11.155-1.923 5-3.846 4.616-10.385l-4.385-179.692 117.846-164.306q3.846-5.001 1.731-10.963-2.116-5.962-7.885-7.885l-182.846-62.923-118.307-156.153q-3.462-5-9.616-5t-9.616 5L352.077-638.462ZM480-499.615Z"/></svg>`;
                }
            })
        }, 200);

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

        // 选择id为heti的q-switch
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

        // 版本更新
        const version = view.querySelector("#mst-settings-version");
        version.textContent = LiteLoader.plugins["mspring_theme"].manifest.version

        const updateButton = view.querySelector("#mst-settings-go-to-update");
        updateButton.style.display = "none";

        const release_latest_url = `https://github.com/MUKAPP/LiteLoaderQQNT-MSpring-Theme/releases/latest`;
        fetch(release_latest_url).then((res) => {
            const new_version = res.url.slice(res.url.lastIndexOf("/") + 1).replace("v", "");
            log("[版本]", "最新版本", new_version);
            if (new_version > LiteLoader.plugins["mspring_theme"].manifest.version) {
                updateButton.style.display = "block";
                updateButton.addEventListener("click", () => {
                    mspring_theme.openWeb(release_latest_url);
                });
                version.innerHTML += ` <span style="color: #ff4d4f;">(有新版本: ${new_version})</span>`;
            } else {
                version.innerHTML += ` (已是最新版本)`;
            }

        });

    } catch (error) {
        log("[设置页面错误]", error);
    }
}