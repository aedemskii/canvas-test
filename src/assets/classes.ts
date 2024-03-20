import { Point, Vector } from './types';
import { COLORS } from './consts';

export class Ball {
  private position: Point = { x: -1, y: -1 };
  private momentum: Vector = { x: 0, y: 0 };
  private color: string = COLORS[0];
  constructor(position: Point, color: string) {
    this.position = position;
    this.momentum = { x: 0, y: 0 };
    this.color = color;
  }

  public getPosition = (): Point => {
    return this.position;
  };

  public setPosition = (position: Point): void => {
    if (position.x < 0 || position.y < 0) {
      console.error('Ball.getPosition(): Invalid position');
      return;
    }
    this.position = position;
  };

  public movePosition = (offset: Vector): void => {
    this.position.x += offset.x;
    this.position.y += offset.y;
  }

  public getMomentum = (): Vector => {
    return this.momentum;
  };

  public getMomentumLength = (): number => {
    return Math.sqrt(this.momentum.x * this.momentum.x + this.momentum.y * this.momentum.y);
  }

  public setMomentum = (momentum: Vector): void => {
    this.momentum = momentum;
  };

  public addMomentum = (momentum: Vector): void => {
    this.momentum.x += momentum.x;
    this.momentum.y += momentum.y;
  };

  public multiplyMomentum = (multiplier: number): void => {
    this.momentum.x *= multiplier;
    this.momentum.y *= multiplier;
  };

  public getColor = (): string => {
    return this.color;
  };

  public setColor = (color: string): void => {
    this.color = color;
  };
};