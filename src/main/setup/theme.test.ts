import { beforeEach, describe, expect, it, vi } from "vitest";

const nativeThemeMock = vi.hoisted(() => ({
  off: vi.fn(),
  on: vi.fn(),
  shouldUseDarkColors: true,
  themeSource: "system",
}));

const sendToRendererMock = vi.hoisted(() => vi.fn());

vi.mock("electron", () => ({
  nativeTheme: nativeThemeMock,
}));

vi.mock("../managers/Store", () => ({
  default: {
    getStore: vi.fn(),
  },
}));

vi.mock("../utils/sendToRenderer", () => ({
  default: sendToRendererMock,
}));

describe("native theme setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nativeThemeMock.shouldUseDarkColors = true;
  });

  it("uses the same built theme listener reference for registration and removal", async () => {
    const { configureNativeTheme } = await import("./theme");

    configureNativeTheme();

    const removedListener = nativeThemeMock.off.mock.calls[0][1];
    const registeredListener = nativeThemeMock.on.mock.calls[0][1];

    expect(nativeThemeMock.off).toHaveBeenCalledWith("updated", removedListener);
    expect(nativeThemeMock.on).toHaveBeenCalledWith("updated", registeredListener);
    expect(registeredListener).toBe(removedListener);
  });

  it("removes the same built theme listener reference", async () => {
    const { configureNativeTheme, removeNativeTheme } = await import("./theme");

    configureNativeTheme();
    const registeredListener = nativeThemeMock.on.mock.calls[0][1];
    nativeThemeMock.off.mockClear();

    removeNativeTheme();

    expect(nativeThemeMock.off).toHaveBeenCalledWith("updated", registeredListener);
  });

  it("sends native theme changes to the renderer", async () => {
    const { onThemeChange } = await import("./theme");

    nativeThemeMock.shouldUseDarkColors = false;
    onThemeChange()();

    expect(sendToRendererMock).toHaveBeenCalledWith("darkTheme-update", false);
  });
});
