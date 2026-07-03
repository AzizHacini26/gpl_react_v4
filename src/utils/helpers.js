export const getDaysNumber = (mdays) => {
  if (typeof mdays === 'number') return mdays;
  const fromNom = mdays?.nom ?? mdays?.name ?? mdays;
  const extracted = Number.parseInt(String(fromNom ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(extracted) ? 0 : extracted;
};

export const dateFormatFR = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
export const dateFormatFRMY = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
   const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
};
export const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getTime());
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export  const dateAu = (rowData) => {
    if (!rowData) return '';
    const verifyDate = parseDateValue(rowData.tverify);
    if (!verifyDate) return '';
    const mdaysValue = getDaysNumber(rowData.mdaysT);
    verifyDate.setDate(verifyDate.getDate() + mdaysValue);
    console.log('Calculated "Au" date:', verifyDate);
    return  dateFormatFR(verifyDate)  ;
  
  };