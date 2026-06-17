import { read, utils, writeFile } from 'xlsx';

export const exportFinishedSizesToXLSX = (finishedSizes: any[]) => {
  const rows = finishedSizes.map(fs => ({
    'ID': fs.id,
    'Name': fs.name,
    'Key': fs.key || '',
    'Width (Inches)': fs.widthIn,
    'Height (Inches)': fs.heightIn,
    'Cut Sheet': fs.productionTypes?.includes('cutSheet') ? 'TRUE' : 'FALSE',
    'WF Roll': fs.productionTypes?.includes('wideFormatRoll') ? 'TRUE' : 'FALSE',
    'WF Rigid': fs.productionTypes?.includes('wideFormatRigid') ? 'TRUE' : 'FALSE',
    'Description': fs.description || ''
  }));

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Finished Sizes');
  writeFile(workbook, 'finished_sizes_export.xlsx');
};

export const exportMediaToXLSX = (mediaCatalog: any[]) => {
  const rows = mediaCatalog.map(m => ({
    'ID': m.id,
    'Display Name': m.displayName,
    'Internal Name': m.internalName,
    'Key': m.key || '',
    'LBS': m.lbs || '',
    'GSM': m.gsm || '',
    'PT': m.pt || '',
    'Caliper': m.caliper || '',
    'Production Type': m.productionType === 'cutSheet' ? 'Cut Sheet' : 
                       m.productionType === 'wideFormatRoll' ? 'WF Roll' : 'WF Rigid'
  }));

  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Media Catalog');
  writeFile(workbook, 'media_catalog_export.xlsx');
};

export const parseImportedXLSX = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
