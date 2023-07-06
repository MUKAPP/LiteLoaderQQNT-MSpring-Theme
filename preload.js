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
});