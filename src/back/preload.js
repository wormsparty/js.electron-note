const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld('api', {
    getFiles: async () => {
        return await ipcRenderer.invoke("getFiles");
    }
});

window.addEventListener('DOMContentLoaded', () => {
	// TODO?
})
