import { beforeEach, describe, expect, it, vi } from "vitest";

const windowMock = vi.hoisted(() => ({
  isDestroyed: vi.fn(() => false),
  webContents: {
    isDestroyed: vi.fn(() => false),
    send: vi.fn(),
  },
}));

const getWindowMock = vi.hoisted(() => vi.fn());
const logMock = vi.hoisted(() => ({
  verbose: vi.fn(),
}));

vi.mock("electron-log/main", () => ({
  default: logMock,
}));

vi.mock("../managers/Window", () => ({
  default: {
    getWindow: getWindowMock,
  },
}));

describe("sendToRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWindowMock.mockReturnValue(windowMock);
    windowMock.isDestroyed.mockReturnValue(false);
    windowMock.webContents.isDestroyed.mockReturnValue(false);
  });

  it("sends messages to an active renderer window", async () => {
    const { default: sendToRenderer } = await import("./sendToRenderer");

    sendToRenderer("channel", "payload");

    expect(windowMock.webContents.send).toHaveBeenCalledWith("channel", "payload");
    expect(logMock.verbose).not.toHaveBeenCalled();
  });

  it("skips messages when there is no active window", async () => {
    const { default: sendToRenderer } = await import("./sendToRenderer");

    getWindowMock.mockReturnValue(null);
    sendToRenderer("channel", "payload");

    expect(windowMock.webContents.send).not.toHaveBeenCalled();
    expect(logMock.verbose).toHaveBeenCalledWith("Skipping renderer send for channel; no active window");
  });

  it("skips messages when the window is destroyed", async () => {
    const { default: sendToRenderer } = await import("./sendToRenderer");

    windowMock.isDestroyed.mockReturnValue(true);
    sendToRenderer("channel", "payload");

    expect(windowMock.webContents.send).not.toHaveBeenCalled();
    expect(logMock.verbose).toHaveBeenCalledWith("Skipping renderer send for channel; no active window");
  });

  it("skips messages when the web contents are destroyed", async () => {
    const { default: sendToRenderer } = await import("./sendToRenderer");

    windowMock.webContents.isDestroyed.mockReturnValue(true);
    sendToRenderer("channel", "payload");

    expect(windowMock.webContents.send).not.toHaveBeenCalled();
    expect(logMock.verbose).toHaveBeenCalledWith("Skipping renderer send for channel; no active window");
  });
});
