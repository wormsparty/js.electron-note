import { contextBridge, ipcRenderer} from 'electron';
import { Grid } from '../types';

contextBridge.exposeInMainWorld('api', {
    load: async (name: string) => {
        return await ipcRenderer.invoke("load", name);
    },
    save: async (data: Grid) => {
        return await ipcRenderer.invoke("save", data);
    },
});

window.addEventListener('DOMContentLoaded', () => {
})
