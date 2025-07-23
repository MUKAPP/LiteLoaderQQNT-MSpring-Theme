const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("mspring_theme", {
    updateStyle: (callback) => ipcRenderer.on(
        "LiteLoader.mspring_theme.updateStyle",
        callback
    ),
    rendererReady: () => ipcRenderer.send(
        "LiteLoader.mspring_theme.rendererReady"
    ),
    getSettings: () => ipcRenderer.invoke(
        "LiteLoader.mspring_theme.getSettings"
    ),
    setSettings: content => ipcRenderer.invoke(
        "LiteLoader.mspring_theme.setSettings",
        content
    ),
    logToMain: (...args) => ipcRenderer.invoke(
        "LiteLoader.mspring_theme.logToMain",
        ...args
    ),
    openWeb: (url) => ipcRenderer.send("LiteLoader.mspring_theme.openWeb", url),
    fetchData: (url) => ipcRenderer.invoke("LiteLoader.mspring_theme.fetchData", url),
    readFile: (path) => ipcRenderer.invoke("LiteLoader.mspring_theme.readFile", path),
    // 强制覆盖气泡颜色 从设置页通知主进程
    updateForceBubbleColor: (state) => ipcRenderer.send(
        "LiteLoader.mspring_theme.updateForceBubbleColor",
        state
    ),
    // 强制覆盖气泡颜色 在所有窗口接收主进程的通知
    onApplyForceBubbleColor: (callback) => ipcRenderer.on(
        "LiteLoader.mspring_theme.applyForceBubbleColor",
        callback
    ),
});