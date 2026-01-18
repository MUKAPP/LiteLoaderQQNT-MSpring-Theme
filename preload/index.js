const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("mspring_theme", {
    updateStyle: (callback) => ipcRenderer.on(
        "mspring_theme.updateStyle",
        callback
    ),
    rendererReady: () => ipcRenderer.send(
        "mspring_theme.rendererReady"
    ),
    getFrameworkType: () => ipcRenderer.invoke(
        "mspring_theme.getFrameworkType"
    ),
    getPlatform: () => process.platform,
    getSettings: () => ipcRenderer.invoke(
        "mspring_theme.getSettings"
    ),
    setSettings: content => ipcRenderer.invoke(
        "mspring_theme.setSettings",
        content
    ),
    logToMain: (...args) => ipcRenderer.invoke(
        "mspring_theme.logToMain",
        ...args
    ),
    openWeb: (url) => ipcRenderer.send("mspring_theme.openWeb", url),
    fetchData: (url) => ipcRenderer.invoke("mspring_theme.fetchData", url),
    readFile: (path) => ipcRenderer.invoke("mspring_theme.readFile", path),
    // 强制覆盖气泡颜色 从设置页通知主进程
    updateForceBubbleColor: (state) => ipcRenderer.send(
        "mspring_theme.updateForceBubbleColor",
        state
    ),
    // 强制覆盖气泡颜色 在所有窗口接收主进程的通知
    onApplyForceBubbleColor: (callback) => ipcRenderer.on(
        "mspring_theme.applyForceBubbleColor",
        callback
    ),
    // 强制覆盖夜间模式背景 从设置页通知主进程
    updateForceNightModeBackground: (state) => ipcRenderer.send(
        "mspring_theme.updateForceNightModeBackground",
        state
    ),
    // 强制覆盖夜间模式背景 在所有窗口接收主进程的通知
    onApplyForceNightModeBackground: (callback) => ipcRenderer.on(
        "mspring_theme.applyForceNightModeBackground",
        callback
    ),
});