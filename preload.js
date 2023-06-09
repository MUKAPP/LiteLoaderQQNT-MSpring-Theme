const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("test_theme", {
    updateStyle: (callback) => ipcRenderer.on(
        "betterQQNT.test_theme.updateStyle",
        callback
    )
});