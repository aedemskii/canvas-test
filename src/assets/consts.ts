export const POOL_TABLE_WIDTH = 1024;
export const POOL_TABLE_HEIGHT = 578;
export const POOL_TABLE_BORDER_THICKNESS = 67;

export const COLORS = [
  'red',
  'yellow',
  'blue',
  'purple',
  'orange',
  'green',
] as const;

export const AMERICAN_COLORS = [
  'brown',
  'rgb(220, 220, 220)',
] as const;

export const BALL_RADIUS = 16;

export const MAX_AIM_LINE_LENGTH = 400;

export const MAX_BALL_MOMENTUM = 600;

export const BALL_MOMENTUM_MULTIPLYER = 1.2;

export const PLAYER_ACTION = {
  AIM: 'aim',
  SHOOT: 'shoot',
  NONE: 'none',
} as const;

const w = POOL_TABLE_WIDTH;
const h = POOL_TABLE_HEIGHT;
const r = BALL_RADIUS;
const b = POOL_TABLE_BORDER_THICKNESS;
const o = 3;
const initX = b + w / 2 + 4 * r;
export const INIT_COORDS = [
  { x: b + w / 5, y: h / 2 },

  // Other balls arranged in a triangle
  { x: initX, y: h / 2 },
  { x: initX + 2 * r - o, y: h / 2 - r },
  { x: initX + 2 * r - o, y: h / 2 + r },
  { x: initX + 4 * r - 2 * o, y: h / 2 - 2 * r },
  { x: initX + 4 * r - 2 * o, y: h / 2 },
  { x: initX + 4 * r - 2 * o, y: h / 2 + 2 * r },
  { x: initX + 6 * r - 3 * o, y: h / 2 - 3 * r },
  { x: initX + 6 * r - 3 * o, y: h / 2 - r },
  { x: initX + 6 * r - 3 * o, y: h / 2 + r },
  { x: initX + 6 * r - 3 * o, y: h / 2 + 3 * r },
  { x: initX + 8 * r - 4 * o, y: h / 2 - 4 * r },
  { x: initX + 8 * r - 4 * o, y: h / 2 - 2 * r },
  { x: initX + 8 * r - 4 * o, y: h / 2 },
  { x: initX + 8 * r - 4 * o, y: h / 2 + 2 * r },
  { x: initX + 8 * r - 4 * o, y: h / 2 + 4 * r }
] as const;