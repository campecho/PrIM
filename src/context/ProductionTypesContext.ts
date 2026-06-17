import React from "react";
import { ProductionTypeConfig } from "../types";

export const INITIAL_PRODUCTION_TYPES: ProductionTypeConfig[] = [
  { id: "cutSheet", name: "Cut Sheet", defaultBleedInches: 0.25 },
  { id: "wideFormatRoll", name: "Wide Format Roll", defaultBleedInches: 0.125 },
  {
    id: "wideFormatRigid",
    name: "Wide Format Rigid",
    defaultBleedInches: 0.125,
  },
];


export const ProductionTypesContext = React.createContext<
  [
    ProductionTypeConfig[],
    React.Dispatch<React.SetStateAction<ProductionTypeConfig[]>>,
  ]
>([INITIAL_PRODUCTION_TYPES, () => {}]);
