import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as child_process from 'child_process';
import * as notifier from 'node-notifier';
import * as fs from 'fs';

const appID = 'me.glycoproteo.dialib';
const appName = 'DIALib';
let win, serve;
let windowCollection: BrowserWindow[] = [];
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');
let backend = [
    // new Backend('python', "9000", false, new ConnectorUrl('http://10.89.221.27:9000', false))
];
let localBackend = [];
function navWin(route) {
  win.webContents.send('nav', route);
}

function createSubWindow(data) {
    const win = new BrowserWindow(data.options);
    win.loadURL(data.url);
    windowCollection.push(win);
}

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    /*win.loadURL(url.format({
      pathname: path.join(__dirname, `dist/index.html#swathlib`),
      protocol: 'file:',
      slashes: true
    }));*/
    win.loadURL('file://' + __dirname + '/dist/index.html');
  }

  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
    windowCollection.push(win)
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }

  });

  app.on("quit", () => {
      console.log('App Exiting.');
      for (const p of localBackend) {
          if (p.process) {
              const promise = p.process.kill();
          }
      }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('backend-start', function (event, arg) {
      if (!arg.status) {
          let programPath = path.resolve(app.getAppPath(), '..', 'backend', 'main.web.py');
          if (!fs.existsSync(programPath)) {
              programPath = path.resolve(app.getAppPath(), 'backend', 'main.web.py');
          }

          notifier.notify({title: 'message', message: 'starting ' + programPath});
          arg.process = child_process.spawn(arg.pythonPath, ["-u", programPath, "-p", arg.port],{shell: true, detached: true});
          arg.url = 'http://localhost:' + arg.port;
          localBackend.push(arg);
          arg.process.on('close', () => {
              notifier.notify({title: 'DIALib Server Status', message: 'Local server at ' + arg.port + ' has been closed.', appId: appID, appName: appName});
              event.sender.send('backend-close', arg);
          });
      }
  });

    ipcMain.on('backend-update', (event, args) => {
        backend = args;
        for (const i of windowCollection) {
            i.webContents.send('reply-backend-get', backend);
        }
    });

    ipcMain.on('backend-get', (event, args) => {

       event.sender.send('reply-backend-get', backend);
    });

    ipcMain.on('window-open', (event, args) => {
        createSubWindow(args);
    });

} catch (e) {
  // Catch Error
  // throw e;
}
