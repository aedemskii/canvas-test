export const POOL_TABLE_WIDTH = 700;
export const POOL_TABLE_HEIGHT = 350;

export const COLORS = [
  'red',
  'yellow',
  'blue',
  'purple',
  'orange',
  'green',
] as const;

export const BALL_RADIUS = 20;

export const MAX_AIM_LINE_LENGTH = 400;

export const PLAYER_ACTION = {
  AIM: 'aim',
  SHOOT: 'shoot',
  NONE: 'none',
} as const;

const w = POOL_TABLE_WIDTH;
const h = POOL_TABLE_HEIGHT;
const r = BALL_RADIUS;
export const INIT_COORDS = [
  { x: w / 4, y: h / 2 },

  // Other balls arranged in a triangle
  { x: w / 2 + 4 * r, y: h / 2 },
  { x: w / 2 + 6 * r, y: h / 2 - r },
  { x: w / 2 + 6 * r, y: h / 2 + r },
  { x: w / 2 + 8 * r, y: h / 2 - 2 * r },
  { x: w / 2 + 8 * r, y: h / 2 },
  { x: w / 2 + 8 * r, y: h / 2 + 2 * r },
  { x: w / 2 + 10 * r, y: h / 2 - 3 * r },
  { x: w / 2 + 10 * r, y: h / 2 - r },
  { x: w / 2 + 10 * r, y: h / 2 + r },
  { x: w / 2 + 10 * r, y: h / 2 + 3 * r },
  // { x: w / 2 + 12 * r, y: h / 2 - 4 * r },
  // { x: w / 2 + 12 * r, y: h / 2 - 2 * r },
  // { x: w / 2 + 12 * r, y: h / 2 },
  // { x: w / 2 + 12 * r, y: h / 2 + 2 * r },
  // { x: w / 2 + 12 * r, y: h / 2 + 4 * r }
] as const;