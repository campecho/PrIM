

export const formatDisplayDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};


export function getCompanyName(accountId: string) {
  const names = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Ind.",
    "Wayne Ent.",
    "Cyberdyne",
    "Massive Dynamic",
  ];
  let sum = 0;
  for (let i = 0; i < accountId.length; i++) {
    sum += accountId.charCodeAt(i);
  }
  return names[sum % names.length];
}


export function getDeterministicId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex}-0000-0000-0000-000000000000`;
}
