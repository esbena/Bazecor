import { removeNativeTheme } from "./theme";
import Window from "../managers/Window";

const onClose = () => {
  const window = Window.getWindow();
  window.on("closed", () => {
    removeNativeTheme();
    Window.setWindow(null);
  });
};

export default onClose;
