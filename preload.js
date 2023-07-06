const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("mspring_theme", {
    updateStyle: (callback) => ipcRenderer.on(
        "liteLoader.mspring_theme.updateStyle",
        callback
    ),
    rendererReady: () => ipcRenderer.send(
        "liteLoader.mspring_theme.rendererReady"
    ),
    getSettings: () => ipcRenderer.invoke(
        "liteLoader.mspring_theme.getSettings"
    ),
    setSettings: content => ipcRenderer.invoke(
        "liteLoader.mspring_theme.setSettings",
        content
    ),
});