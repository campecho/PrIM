import { INITIAL_MEDIA_CATALOG as PARSED_MEDIA } from "./media";
import { INITIAL_FINISHED_SIZES_DATA as PARSED_SIZES } from "./sizes";
import { getDeterministicId } from "../lib/format";
import { FinishingOption, MediaCatalogEntry } from "../types";

export const INITIAL_MEDIA_CATALOG: MediaCatalogEntry[] = [
  {
    displayName: "20lb Economy",
    internalName: "WebCo 20lb 92 bright",
    key: "20LB",
    lbs: "20",
    gsm: "75",
    pt: "",
    caliper: "0.004",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "24lb Standard",
    internalName: "WebCo 24lb 92 bright",
    key: "24LB",
    lbs: "24",
    gsm: "90",
    pt: "",
    caliper: "0.0045",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "28lb Premium",
    internalName: "WebCo 28lb 92 bright",
    key: "28LB",
    lbs: "28",
    gsm: "105",
    pt: "",
    caliper: "0.0052",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "20lb Pastels",
    internalName: "WebCo Pastel 20lb",
    key: "20P",
    lbs: "20",
    gsm: "75",
    pt: "",
    caliper: "0.004",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#fdfd96", "#ffb3ba", "#bae1ff"],
      },
      {
        finishedSizeId: getDeterministicId('4" x 12"'),
        colors: ["#fdfd96", "#ffb3ba", "#bae1ff"],
      },
    ],
  },
  {
    displayName: "80lb Silk Cover",
    internalName: "80lb Silk Cover",
    lbs: "80",
    gsm: "216",
    pt: "",
    caliper: "0.007",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "Heavyweight Matte",
    internalName: "WF Heavyweight Matte",
    lbs: "",
    gsm: "",
    pt: "",
    caliper: "",
    productionType: "wideFormatRoll" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "cb88a7c6-e5d4-4e3d-2c1b-a0a09f8e7d6c",
        colors: ["#ffffff"],
      },
    ],
  },
  ...PARSED_MEDIA,
].map((m) => ({ id: m.id || crypto.randomUUID(), ...m }));


export const EXPLICIT_SIZE_IDS: Record<string, string> = {
  Letter: "d775430f-b046-5d65-a65a-1635d5b4164f",
  Legal: "e886541a-c157-6e76-b76b-2746e6c5275a",
  Ledger: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
  '12" x 18"': "d245622a-4f05-63bf-c98f-050e82d0bbe9",
  '18" x 24"': "cb88a7c6-e5d4-4e3d-2c1b-a0a09f8e7d6c",
};

const map = new Map();
export const ALL_SIZES = [
  {
    name: "Letter",
    key: "LTR",
    widthIn: 8.5,
    heightIn: 11,
    productionTypes: ["cutSheet"],
    description: "Standard letter paper size.",
  },
  {
    name: "Legal",
    key: "LEG",
    widthIn: 8.5,
    heightIn: 14,
    productionTypes: ["cutSheet"],
    description: "Standard legal paper size.",
  },
  {
    name: "Ledger",
    key: "LED",
    widthIn: 11,
    heightIn: 17,
    productionTypes: ["cutSheet"],
    description: "Standard tabloid / ledger paper size.",
  },
  {
    name: '12" x 18"',
    widthIn: 12,
    heightIn: 18,
    productionTypes: ["cutSheet", "wideFormatRoll"],
    description: "",
  },
  {
    name: '18" x 24"',
    widthIn: 18,
    heightIn: 24,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: '24" x 36"',
    widthIn: 24,
    heightIn: 36,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: '36" x 48"',
    widthIn: 36,
    heightIn: 48,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: "ARCH A",
    widthIn: 9,
    heightIn: 12,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH B",
    widthIn: 12,
    heightIn: 18,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH C",
    widthIn: 18,
    heightIn: 24,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH D",
    widthIn: 24,
    heightIn: 36,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH E1",
    widthIn: 30,
    heightIn: 42,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH E",
    widthIn: 36,
    heightIn: 48,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: '4" x 6"',
    widthIn: 4,
    heightIn: 6,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '5" x 7"',
    widthIn: 5,
    heightIn: 7,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.5" x 8.5"',
    widthIn: 3.5,
    heightIn: 8.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8.5" x 5.5"',
    widthIn: 8.5,
    heightIn: 5.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.25" x 5.5"',
    widthIn: 4.25,
    heightIn: 5.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.66" x 8.5"',
    widthIn: 3.66,
    heightIn: 8.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8" x 8"',
    widthIn: 8,
    heightIn: 8,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.5" x 3.5"',
    widthIn: 3.5,
    heightIn: 3.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4" x 9"',
    widthIn: 4,
    heightIn: 9,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4" x 12"',
    widthIn: 4,
    heightIn: 12,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8.5" x 5.13"',
    widthIn: 8.5,
    heightIn: 5.13,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '2" x 4"',
    widthIn: 2,
    heightIn: 4,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3" x 5.2"',
    widthIn: 3,
    heightIn: 5.2,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '2.5" x 3"',
    widthIn: 2.5,
    heightIn: 3,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '13" x 7.5"',
    widthIn: 13,
    heightIn: 7.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.25" x 3.75"',
    widthIn: 4.25,
    heightIn: 3.75,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.5" x 9.5"',
    widthIn: 4.5,
    heightIn: 9.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  ...PARSED_SIZES,
];

ALL_SIZES.forEach((s) => {
  const k = `${s.widthIn}x${s.heightIn}`;
  if (!map.has(k)) {
    map.set(k, s);
  }
});


export const INITIAL_FINISHED_SIZES = Array.from(map.values()).map((s) => ({
  id: EXPLICIT_SIZE_IDS[s.name] || getDeterministicId(s.name),
  ...s,
  widthPt: s.widthIn * 72,
  heightPt: s.heightIn * 72,
}));


export const INITIAL_FINISHING_OPTIONS: FinishingOption[] = [
  {
    id: crypto.randomUUID(),
    name: "Cutting",
    key: "CUT",
    description: "Custom cutting option",
    productionTypes: ["cutSheet"],
  },
  {
    id: crypto.randomUUID(),
    name: "Cut in Half Horizontal",
    key: "CUT2HZ",
    description: "Cut in half horizontal",
    productionTypes: ["cutSheet"],
  },
];


export const INITIAL_COLORS = [
  {
    name: "Black",
    key: "BW",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Full Color (CMYK)",
    key: "CLR",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
].map((i) => ({ id: crypto.randomUUID(), ...i }));


export const INITIAL_IMPRESSIONS = [
  {
    name: "Single Sided",
    key: "SS",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Double Sided",
    key: "DS",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Double Sided (flip)",
    key: "DSF",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
].map((i) => ({ id: crypto.randomUUID(), ...i }));


export const INITIAL_PRINT_SPECS = [
  {
    id: "spec-rack-card-4x12",
    name: "Rack Card 4x12",
    description: '4"x12" rack card, 4cp/4cp 100# white uncoated cover, bleed',
    productType: "Rack Card",
    productionType: "cutSheet",
    finishedSizeId: getDeterministicId('4" x 12"'),
    finishedSizeName: '4" x 12"',
    isCustomSize: false,
    customWidthIn: 0,
    customHeightIn: 0,
    type: "JDF token",
    value: "b2d87e50-9d32-4467-9321-c11df5b79796",
    mediaName: "",
    pageCount: 1,
  },
];
