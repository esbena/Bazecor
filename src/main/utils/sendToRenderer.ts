import log from "electron-log/main";
import Window from "../managers/Window";

const sendToRenderer = (channel: string, ...args: unknown[]) => {
  const window = Window.getWindow();
  if (!window || window.isDestroyed() || window.webContents.isDestroyed()) {
    log.verbose(`Skipping renderer send for ${channel}; no active window`);
    return;
  }

  window.webContents.send(channel, ...args);
};

export default sendToRenderer;
