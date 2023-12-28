import { contextBridge, ipcRenderer} from 'electron';
import { Grid } from './types';

contextBridge.exposeInMainWorld('api', {
    load: async (name: string) => {
        return await ipcRenderer.invoke("load", name);
    },
    save: async (map: Grid) => {
        return await ipcRenderer.invoke("save", map);
    },
});

window.addEventListener('DOMContentLoaded', () => {
})
