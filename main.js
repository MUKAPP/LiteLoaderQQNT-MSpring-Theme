const fs = require("fs");
const path = require("path");


// 防抖函数
function debounce(fn, time) {
    let timer = null;
    return function (...args) {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, time);
    }
}


// 注入js
function injectJS(webContents) {
    const filepath = path.join(__dirname, "renderer.js");
    const filetext = fs.readFileSync(filepath, "utf-8");
    webContents.executeJavaScript(filetext, true);
}


// 更新样式
function updateStyle(webContents) {
    const csspath = path.join(__dirname, "style.css");
    fs.readFile(csspath, "utf-8", (err, data) => {
        if (err) {
            return;
        }
        webContents.send(
            "betterQQNT.test_theme.updateStyle",
            data
        );
    });
}


// 监听CSS修改
function watchCSSChange(webContents) {
    const filepath = path.join(__dirname, "style.css");
    fs.watch(filepath, "utf-8", debounce(() => {
        updateStyle(webContents);
    }, 100));
}


function onBrowserWindowCreated(window, plugin) {
    const preloads = Array.from(new Set([
        ...window.webContents.session.getPreloads(),
        path.join(plugin.path, "preload.js")
    ]));
    window.webContents.session.setPreloads(preloads);
    window.on("ready-to-show", () => {
        const url = window.webContents.getURL();
        if (url.includes("app://./renderer/index.html")) {
            injectJS(window.webContents);
            watchCSSChange(window.webContents);
            window.webContents.on("did-finish-load", () => {
                updateStyle(window.webContents);
            });
        }
    });
}


module.exports = {
    onBrowserWindowCreated
}