import React, { useEffect, useRef, useState } from 'react';
import { ContextMenu } from './ContextMenu';
import {
  COLORS,
  POOL_TABLE_WIDTH,
  POOL_TABLE_HEIGHT,
  PLAYER_ACTION,
} from '../assets/consts';
import {
  Point,
  PlayerAction,
} from '../assets/types';
import { Ball } from '../assets/classes';
import {
  clearCanvas,
  getInitialBalls,
  renderBalls,
  getBallUnderCursorIndex,
  getPoint,
  renderAimLine,
  animateShoot,
} from '../assets/servises';
import '../styles/Pool.css';

const Pool: React.FC = () => {
  const contextMenu = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ selectedBallIndex, setSelectedBallIndex ] = useState<number>(-1);
  const [ canvasContext, setCanvasContext ] = useState<CanvasRenderingContext2D | null>(null);
  const [ balls, setBalls ] = useState<Ball[]>(getInitialBalls());
  const [ playerAction, setPlayerAction ] = useState<PlayerAction>(PLAYER_ACTION.NONE);
  const [ mouseMoveCoords, setMouseMoveCoords ] = useState<Point | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    if (window.devicePixelRatio > 1) {
      canvas.width = POOL_TABLE_WIDTH * 2;
      canvas.height = POOL_TABLE_HEIGHT * 2;
      canvas.style.width = `${POOL_TABLE_WIDTH}px`;
      canvas.style.height = `${POOL_TABLE_HEIGHT}px`;
      ctx.scale(2, 2);
    }
    setCanvasContext(ctx);
  }, []);

  useEffect(() => {
    if (!canvasContext) {
      return;
    }
    canvasContext.clearRect(0, 0, POOL_TABLE_WIDTH, POOL_TABLE_HEIGHT);
    if ((playerAction === PLAYER_ACTION.AIM) && (selectedBallIndex !== -1) && mouseMoveCoords) {
      renderAimLine(canvasContext, balls[selectedBallIndex].getPosition(), mouseMoveCoords);
    }
    renderBalls(canvasContext, balls);
  }, [mouseMoveCoords, balls, canvasContext]);

  useEffect(() => {
    if (playerAction === PLAYER_ACTION.SHOOT) {
      if ((selectedBallIndex !== -1) && mouseMoveCoords && canvasContext && canvasRef.current) {
        animateShoot(canvasContext, balls, selectedBallIndex, mouseMoveCoords)
          .then(() => {
            setPlayerAction(PLAYER_ACTION.NONE);
            setMouseMoveCoords(null);
          });
      } else {
        setPlayerAction(PLAYER_ACTION.NONE);
      }
    }
  }, [playerAction]);

  const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!contextMenu.current) {
      return;
    }
    const index = getBallUnderCursorIndex(getPoint(event, canvasRef.current as HTMLCanvasElement), balls);
    if (index === -1) {
      return;
    }
    setSelectedBallIndex(index);
    contextMenu.current.style.top = `${event.clientY}px`;
    contextMenu.current.style.left = `${event.clientX}px`;
    contextMenu.current.style.display = 'block';
  };

  const handleClick = () => {
    if (contextMenu.current) {
      contextMenu.current.style.display = 'none';
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 2) {
      return;
    }
    const index = getBallUnderCursorIndex(getPoint(event, canvasRef.current as HTMLCanvasElement), balls);
    if (index === -1) {
      return;
    }
    setSelectedBallIndex(index);
    setPlayerAction(PLAYER_ACTION.AIM);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (!canvasContext) {
        return;
      }
      setPlayerAction(PLAYER_ACTION.NONE);
      setSelectedBallIndex(-1);
      clearCanvas(canvasContext);
      renderBalls(canvasContext, balls);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.current) {
      return;
    }
    setMouseMoveCoords(getPoint(event , canvasRef.current));
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    setPlayerAction(PLAYER_ACTION.SHOOT);
  };

  const handleOptionClick = (color: string) => {
    if (contextMenu.current) {
      contextMenu.current.style.display = 'none';
    }
    if (selectedBallIndex === -1) {
      return;
    }
    const newBalls = balls.map((ball, index) => index === selectedBallIndex ? {...ball, color} : ball);
    setBalls(newBalls as Ball[]);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{width: `${POOL_TABLE_WIDTH}px`, height: `${POOL_TABLE_HEIGHT}px`}}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      />
      <ContextMenu
        menuOptions={COLORS}
        reference={contextMenu}
        handleOptionClick={handleOptionClick}
      />
      <div
        className='cover'
        style={{
          display: playerAction === PLAYER_ACTION.SHOOT ? 'block' : 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </>
  );
};

export default Pool;