import React from "react";

export type Module = {
  id: string;
  name: string;
  headerName?: string;
  icon: string | React.ReactNode;
};


export type ImportedFileDetails = {
  id: string;
  file: File;
  pageCount: number;
  colorMode: string;
  resolutionDpi: number;
};


export type FileAsset = {
  id: number;
  name: string;
  dimensions: string;
  type: string;
  updatedAt: string;
  description: string;
  fileId: string;
  version: string;
  lastUpdatedBy: string;
  customerAccounts: string[];
  addedBy: string;
  ownedBy: string;
  isShared: boolean;
  sku: string;
  fileSize: string;
  pageCount: number;
  colorMode: "RGB" | "CMYK";
  resolutionDpi: number;
  preflightCheck: boolean;
};


export type CustomerNote = {
  id: string;
  author: string;
  date: string;
  text: string;
  isPinned?: boolean;
};


export type PrintCustomer = {
  id: string;
  accountNumber: string;
  companyName: string;
  city: string;
  state: string;
  threePP: "Coupa" | "Oracle" | "Workday" | "No";
  printToStore: boolean;
  notes: CustomerNote[];
  assignedSpecs?: string[];
};


export interface ProductionTypeConfig {
  id: string;
  name: string;
  defaultBleedInches: number;
}


export interface MediaCatalogEntry {
  id: string;
  displayName: string;
  internalName: string;
  key?: string;
  lbs: string;
  gsm: string;
  pt: string;
  caliper: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  productionType: string;
  compatibleFinishedSizes: { finishedSizeId: string; colors: string[] }[];
}


export interface FinishingOption {
  id: string;
  name: string;
  key: string;
  description: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  productionTypes: string[];
}
