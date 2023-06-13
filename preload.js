const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("mspring_theme", {
    updateStyle: (callback) => ipcRenderer.on(
        "betterQQNT.mspring_theme.updateStyle",
        callback
    ),
    rendererReady: () => ipcRenderer.send(
        "betterQQNT.mspring_theme.rendererReady"
    )
});