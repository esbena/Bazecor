import React from "react";
import { KeyType } from "@Renderer/types/layout";
import { MacrosType } from "@Renderer/types/macros";
import { SuperkeysType } from "@Renderer/types/superkeys";
import BlankTable from "../../api/keymap/db/blanks";

interface KeyLabelParser {
  parse: (keyCode: number) => KeyType;
}

interface FormatPrintKeyLabelArgs {
  keyCode: number;
  keymapDB: KeyLabelParser;
  macros?: MacrosType[];
  superkeys?: SuperkeysType[];
  noKeyCode?: number;
}

interface OneShotTagLikeProps {
  layerNumber?: number;
  modifier?: string;
  direction?: string;
}

const emptySuperkeyActionCode = 1;
const oneShotModifierLabels: Record<string, string> = {
  alt: "Alt",
  altGr: "AltGr",
  control: "Control",
  os: "OS",
  shift: "Shift",
};

const isOneShotTagLike = (value: KeyType["label"] | KeyType["extraLabel"]): value is React.ReactElement<OneShotTagLikeProps> =>
  React.isValidElement<OneShotTagLikeProps>(value) &&
  (typeof value.props.layerNumber === "number" || typeof value.props.modifier === "string");

const formatPrintableNodeLabel = (value: KeyType["label"] | KeyType["extraLabel"]) => {
  if (typeof value === "string") return value;
  if (!isOneShotTagLike(value)) return "";

  if (typeof value.props.layerNumber === "number") {
    return `OneShot Layer ${value.props.layerNumber}`;
  }

  const modifier = value.props.modifier ?? "";
  const modifierLabel = oneShotModifierLabels[modifier] ?? modifier;
  return `OneShot ${value.props.direction ? `${value.props.direction} ` : ""}${modifierLabel}`.trim();
};

export const formatPrintKeyLabel = ({
  keyCode,
  keymapDB,
  macros = [],
  superkeys = [],
  noKeyCode = BlankTable.keys[0].code,
}: FormatPrintKeyLabelArgs) => {
  if (keyCode === noKeyCode || keyCode === emptySuperkeyActionCode) return "";

  const key = keymapDB.parse(keyCode);
  if (key.keyCode === noKeyCode) return "";

  const label = formatPrintableNodeLabel(key.label);
  const extraLabel = formatPrintableNodeLabel(key.extraLabel);
  const verboseLabel = formatPrintableNodeLabel(key.verbose);

  if (extraLabel === "MACRO") {
    return macros[keyCode - 53852]?.name.trim() || `${extraLabel} ${label}`.trim();
  }

  if (extraLabel === "SUPER") {
    return superkeys[keyCode - 53980]?.name.trim() || `${extraLabel} ${label}`.trim();
  }

  if (label === "" && extraLabel !== "") return extraLabel;
  if (label === "" && verboseLabel !== "") return verboseLabel;
  if (extraLabel && extraLabel !== label && !extraLabel.includes("+")) return `${extraLabel} ${label}`.trim();

  return label;
};
