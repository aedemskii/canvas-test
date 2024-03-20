import {
  AMERICAN_COLORS,
  BALL_RADIUS as BR,
  INIT_COORDS,
  MAX_AIM_LINE_LENGTH,
  MAX_BALL_MOMENTUM,
  BALL_MOMENTUM_MULTIPLYER as BMM,
  POOL_TABLE_HEIGHT,
  POOL_TABLE_WIDTH,
  POOL_TABLE_BORDER_THICKNESS as PTB,
} from './consts';
import { Point } from './types';
import { Ball } from './classes';

export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, POOL_TABLE_WIDTH, POOL_TABLE_HEIGHT);
};

export const getInitialBalls = (): Ball[] => {
  const balls: Ball[] = [];
  INIT_COORDS.forEach((coords: Point, index) => {
    balls.push(new Ball(coords, AMERICAN_COLORS[index === 0 ? 0 : 1]));
  });
  return balls;
};

export const renderBalls = (ctx: CanvasRenderingContext2D, balls: Ball[]) => {
  balls.forEach(ball => {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    ctx.beginPath();
    ctx.setLineDash([]);
    const position = ball.getPosition();
    ctx.arc(position.x, position.y, BR, 0, Math.PI * 2);
    ctx.fillStyle = ball.getColor();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fill();
  });
};

export const renderAimLine = (ctx: CanvasRenderingContext2D, start: Point, pullOffset: Point) => {
  ctx.beginPath();
  ctx.setLineDash([5, 3]);
  ctx.moveTo(start.x, start.y);
  let length = Math.min(MAX_AIM_LINE_LENGTH, Math.sqrt((pullOffset.x - start.x) ** 2 + (pullOffset.y - start.y) ** 2) * 2);
  let angle = Math.atan2(pullOffset.y - start.y, pullOffset.x - start.x);
  let newX = start.x - length * Math.cos(angle);
  let newY = start.y - length * Math.sin(angle);
  ctx.strokeStyle = '#fff';
  while (length > 0) {
    if (pointWithinBorders({ x: newX, y: newY })) {
      ctx.lineTo(newX, newY);
      break;
    } else {
      const borderCollusionPoint = getBorderCollusionPoint(start, { x: newX, y: newY });
      newX = borderCollusionPoint.x;
      newY = borderCollusionPoint.y;
      ctx.lineTo(newX, newY);
      length -= Math.sqrt((newX - start.x) ** 2 + (newY - start.y) ** 2);
      if (newX === POOL_TABLE_WIDTH - PTB) {
        angle = Math.PI - angle;
      } else if (newX === PTB) {
        angle = Math.PI - angle;
      } else if (newY === POOL_TABLE_HEIGHT - PTB) {
        angle = -angle;
      } else if (newY === PTB) {
        angle = -angle;
      }
      newX = newX - length * Math.cos(angle);
      newY = newY - length * Math.sin(angle);
    }
  }
  ctx.stroke();
};

const pointWithinBorders = (point: Point): boolean => {
  return (point.x <= POOL_TABLE_WIDTH - PTB) && (point.x >= PTB) && (point.y <= POOL_TABLE_HEIGHT - PTB) && (point.y >= PTB);
};

const pointWithinVerticalBorders = (y: number): boolean => {
  return (y <= POOL_TABLE_HEIGHT - PTB) && (y >= PTB);
};

const pointWithinHorizontalBorders = (x: number): boolean => {
  return (x <= POOL_TABLE_WIDTH + PTB) && (x >= PTB);
};

const getBorderCollusionPoint = (start: Point, end: Point): Point => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  if (end.x > POOL_TABLE_WIDTH - PTB) {
    const newY = start.y + (POOL_TABLE_WIDTH - PTB - start.x) * Math.tan(angle);
    if (pointWithinVerticalBorders(newY)) {
      return {
        x: POOL_TABLE_WIDTH - PTB,
        y: newY
      };
    }
  }
  if (end.x < PTB) {
    const newY = start.y + (PTB - start.x) * Math.tan(angle);
    if (pointWithinVerticalBorders(newY)) {
      return {
        x: PTB,
        y: newY
      };
    }
  }
  if (end.y > POOL_TABLE_HEIGHT - PTB) {
    const newX = start.x + (POOL_TABLE_HEIGHT - PTB - start.y) / Math.tan(angle);
    if (pointWithinHorizontalBorders(newX)) {
      return {
        x: newX,
        y: POOL_TABLE_HEIGHT - PTB
      };
    }
  }
  if (end.y < PTB) {
    const newX = start.x + (PTB - start.y) / Math.tan(angle);
    if (pointWithinHorizontalBorders(newX)) {
      return {
        x: newX,
        y: PTB
      };
    }
  }
  return { x: 0, y: 0 };
};

export const animateShoot = (
  ctx: CanvasRenderingContext2D,
  balls: Ball[],
  selectedBallIndex: number,
  mouseMoveCoords: Point
): Promise<boolean> => {
  const selectedBall = balls[selectedBallIndex];
  const position = selectedBall.getPosition();
  const shootPower = Math.min(MAX_BALL_MOMENTUM, BMM * Math.sqrt((mouseMoveCoords.x - position.x) ** 2 + (mouseMoveCoords.y - position.y) ** 2));
  if (shootPower === 0) {
    return Promise.resolve(false);
  }
  const res = new Promise<boolean>((resolve) => {
    const shootAngle = Math.atan2(mouseMoveCoords.y - position.y, mouseMoveCoords.x - position.x);
    balls[selectedBallIndex].setMomentum({
      x: shootPower * Math.cos(shootAngle) / 20,
      y: shootPower * Math.sin(shootAngle) / 20
    });
    let requestId: number;
    const animate = () => {
      ctx.clearRect(0, 0, POOL_TABLE_WIDTH, POOL_TABLE_HEIGHT);
      checkBallsForCollisions(balls);
      animateBalls(ctx, balls);
      if (balls.every(ball => ball.getMomentumLength() < 0.1)) {
        cancelAnimationFrame(requestId);
        resetMomentums(balls)
        resolve(true);
      } else {
        requestId = requestAnimationFrame(animate);
      }
    };
    animate();
  });
  return res;
};

const checkBallsForCollisions = (balls: Ball[]) => {
  for (let i = 0; i < balls.length; i++) {
    const ball1 = balls[i];
    const pos1 = ball1.getPosition();
    for (let j = i + 1; j < balls.length; j++) {
      if (i === j) {
        return;
      }
      const ball2 = balls[j];
      const pos2 = ball2.getPosition();
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < BR * 2) {
        handleCollision(ball1, ball2);
      }
    };
  };
};

const handleCollision = (ball1: Ball, ball2: Ball) => {
  const pos1 = ball1.getPosition();
  const pos2 = ball2.getPosition();
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normalX = dx / distance;
  const normalY = dy / distance;
  const momentum1 = ball1.getMomentum();
  const momentum2 = ball2.getMomentum();
  const relativeVelocityX = momentum2.x - momentum1.x;
  const relativeVelocityY = momentum2.y - momentum1.y;
  const impulse = relativeVelocityX * normalX + relativeVelocityY * normalY;
  if (impulse === 0) {
    return;
  }
  ball1.addMomentum({ x: impulse * normalX, y: impulse * normalY })
  ball2.addMomentum({ x: -impulse * normalX, y: -impulse * normalY })
  // TODO: fix balls overlapping hack
  ball1.movePosition({ x: Math.sign(dx), y: Math.sign(dy) });
  ball2.movePosition({ x: -Math.sign(dx), y: -Math.sign(dy) });
};

const animateBalls = (ctx: CanvasRenderingContext2D, balls: Ball[]) => {
  balls.forEach(ball => {
    checkWallCollision(ball);
    const momentum = ball.getMomentum();
    ball.movePosition({ x: -momentum.x, y: -momentum.y });
    ball.multiplyMomentum(0.99);
    ctx.beginPath();
    const position = ball.getPosition();
    ctx.arc(position.x, position.y, BR, 0, Math.PI * 2);
    ctx.fillStyle = ball.getColor();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  });
};

const checkWallCollision = (ball: Ball) => {
  const position = ball.getPosition();
  const momentum = ball.getMomentum();
  if (position.x > POOL_TABLE_WIDTH - BR - PTB) {
    position.x = POOL_TABLE_WIDTH - BR - PTB;
    ball.setMomentum({ x: momentum.x * -1, y: momentum.y });
  } else if (position.x < BR + PTB) {
    position.x = BR + PTB;
    ball.setMomentum({ x: momentum.x * -1, y: momentum.y });
  }
  if (position.y > POOL_TABLE_HEIGHT - BR - PTB) {
    position.y = POOL_TABLE_HEIGHT - BR - PTB;
    ball.setMomentum({ x: momentum.x, y: momentum.y * -1 });
  } else if (position.y < BR + PTB) {
    position.y = BR + PTB;
    ball.setMomentum({ x: momentum.x, y: momentum.y * -1 });
  }
};

const resetMomentums = (balls: Ball[]) => {
  balls.forEach(ball => {
    ball.setMomentum({ x: 0, y: 0 });
  });
};

export const getBallUnderCursorIndex = (position: Point, balls: Ball[]): number => {
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const pos = ball.getPosition();
    const dx = position.x - pos.x;
    const dy = position.y - pos.y;
    if (dx * dx + dy * dy < BR * BR) {
      return i;
    }
  }
  return -1;
};

export const getPoint = (event: React.MouseEvent<HTMLCanvasElement> | MouseEvent, canvas: HTMLCanvasElement): Point => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};