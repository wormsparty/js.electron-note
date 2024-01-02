import { contextBridge, ipcRenderer} from 'electron';
import { Grid } from './types';

contextBridge.exposeInMainWorld('api', {
    loadGlobal: async () => {
        return await ipcRenderer.invoke("loadGlobal");
    },
    loadMap: async (name: string) => {
        return await ipcRenderer.invoke("loadMap", name);
    },
    saveGlobal: async (map: Map<string, [number, number]>) => {
        return await ipcRenderer.invoke("saveGlobal", map);
    },
    saveMap: async (map: Grid) => {
        return await ipcRenderer.invoke("saveMap", map);
    },
    fileExists: async (name: string) => {
        return await ipcRenderer.invoke("fileExists", name);
    },
});

window.addEventListener('DOMContentLoaded', () => {
})
