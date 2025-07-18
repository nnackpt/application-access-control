const getValue = <T = string>(
  obj: Record<string, unknown>,
  possibleKeys: string[]
): T | null => {
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key] as T;
    }
  }
  return null;
};

export default getValue