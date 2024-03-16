import React from 'react';
import { PLAYER_ACTION } from './consts';

export type ContextMenuParams = {
  menuOptions: readonly string[];
  reference: React.RefObject<HTMLDivElement>;
  handleOptionClick: (option: string) => void;
};

export type Point = {
  x: number;
  y: number;
}

export type Vector = {
  x: number;
  y: number;
}

type ObjectValues<T> = T[keyof T];
export type PlayerAction = ObjectValues<typeof PLAYER_ACTION>;