import { Point, Vector } from './types';

export class Ball {
  position: Point;
  momentum: Vector;
  color: string;
  constructor(position: Point, color: string) {
    this.position = position;
    this.momentum = { x: 0, y: 0 };
    this.color = color;
  }
};