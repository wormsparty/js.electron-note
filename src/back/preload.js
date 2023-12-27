const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld('api', {
    load: async (name) => {
        return await ipcRenderer.invoke("load", name);
    },
    save: async (data) => {
        return await ipcRenderer.invoke("save", data);
    },
});

window.addEventListener('DOMContentLoaded', () => {
})
