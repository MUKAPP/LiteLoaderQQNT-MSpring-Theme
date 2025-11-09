import { compareVersions } from "./features.js";

async function settingWindowCreated(view, { log, mspring_theme, frameworkType, plugin_path }) {
    log("[设置]", "打开设置界面");
    try {
        const htmlContent = await mspring_theme.readFile(`${plugin_path}/src/settings.html`);
        view.innerHTML = htmlContent;

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
                event.currentTarget.removeAttribute("is-active");
                settings.forceHostBubbleColor = false;
                mspring_theme.updateForceBubbleColor(false);
            } else {
                event.currentTarget.setAttribute("is-active", "");
                settings.forceHostBubbleColor = true;
                mspring_theme.updateForceBubbleColor(true);
            }

            // 将修改后的settings保存到settings.json
            mspring_theme.setSettings(settings);
        });

        // 版本更新
        const version = view.querySelector("#mst-settings-version");
        version.textContent = frameworkType === "liteloader"
            ? LiteLoader.plugins["mspring-theme"].manifest.version
            : qwqnt.framework.plugins["mspring-theme"].meta.packageJson.version

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
                    if (compareVersions(new_version, frameworkType === "liteloader"
                        ? LiteLoader.plugins["mspring-theme"].manifest.version
                        : qwqnt.framework.plugins["mspring-theme"].meta.packageJson.version) > 0) {
                        updateButton.style.display = "block";
                        version.innerHTML += ` <span style="color: #ff4d4f;">(有新版本: ${new_version})</span>`;

                        // 判断 plugininstaller 插件是否存在并启用
                        if (frameworkType === "liteloader") {
                            if (LiteLoader.plugins["plugininstaller"] && !LiteLoader.plugins["plugininstaller"].disabled) {
                                updateButton.addEventListener("click", () => {
                                    plugininstaller.updateBySlug("mspring-theme");
                                });
                            } else {
                                version.innerHTML += "<br>未安装PluginInstaller，安装之后可以一键更新，当前需要手动更新"
                                updateButton.addEventListener("click", () => {
                                    mspring_theme.openWeb(urlMatch[0]);
                                });
                            }
                        } else {
                            // version.innerHTML += "<br>未安装PluginInstaller，安装之后可以一键更新，当前需要手动更新"
                            updateButton.addEventListener("click", () => {
                                mspring_theme.openWeb(urlMatch[0]);
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
        if (tgChannel) {
            tgChannel.addEventListener("click", () => {
                mspring_theme.openWeb("https://t.me/MUKAPP_Personal");

            });
        }

        // 输出日志到主进程
        const logToMainSwitch = view.querySelector("#msp-log-to-main");
        if (settings.logToMain) {
            logToMainSwitch.setAttribute("is-active", "");
        }
        logToMainSwitch.addEventListener("click", (event) => {
            const isActive = event.currentTarget.hasAttribute("is-active");

            if (isActive) {
                event.currentTarget.removeAttribute("is-active");
                settings.logToMain = false;
            } else {
                event.currentTarget.setAttribute("is-active", "");
                settings.logToMain = true;
            }

            mspring_theme.setSettings(settings);
        });


        /**
         * 为单个组件元素注入样式的函数
         * @param {HTMLElement} element - 要注入样式的组件元素，如 <setting-button>
         */
        function applyCustomStyles(element) {
            const shadow = element.shadowRoot;

            // 如果没有 shadow root 或者已经注入过样式，则直接返回，防止重复操作
            if (!shadow || shadow.querySelector('.custom-style-injected')) {
                return;
            }

            // 创建一个新的 <style> 元素
            const style = document.createElement('style');
            // 添加一个类名作为标记，表示已处理
            style.classList.add('custom-style-injected');

            const tagName = element.tagName.toLowerCase();

            // 根据不同的组件标签，应用不同的样式
            if (tagName === 'setting-button') {
                log(`[样式注入] 发现新的 ${tagName}，应用样式...`);
                style.textContent = `
                    button { 
                        border-radius: 8px !important; 
                    }
                    :host([data-type="secondary"]) button { 
                        background-color: var(--msp-container) !important;
                    }
                    :host([data-type="secondary"]) button:hover { 
                        background-color: var(--msp-container-active) !important;
                    }
                `;
            } else if (tagName === 'setting-select') {
                log(`[样式注入] 发现新的 ${tagName}，应用样式...`);
                style.textContent = `
                    .menu-button { 
                        background-color: var(--msp-container); 
                        border-radius: 8px; 
                    }
                    .menu-button:hover { 
                        background-color: var(--msp-container-active); 
                    }
                    ul { 
                        border-radius: 8px; 
                    }
                `;
            }

            // 将样式表注入到 Shadow DOM 中
            shadow.appendChild(style);
        }

        /**
         * 启动一个 MutationObserver 来监听整个文档的变化
         */
        function observeAndApplyStyles() {
            console.log("样式注入脚本已启动");

            // 1. 创建观察器实例，当有节点变化时调用 applyCustomStyles
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    // 我们只关心被添加到页面中的节点
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            // 确保是元素节点
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // 检查被添加的节点本身是不是我们的目标组件
                                if (node.matches('setting-button, setting-select')) {
                                    applyCustomStyles(node);
                                }
                                // 同时检查被添加的节点的子孙元素，因为组件可能被包裹在其他div里一起添加进来
                                node.querySelectorAll('setting-button, setting-select').forEach(applyCustomStyles);
                            }
                        }
                    }
                }
            });

            // 2. 配置观察器：监视 document.body 下的所有后代节点的添加和删除
            observer.observe(document.body, {
                childList: true, // 观察子节点的变动
                subtree: true    // 观察所有后代节点
            });

            // 3. 对页面加载时可能已经存在的元素，立即执行一次
            document.querySelectorAll('setting-button, setting-select').forEach(applyCustomStyles);
        }


        // 启动！
        observeAndApplyStyles();

    } catch (error) {
        log("[设置页面错误]", error);
    }
}

export {
    settingWindowCreated
}
