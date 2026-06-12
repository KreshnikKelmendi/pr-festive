export const WINNER_SPACES = [
  'Sheshi Skënderbeu',
  'Sheshi Zahir Pajaziti',
  'Wonderland (me mjete motorike)',
] as const;

export const spaceMapping: Record<string, string> = {
  'Sheshi Skënderbeu': 'Skenderbeu',
  'Sheshi Zahir Pajaziti': 'Zahir Pajaziti',
  'Wonderland (me mjete motorike)': 'Wonderland Adem Jashari',
};

export function getDisplaySpace(space: string) {
  return spaceMapping[space] || space;
}
