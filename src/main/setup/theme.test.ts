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

  it("uses the same theme listener reference for registration and removal", async () => {
    const { configureNativeTheme, onThemeChange } = await import("./theme");

    configureNativeTheme();

    expect(nativeThemeMock.off).toHaveBeenCalledWith("updated", onThemeChange);
    expect(nativeThemeMock.on).toHaveBeenCalledWith("updated", onThemeChange);
  });

  it("sends native theme changes to the renderer", async () => {
    const { onThemeChange } = await import("./theme");

    nativeThemeMock.shouldUseDarkColors = false;
    onThemeChange();

    expect(sendToRendererMock).toHaveBeenCalledWith("darkTheme-update", false);
  });
});
