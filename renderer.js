const plugin_path = LiteLoader.plugins.mspring_theme.path.plugin;

function log(...args) {
    console.log(`[MSpring Theme]`, ...args);
}

// 仿telegram, 同一个人的消息连起来 - form festoney8/LiteLoaderQQNT-Telegram-Theme，微改
// function concatBubble() {
//     const msgList = document.querySelector('#ml-root .ml-list');

//     if (msgList) {
//         function compareTwoMsg(lower, upper) {
//             return new Promise((resolve, reject) => {
//                 try {
//                     // 检查lower是否包含timeStamp, gray-message
//                     if (lower.querySelector(".gray-tip-message,.message__timestamp")) {
//                         resolve();
//                         return;
//                     }
//                     // 检查upper和lower是否包含撤回, 检测message-container
//                     if (!lower.querySelector(".message-container") || !upper.querySelector(".message-container")) {
//                         resolve();
//                         return;
//                     }
//                     const avatarLower = lower.querySelector("span.avatar-span");
//                     const avatarUpper = upper.querySelector("span.avatar-span");
//                     // const usernameNodeLower = lower.querySelector("span.avatar-span");
//                     const usernameNodeLower = lower.querySelector("div.user-name");
//                     const usernameLower = avatarLower.getAttribute("aria-label");
//                     const usernameUpper = avatarUpper.getAttribute("aria-label");
//                     const containerLower = lower.querySelector("div.msg-content-container")
//                     if (usernameLower === usernameUpper) {
//                         const bubbleLower = lower.querySelector("div.msg-content-container");
//                         // 删除upper message的paddingBottom
//                         upper.style.paddingBottom = "0";
//                         // 删除upper message-container的paddingBottom
//                         upper.querySelector("div.message-container").style.paddingBottom = "0";
//                         // upper message-container的paddingTop为4px
//                         upper.querySelector("div.message-container").style.paddingTop = "4px";
//                         // lower message-container的paddingTop为4px
//                         lower.querySelector("div.message-container").style.paddingTop = "4px";
//                         // lower头像调透明
//                         avatarLower.style.opacity = "0";
//                         // lower的username 不显示
//                         if (usernameNodeLower && usernameNodeLower.style) {
//                             usernameNodeLower.style.marginBottom = "0";
//                             usernameNodeLower.style.display = "none";
//                         }

//                     }
//                     resolve();
//                 } catch (error) {
//                     log("compareMessage Error", error)
//                     // log("lower", lower.innerHTML)
//                     // log("upper", upper.innerHTML)
//                     // 不reject, 避免影响其他任务
//                     resolve();
//                 }
//             });
//         }

//         let lastMessageNodeList = Array.from(msgList.querySelectorAll("div.message"));

//         const observer = new MutationObserver(async function () {
//             // 比对两轮的msgList
//             let currMessageNodeList = Array.from(msgList.querySelectorAll("div.message"));
//             let lastMessageNodeSet = new Set(lastMessageNodeList);

//             let tasks = [];
//             for (let i = 0; i < currMessageNodeList.length - 1; i++) {
//                 let currMsg = currMessageNodeList[i];
//                 if (!lastMessageNodeSet.has(currMsg)) {
//                     tasks.push(compareTwoMsg(currMessageNodeList[i], currMessageNodeList[i + 1]));
//                 }
//             }
//             // 提速
//             Promise.all(tasks).then(() => {
//                 // log("Promise all complete")
//             }).catch(() => {
//                 log("Promise not complete all")
//             });

//             lastMessageNodeList = currMessageNodeList;
//         });
//         const config = { childList: true };
//         observer.observe(msgList, config);
//     }
// }

function observeElement(selector, callback, callbackEnable = true, interval = 100, timeout = 5000) {
    let elapsedTime = 0;
    const timer = setInterval(function () {
        const element = document.querySelector(selector);
        if (element) {
            if (callbackEnable) {
                callback();
                log("已检测到", selector);
            }
            clearInterval(timer);
        }

        elapsedTime += interval;
        if (elapsedTime >= timeout) {
            clearInterval(timer);
            log('超时', selector, "未出现");
        }
    }, interval);
}

function observeElement2(selector, callback, callbackEnable = true, interval = 100) {
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
    hetiLinkElement.href = `llqqnt://local-file/${plugin_path}/src/heti-m.css`;
    document.head.appendChild(hetiLinkElement);

    const hetiScriptElement = document.createElement("script");
    hetiScriptElement.src = `llqqnt://local-file/${plugin_path}/src/heti-addon.min.js`;
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

    // 判断插件background_plugin是否存在且启用
    if (LiteLoader.plugins.background_plugin && !LiteLoader.plugins.background_plugin.disabled) {
        log("[检测]", "已启用背景插件");
        document.documentElement.classList.add(`mspring_background_plugin_enabled`);
    }

    // 判断插件lite_tools是否存在且启用
    if (LiteLoader.plugins.lite_tools && !LiteLoader.plugins.lite_tools.disabled) {
        log("[检测]", "已启用轻量工具箱");
        const ltOptions = await lite_tools.config();
        if (ltOptions.background.enabled) {
            log("[检测]", "已启用轻量工具箱-自定义背景");
            document.documentElement.classList.add(`mspring_lite_tool_background_enabled`);
        }
    }

    // 判断是否开启heti
    const settings = await mspring_theme.getSettings();
    if (settings.heti) {
        log("[设置]", "开启赫蹏");
        try {
            observeElement2('#ml-root .ml-list', function () { insertHeti(".ml-list ") });
        } catch (error) {
            log("[错误]", "赫蹏加载出错", error);
        }
    }

    // 判断是否开启tglike
    // if (settings.tglike) {
    //     log("[设置]", "开启消息合并");
    //     try {
    //         observeElement2('#ml-root .ml-list', concatBubble);
    //     } catch (error) {
    //         log("[错误]", "消息合并出错", error);
    //     }
    // }

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
    // 判断settings的heti值，如果为false就移除is-active
    if (!settings.heti) {
        hetiSwitch.classList.remove("is-active");
    }
    // 给hetiSwitch添加点击监听
    hetiSwitch.addEventListener("click", () => {
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

    // // 选择id为tglike的q-switch
    // const tglikeSwitch = view.querySelector("#tglike");
    // // 判断settings的tglike值，如果为false就移除is-active
    // if (!settings.tglike) {
    //     tglikeSwitch.classList.remove("is-active");
    // }
    // // 给tglikeSwitch添加点击监听
    // tglikeSwitch.addEventListener("click", () => {
    //     // 判断是否有is-active，如果有就移除，如果没有就添加
    //     if (tglikeSwitch.classList.contains("is-active")) {
    //         tglikeSwitch.classList.remove("is-active");
    //         // 修改settings的tglike值为false
    //         settings.tglike = false;
    //     } else {
    //         tglikeSwitch.classList.add("is-active");
    //         // 修改settings的tglike值为true
    //         settings.tglike = true;
    //     }
    //     // 将修改后的settings保存到settings.json
    //     mspring_theme.setSettings(settings);
    // });
}


export {
    onLoad,
    onConfigView
}