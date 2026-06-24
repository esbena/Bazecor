import React from "react";
import { expect, test } from "vitest";
import { formatPrintKeyLabel } from "./printKeyLabel";
import { KeyType } from "../types/layout";

const parse = (key: KeyType) => ({
  parse: () => key,
});

type OneShotLayerProps = React.HTMLAttributes<HTMLSpanElement> & { layerNumber: number };
type OneShotModifierProps = React.HTMLAttributes<HTMLSpanElement> & { modifier: string; direction: string };

test("formats one-shot layer labels for superkey reference actions", () => {
  const oneShotLayer = React.createElement("span", { layerNumber: 6 } as OneShotLayerProps);

  expect(
    formatPrintKeyLabel({
      keyCode: 49166,
      keymapDB: parse({ keyCode: 49166, label: "", extraLabel: oneShotLayer, verbose: oneShotLayer }),
    }),
  ).toBe("OneShot Layer 6");
});

test("formats one-shot modifier labels for superkey reference actions", () => {
  const oneShotOs = React.createElement("span", { modifier: "os", direction: "Left" } as OneShotModifierProps);

  expect(
    formatPrintKeyLabel({
      keyCode: 49156,
      keymapDB: parse({ keyCode: 49156, label: "", extraLabel: oneShotOs, verbose: oneShotOs }),
    }),
  ).toBe("OneShot Left OS");
});

test("uses configured names for macro and nested superkey actions", () => {
  expect(
    formatPrintKeyLabel({
      keyCode: 53852,
      keymapDB: parse({ keyCode: 53852, label: "0", extraLabel: "MACRO" }),
      macros: [{ name: "copy left", macro: "", actions: [] }],
    }),
  ).toBe("copy left");

  expect(
    formatPrintKeyLabel({
      keyCode: 53980,
      keymapDB: parse({ keyCode: 53980, label: "0", extraLabel: "SUPER" }),
      superkeys: [{ name: "n os", id: 0, actions: [] }],
    }),
  ).toBe("n os");
});
