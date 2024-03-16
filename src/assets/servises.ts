import {
  COLORS,
  BALL_RADIUS as BR,
  INIT_COORDS,
  MAX_AIM_LINE_LENGTH,
  POOL_TABLE_HEIGHT,
  POOL_TABLE_WIDTH,
} from './consts';
import { Point } from './types';
import { Ball } from './classes';

export const getInitialBalls = (): Ball[] => {
  const balls: Ball[] = [];
  INIT_COORDS.forEach((coords: Point, index) => {
    balls.push(new Ball(coords, COLORS[index % COLORS.length]));
  });
  return balls;
};

export const renderBalls = (ctx: CanvasRenderingContext2D, balls: Ball[]) => {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.arc(ball.position.x, ball.position.y, BR, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  });
};

export const renderAimLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
  ctx.beginPath();
  ctx.setLineDash([5, 3]);
  ctx.moveTo(start.x, start.y);
  const length = Math.min(MAX_AIM_LINE_LENGTH, Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) * 2);
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const newX = start.x - length * Math.cos(angle);
  const newY = start.y - length * Math.sin(angle);
  ctx.lineTo(newX, newY);
  ctx.strokeStyle = '#000';
  ctx.stroke();

  const arrowSize = 10;
  ctx.beginPath();
  ctx.moveTo(newX, newY);
  ctx.lineTo(newX + arrowSize * Math.cos(angle - Math.PI / 6), newY + arrowSize * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(newX, newY);
  ctx.lineTo(newX + arrowSize * Math.cos(angle + Math.PI / 6), newY + arrowSize * Math.sin(angle + Math.PI / 6));
  ctx.strokeStyle = '#000';
  ctx.stroke();
};

export const animateShoot = (
  ctx: CanvasRenderingContext2D,
  balls: Ball[],
  selectedBallIndex: number,
  mouseMoveCoords: Point
): Promise<boolean> => {
  const selectedBall = balls[selectedBallIndex];
  const shootPower = Math.min(MAX_AIM_LINE_LENGTH, Math.sqrt((mouseMoveCoords.x - selectedBall.position.x) ** 2 + (mouseMoveCoords.y - selectedBall.position.y) ** 2));
  if (shootPower === 0) {
    return Promise.resolve(false);
  }
  const res = new Promise<boolean>((resolve) => {
    const shootAngle = Math.atan2(mouseMoveCoords.y - selectedBall.position.y, mouseMoveCoords.x - selectedBall.position.x);
    balls[selectedBallIndex].momentum = {
      x: shootPower * Math.cos(shootAngle) / 20,
      y: shootPower * Math.sin(shootAngle) / 20
    };
    let requestId: number;
    const animate = () => {
      ctx.clearRect(0, 0, POOL_TABLE_WIDTH, POOL_TABLE_HEIGHT);
      checkBallsForCollisions(balls);
      animateBalls(ctx, balls);
      if (balls.every(ball => ball.momentum.x ** 2 + ball.momentum.y ** 2 < 0.1)) {
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
    for (let j = i + 1; j < balls.length; j++) {
      if (i === j) {
        return;
      }
      const ball2 = balls[j];
      const dx = ball1.position.x - ball2.position.x;
      const dy = ball1.position.y - ball2.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < BR * 2) {
        handleCollision(ball1, ball2);
      }
    };
  };
};

const handleCollision = (ball1: Ball, ball2: Ball) => {
  const dx = ball1.position.x - ball2.position.x;
  const dy = ball1.position.y - ball2.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normalX = dx / distance;
  const normalY = dy / distance;
  const relativeVelocityX = ball2.momentum.x - ball1.momentum.x;
  const relativeVelocityY = ball2.momentum.y - ball1.momentum.y;
  const impulse = relativeVelocityX * normalX + relativeVelocityY * normalY;
  if (impulse === 0) {
    return;
  }
  ball1.momentum.x += impulse * normalX;
  ball1.momentum.y += impulse * normalY;
  ball2.momentum.x -= impulse * normalX;
  ball2.momentum.y -= impulse * normalY;
  // TODO: fix balls overlapping hack
  ball1.position.x += Math.sign(dx);
  ball1.position.y += Math.sign(dy);
  ball2.position.x -= Math.sign(dx);
  ball2.position.y -= Math.sign(dy);
};

const animateBalls = (ctx: CanvasRenderingContext2D, balls: Ball[]) => {
  balls.forEach(ball => {
    checkWallCollision(ball);
    ball.position.x -= ball.momentum.x;
    ball.position.y -= ball.momentum.y;
    ball.momentum.x *= 0.99;
    ball.momentum.y *= 0.99;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, BR, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  });
};

const checkWallCollision = (ball: Ball) => {
  if (ball.position.x > POOL_TABLE_WIDTH - BR) {
    ball.position.x = POOL_TABLE_WIDTH - BR;
    ball.momentum.x *= -1;
  } else if (ball.position.x < BR) {
    ball.position.x = BR;
    ball.momentum.x *= -1;
  }
  if (ball.position.y > POOL_TABLE_HEIGHT - BR) {
    ball.position.y = POOL_TABLE_HEIGHT - BR;
    ball.momentum.y *= -1;
  } else if (ball.position.y < BR) {
    ball.position.y = BR;
    ball.momentum.y *= -1;
  }
};

const resetMomentums = (balls: Ball[]) => {
  balls.forEach(ball => {
    ball.momentum = {
      x: 0,
      y: 0
    };
  });
};

export const getBallUnderCursorIndex = (position: Point, balls: Ball[]): number => {
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    const dx = position.x - ball.position.x;
    const dy = position.y - ball.position.y;
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