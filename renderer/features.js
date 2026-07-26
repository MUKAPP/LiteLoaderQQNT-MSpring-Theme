
async function insertHeti(messageListElement, selector, mspring_theme, plugin_path) {
    // 在页面header插入heti的css和js
    const hetiAddonCSS = await mspring_theme.readFile(`${plugin_path}/src/heti-m.css`);
    const hetiStyleElement = document.createElement("style");
    hetiStyleElement.textContent = hetiAddonCSS;
    document.head.appendChild(hetiStyleElement);

    const hetiAddonJS = await mspring_theme.readFile(`${plugin_path}/src/heti-addon.js`);
    const hetiScriptElement = document.createElement("script");
    hetiScriptElement.textContent = hetiAddonJS;
    document.head.appendChild(hetiScriptElement);

    const hetiSpacingElementScriptElement = document.createElement("script");
    hetiSpacingElementScriptElement.textContent = `
            function hetiSpacingElement(element) {
                let heti = new Heti();
                heti.spacingElement(element);
            }
        `;
    document.head.appendChild(hetiSpacingElementScriptElement);

    function applyHetiToElement(element) {
        if (!element.matches(selector) || element.querySelector("heti-spacing, heti-adjacent, heti-close")) {
            return;
        }

        element.classList.add("heti");
        hetiSpacingElement(element);
    }

    // 页面变化时，遍历 class 中包含 text-normal 的所有元素
    function processHeti(rootElement) {
        if (!rootElement || rootElement.nodeType !== 1) {
            return;
        }

        applyHetiToElement(rootElement);
        rootElement.querySelectorAll(selector).forEach(applyHetiToElement);
    }

    let processTimer = null;
    const pendingRoots = new Set();

    function scheduleHetiProcess(element) {
        if (!element || element.nodeType !== 1) {
            return;
        }

        pendingRoots.add(element);

        if (processTimer !== null) {
            return;
        }

        processTimer = requestAnimationFrame(() => {
            pendingRoots.forEach(processHeti);
            pendingRoots.clear();
            processTimer = null;
        });
    }

    // 处理页面上已经存在的元素
    processHeti(messageListElement);

    // 设置监听器，处理新增元素和后续文本重渲染
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                if (mutation.target.nodeType === 1) {
                    scheduleHetiProcess(mutation.target);
                }

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        scheduleHetiProcess(node);
                    }
                });
            } else if (mutation.type === "characterData" && mutation.target.parentElement) {
                scheduleHetiProcess(mutation.target.parentElement);
            }
        }
    });
    observer.observe(messageListElement, { childList: true, subtree: true, characterData: true });
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

let contextSubMenuTopLayerObserver = null;

/**
 * 将二级菜单放入浏览器 Top Layer，但保留原始 DOM 父子关系。
 * backdrop-filter 会让一级菜单成为 fixed 后代的 containing block；Top Layer 可绕过
 * 该定位和裁切限制，同时不破坏二级菜单的事件冒泡与 Vue 生命周期。
 */
function setupContextSubMenuTopLayer() {
    if (contextSubMenuTopLayerObserver || !document.body) {
        return;
    }

    const selector = ".q-context-sub-menu__container:not(.is-pure)";

    const showSubMenus = (root) => {
        if (!(root instanceof Element)) {
            return;
        }

        const subMenus = root.matches(selector)
            ? [root]
            : root.querySelectorAll(selector);

        for (const subMenu of subMenus) {
            if (typeof subMenu.showPopover !== "function") {
                continue;
            }

            subMenu.setAttribute("popover", "manual");
            if (!subMenu.matches(":popover-open")) {
                try {
                    subMenu.showPopover();
                } catch (error) {
                    // Vue 可能已在观察器回调前移除菜单，此时无需处理。
                    if (subMenu.isConnected) {
                        throw error;
                    }
                }
            }
        }
    };

    contextSubMenuTopLayerObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                showSubMenus(node);
            }
        }
    });

    contextSubMenuTopLayerObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    showSubMenus(document.body);
}

async function setupThemeFeatures(settings, { log, mspring_theme, frameworkType, plugin_path, observeElement }) {
    try {
        // 判断操作系统类型
        var osType = "";
        const platform = mspring_theme.getPlatform();

        if (platform === "win32") {
            osType = "windows";
        } else if (platform === "linux") {
            osType = "linux";
        } else if (platform === "darwin") {
            osType = "mac";
        }
        document.documentElement.classList.add(osType);

        setupContextSubMenuTopLayer();

        // 判断是否强制覆盖自己的气泡颜色
        if (settings.forceHostBubbleColor) {
            document.documentElement.classList.add("mspring_force_host_bubble_color");
        }

        // 强制覆盖气泡颜色 设置监听
        mspring_theme.onApplyForceBubbleColor((event, state) => {
            const docElement = document.documentElement;
            log(`设置修改强制气泡颜色: ${state}`);
            if (state) {
                docElement.classList.add("mspring_force_host_bubble_color");
            } else {
                docElement.classList.remove("mspring_force_host_bubble_color");
            }
        });

        // 判断是否强制覆盖夜间模式主页背景
        if (settings.forceNightModeBackground) {
            document.documentElement.classList.add("mspring_force_night_mode_background");
        }

        // 强制覆盖夜间模式背景 设置监听
        mspring_theme.onApplyForceNightModeBackground((event, state) => {
            const docElement = document.documentElement;
            log(`设置修改强制夜间模式背景: ${state}`);
            if (state) {
                docElement.classList.add("mspring_force_night_mode_background");
            } else {
                docElement.classList.remove("mspring_force_night_mode_background");
            }
        });

        if (frameworkType === "liteloader") {
            // 判断插件background_plugin是否存在且启用
            if (LiteLoader.plugins["background_plugin"] && !LiteLoader.plugins["background_plugin"].disabled) {
                log("[检测]", "已启用背景插件");
                document.documentElement.classList.add("mspring_background_plugin_enabled");
            }

            // 判断插件lite_tools是否存在且启用
            if (LiteLoader.plugins["lite_tools"] && !LiteLoader.plugins["lite_tools"].disabled) {
                log("[检测]", "已启用轻量工具箱");
                const ltData = await mspring_theme.readFile(LiteLoader.plugins["lite_tools"].path.data + "/config.json");
                const ltOptions = JSON.parse(ltData);
                if (ltOptions && ltOptions.background) {
                    if (ltOptions.background.enabled) {
                        log("[检测]", "已启用轻量工具箱-自定义背景");
                        document.documentElement.classList.add("mspring_lite_tool_background_enabled");
                    }
                }
            }
            log(document.documentElement.classList);
        }

        let more_materials_enabled = false;
        if (frameworkType === "liteloader") {
            more_materials_enabled = !!(LiteLoader.plugins["more_materials"] && !LiteLoader.plugins["more_materials"].disabled);
        } else if (frameworkType === "qwqnt") {
            // QwQNT 插件名为 qwqnt-more-materials
            more_materials_enabled = !!(qwqnt?.framework?.plugins?.["qwqnt-more-materials"]
                || qwqnt?.framework?.plugins?.["more_materials"]);
        }

        if (more_materials_enabled) {
            log("[检测]", "已启用 More Materials");
            document.documentElement.classList.add("mspring_more_materials_enabled");
        }

        const url = window.location.href;
        log("[检测]", "当前页面", url);

        // 兼容旧版 login.html 与新版 newLogin.html
        if (url.toLowerCase().includes("login.html")) {
            log("[检测]", "登录页面");
        }

        // Heti 功能初始化
        let applyHeti = null;
        if (settings.heti && url.startsWith("app://./renderer/index.html")) {
            let hetiApplied = false;

            applyHeti = () => {
                if (hetiApplied) {
                    return;
                }

                const currentHash = window.location.hash;

                if (currentHash.includes("#/main/message") || currentHash.includes("#/forward")) {
                    log("[设置]", "应用赫蹏，聊天页面，hash:", currentHash);
                    try {
                        observeElement('#ml-root', (element) => {
                            insertHeti(element, ".text-normal", mspring_theme, plugin_path);
                        }, false);
                        hetiApplied = true;
                    } catch (error) {
                        log("[错误]", "赫蹏加载出错", error);
                    }
                }
            };

            // 立即尝试应用（如果已经在目标页面）
            applyHeti();
        }

        // 通用 URL 变化监听
        const wrapHistory = (type) => {
            const original = history[type];
            return function (...args) {
                const result = original.apply(this, args);
                // 创建并派发一个自定义事件
                const event = new Event(type);
                event.arguments = args;
                window.dispatchEvent(event);
                return result;
            };
        };

        // 重写 pushState 和 replaceState
        history.pushState = wrapHistory('pushState');
        history.replaceState = wrapHistory('replaceState');

        // URL 变化时的通用处理
        const onUrlChange = () => {
            log("[检测]", "URL 变化:", window.location.href);

            // 调用各个功能的处理函数
            if (applyHeti) {
                applyHeti();
            }
        };

        // 监听所有可能导致 URL 变化的情况
        window.addEventListener('hashchange', onUrlChange);     // 手动修改 hash
        window.addEventListener('popstate', onUrlChange);       // 浏览器前进/后退
        window.addEventListener('pushState', onUrlChange);      // 代码调用 pushState
        window.addEventListener('replaceState', onUrlChange);   // 代码调用 replaceState

    } catch (error) {
        log("[渲染进程错误]", error);
    }
}


export {
    insertHeti,
    compareVersions,
    setupThemeFeatures
};
