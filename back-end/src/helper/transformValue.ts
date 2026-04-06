export const toIntegerOrNull = (value) => {
  const rawValue =
    value && typeof value === 'object' && 'value' in value
      ? value.value
      : value;

  return rawValue && rawValue !== '' && !isNaN(Number(rawValue))
    ? Number(rawValue)
    : null;
};

export const trimString = (value: any) => {
  return typeof value === 'string' ? value.trim() : (value ?? null);
};

export const checkIsFree = (value: any) => {
  if (value == '1') {
    return 'ฟรีสินค้า';
  } else if (value == '2') {
    return 'เครมสินค้า';
  }
  return 'ขายสินค้า';
};

export const numberJoin = (numbers: number[]): string => {
  return numbers.join('');
};

export const transformDataBody = (data) => {
  const transformed = {};
  for (const key of Object.keys(data)) {
    transformed[key] = { value: data[key] ?? '' }; // Use ?? to handle null/undefined
  }
  return transformed;
};

export const calPercent = (value: number, percent: number) => {
  return (value * percent) / 100;
};

export const formatPhoneNumber = (value: string | null): string | null => {
  if (typeof value === 'string') {
    return value.trim().replace(/-| /g, '');
  }
  return null;
};
