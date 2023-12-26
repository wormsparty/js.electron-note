const { contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld('api', {
    load: async () => {
        return await ipcRenderer.invoke("load");
    },
    save: async (data) => {
	    console.log('args = ');
	    console.log(data);
        return await ipcRenderer.invoke("save", data);
    },
});

window.addEventListener('DOMContentLoaded', () => {
})
