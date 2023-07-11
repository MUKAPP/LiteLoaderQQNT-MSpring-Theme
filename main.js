const fs = require("fs");
const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");


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


// 更新样式
function updateStyle(webContents, settingsPath) {
    // 读取settings.json
    const data = fs.readFileSync(settingsPath, "utf-8");
    const config = JSON.parse(data);
    const themeColor = config.themeColor;
    const backgroundOpacity = config.backgroundOpacity;

    const csspath = path.join(__dirname, "style.css");
    fs.readFile(csspath, "utf-8", (err, data) => {
        if (err) {
            return;
        }
        let preloadString = `:root {
    --theme-color: ${themeColor};
    --background-color-light: color-mix(in oklch, #FFFFFF, transparent ${100 - backgroundOpacity}%);
    --background-color-dark: color-mix(in oklch, #171717, transparent ${100 - backgroundOpacity}%);
}`
        // 判断操作系统是否为Windows，若不是则不使用color-mix
        if (process.platform !== 'win32') {
            preloadString = `:root {
    --theme-color: ${themeColor};
    --background-color-light: #FFFFFFaf;
    --background-color-dark: #171717af;
}`
        }

        webContents.send(
            "LiteLoader.mspring_theme.updateStyle",
            // 将主题色插入到style.css中
            preloadString + "\n\n" + data
        );
    });
}


// 监听CSS修改-开发时候用的
function watchCSSChange(webContents, settingsPath) {
    const filepath = path.join(__dirname, "style.css");
    fs.watch(filepath, "utf-8", debounce(() => {
        updateStyle(webContents, settingsPath);
    }, 100));
}


// 监听配置文件修改
function watchSettingsChange(webContents, settingsPath) {
    fs.watch(settingsPath, "utf-8", debounce(() => {
        updateStyle(webContents, settingsPath);
    }, 100));
}


// 加载插件时触发
function onLoad(plugin) {
    const pluginDataPath = plugin.path.data;
    const settingsPath = path.join(pluginDataPath, "settings.json");

    // fs判断插件路径是否存在，如果不存在则创建（同时创建父目录（如果不存在的话））
    if (!fs.existsSync(pluginDataPath)) {
        fs.mkdirSync(pluginDataPath, { recursive: true });
    }
    // 判断settings.json是否存在，如果不存在则创建
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(settingsPath, JSON.stringify({
            "themeColor": "#cb82be",
            "backgroundOpacity": "61",
        }));
    } else {
        // 判断后来加入的backgroundOpacity是否存在，如果不存在则添加
        const data = fs.readFileSync(settingsPath, "utf-8");
        const config = JSON.parse(data);
        if (!config.backgroundOpacity) {
            config.backgroundOpacity = "61";
            fs.writeFileSync(settingsPath, JSON.stringify(config));
        }
    }

    ipcMain.on(
        "LiteLoader.mspring_theme.rendererReady",
        (event, message) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            updateStyle(window.webContents, settingsPath);
        }
    );

    // 监听渲染进程的updateStyle事件
    ipcMain.on(
        "LiteLoader.mspring_theme.updateStyle",
        (event, settingsPath) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            updateStyle(window.webContents, settingsPath);
        });

    // 监听渲染进程的watchCSSChange事件
    ipcMain.on(
        "LiteLoader.mspring_theme.watchCSSChange",
        (event, settingsPath) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            watchCSSChange(window.webContents, settingsPath);
        });

    // 监听渲染进程的watchSettingsChange事件
    ipcMain.on(
        "LiteLoader.mspring_theme.watchSettingsChange",
        (event, settingsPath) => {
            const window = BrowserWindow.fromWebContents(event.sender);
            watchSettingsChange(window.webContents, settingsPath);
        });

    ipcMain.handle(
        "LiteLoader.mspring_theme.getSettings",
        (event, message) => {
            try {
                const data = fs.readFileSync(settingsPath, "utf-8");
                const config = JSON.parse(data);
                return config;
            } catch (error) {
                console.log(error);
                return {};
            }
        }
    );

    ipcMain.handle(
        "LiteLoader.mspring_theme.setSettings",
        (event, content) => {
            try {
                const new_config = JSON.stringify(content);
                fs.writeFileSync(settingsPath, new_config, "utf-8");
            } catch (error) {
                alert(error);
            }
        }
    );

}


// 创建窗口时触发
function onBrowserWindowCreated(window, plugin) {
    const pluginDataPath = plugin.path.data;
    const settingsPath = path.join(pluginDataPath, "settings.json");
    window.on("ready-to-show", () => {
        const url = window.webContents.getURL();
        if (url.includes("app://./renderer/index.html")) {
            watchCSSChange(window.webContents, settingsPath);
            watchSettingsChange(window.webContents, settingsPath);
        }
    });
}


module.exports = {
    onLoad,
    onBrowserWindowCreated,
}