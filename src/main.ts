import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Repository } from "./repositories/base/RepositoryBase";
import AmazonServiceHandlers from './handlers/AmazonServiceHandlers';
import CalibreServiceHandlers from './handlers/CalibreServiceHandlers';
import SettingsServiceHandlers from './handlers/SettingsServiceHandlers';
import UtilsServiceHandlers from './handlers/UtilsServiceHandlers';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the icon
  const appIconPath = path.join(process.cwd(), 'public/assets/icons/app.png');
  const icon = nativeImage.createFromPath(appIconPath);
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: icon,
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // @ts-expect-error: Vite defines these variables at build time.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // @ts-expect-error: Vite defines these variables at build time.
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // @ts-expect-error: Vite defines these variables at build time.
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools. Comment this line out to disable.
  // mainWindow.webContents.openDevTools();

  // Register IPC handlers for services
  AmazonServiceHandlers.register(ipcMain, mainWindow);
  CalibreServiceHandlers.register(ipcMain, mainWindow);
  SettingsServiceHandlers.register(ipcMain, mainWindow);
  UtilsServiceHandlers.register(ipcMain, mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Creating or updating database
Repository.createOrUpdateDatabase();
