import { KeymapType, KeyType } from "@Renderer/types/layout";
import { MacrosType } from "@Renderer/types/macros";
import { SuperkeysType } from "@Renderer/types/superkeys";

export interface LayerRenderData {
  index: number;
  keymap: KeyType[];
  isReadOnly: boolean;
  showDefaults: boolean;
}

interface GetLayerRenderDataArgs {
  keymap: KeymapType;
  layerIndex: number;
  showDefaults: boolean;
  macros?: MacrosType[];
  superkeys?: SuperkeysType[];
}

const canReplaceGeneratedLabel = (key: KeyType) => typeof key.label === "string" && !/\p{L}/u.test(key.label);

const withMacroLabel = (key: KeyType, macros: MacrosType[]) => {
  if (key.extraLabel !== "MACRO" || !canReplaceGeneratedLabel(key)) return key;

  const macroNumber = key.keyCode - 53852;
  const macroName = macros[macroNumber]?.name;
  if (!macroName) return key;

  return {
    ...key,
    label: macroName.substring(0, 5),
  };
};

const withSuperkeyLabel = (key: KeyType, superkeys: SuperkeysType[]) => {
  if (key.extraLabel !== "SUPER" || !canReplaceGeneratedLabel(key)) return key;

  const superkeyNumber = key.keyCode - 53980;
  const superkeyName = superkeys[superkeyNumber]?.name;
  if (!superkeyName) return key;

  return {
    ...key,
    label: superkeyName.substring(0, 5),
  };
};

const withConfiguredLabels = (key: KeyType, macros: MacrosType[], superkeys: SuperkeysType[]) =>
  withSuperkeyLabel(withMacroLabel(key, macros), superkeys);

export const getLayerRenderData = ({
  keymap,
  layerIndex,
  showDefaults,
  macros = [],
  superkeys = [],
}: GetLayerRenderDataArgs): LayerRenderData | undefined => {
  let effectiveLayerIndex = layerIndex;

  if (!showDefaults && layerIndex < keymap.default.length && !keymap.onlyCustom) {
    effectiveLayerIndex = 0;
  }
  const isReadOnly = keymap.onlyCustom ? effectiveLayerIndex < 0 : effectiveLayerIndex < keymap.default.length;
  let layerData: KeyType[] | undefined;
  if (keymap.onlyCustom) {
    layerData = isReadOnly ? keymap.default[effectiveLayerIndex + keymap.default.length] : keymap.custom[effectiveLayerIndex];
  } else {
    layerData = isReadOnly ? keymap.default[effectiveLayerIndex] : keymap.custom[effectiveLayerIndex - keymap.default.length];
  }

  if (layerData === undefined) return undefined;

  return {
    index: effectiveLayerIndex,
    keymap: layerData.map(key => withConfiguredLabels(key, macros, superkeys)),
    isReadOnly,
    showDefaults,
  };
};
