import { expect, test } from "vitest";
import { getLayerRenderData } from "./layoutLayerData";
import { KeyType, KeymapType } from "../types/layout";

const key = (keyCode: number, label = "", extraLabel?: string): KeyType => ({
  keyCode,
  label,
  extraLabel,
});

test("resolves a custom layer when default layers are shown", () => {
  const keymap: KeymapType = {
    default: [[key(1, "D1")]],
    custom: [[key(2, "C1")], [key(3, "C2")]],
    onlyCustom: false,
  };

  expect(getLayerRenderData({ keymap, layerIndex: 2, showDefaults: true })).toEqual({
    index: 2,
    keymap: [key(3, "C2")],
    isReadOnly: false,
    showDefaults: true,
  });
});

test("resolves a read-only default layer for only-custom keymaps with negative layer indexes", () => {
  const keymap: KeymapType = {
    default: [[key(1, "D1")], [key(2, "D2")]],
    custom: [[key(3, "C1")]],
    onlyCustom: true,
  };

  expect(getLayerRenderData({ keymap, layerIndex: -1, showDefaults: true })).toEqual({
    index: -1,
    keymap: [key(2, "D2")],
    isReadOnly: true,
    showDefaults: true,
  });
});

test("uses the first five characters from named macros and superkeys without mutating the source keymap", () => {
  const macroKey = key(53852, "1", "MACRO");
  const superKey = key(53981, "2", "SUPER");
  const keymap: KeymapType = {
    default: [],
    custom: [[macroKey, superKey]],
    onlyCustom: true,
  };

  const result = getLayerRenderData({
    keymap,
    layerIndex: 0,
    showDefaults: true,
    macros: [{ name: "MacroOne", macro: "", actions: [] }],
    superkeys: [
      { name: "Ignored", id: 0, actions: [] },
      { name: "SuperTwo", id: 1, actions: [] },
    ],
  });

  expect(result?.keymap.map(({ label }) => label)).toEqual(["Macro", "Super"]);
  expect(keymap.custom[0].map(({ label }) => label)).toEqual(["1", "2"]);
});
