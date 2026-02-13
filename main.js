const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');

const DEFAULT_SETTINGS = {
  bounds: { x: undefined, y: undefined, width: 240, height: 110 },
  durationSeconds: 20 * 60,
};

let mainWindow;
let clickThroughEnabled = false;

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bounds: {
        ...DEFAULT_SETTINGS.bounds,
        ...(parsed.bounds || {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8');
}

function setClickThrough(enabled) {
  clickThroughEnabled = enabled;
  // forward:true によりマウス移動はウィンドウ側へ届くため hover 表現を維持しやすい。
  // クリックは下層アプリへ透過される。
  mainWindow.setIgnoreMouseEvents(enabled, { forward: true });
}

function createWindow() {
  const settings = loadSettings();

  mainWindow = new BrowserWindow({
    width: settings.bounds.width || 240,
    height: settings.bounds.height || 110,
    x: settings.bounds.x,
    y: settings.bounds.y,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 通常の alwaysOnTop だけだと全画面アプリの上に出ないケースがあるため、
  // 作成後に level を screen-saver に引き上げて表示優先度を高める。
  // rank=1 は同一 level 間での優先度を少しだけ上げる意図。
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  mainWindow.on('moved', () => {
    const bounds = mainWindow.getBounds();
    const current = loadSettings();
    saveSettings({ ...current, bounds });
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('settings:get', () => loadSettings());

  ipcMain.handle('settings:setDuration', (_event, durationSeconds) => {
    const current = loadSettings();
    saveSettings({ ...current, durationSeconds });
    return true;
  });

  ipcMain.handle('window:setClickThrough', (_event, enabled) => {
    setClickThrough(Boolean(enabled));
    return clickThroughEnabled;
  });

  createWindow();

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    setClickThrough(false);
    mainWindow.webContents.send('window:clickThroughChanged', false);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
