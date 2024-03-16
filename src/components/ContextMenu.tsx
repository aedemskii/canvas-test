import React from 'react';
import { ContextMenuParams } from '../assets/types';
import '../styles/ContextMenu.css';

export const ContextMenu: React.FC<ContextMenuParams> = ({menuOptions, reference, handleOptionClick}) => {
  return (
    <div
      className='context-menu'
      ref={reference}
    >
      {menuOptions.map((option: string, index: number) => (
        <div
          className='context-menu-option'
          key={index + option}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            handleOptionClick.call(null, option)
          }}
        >
          <span>{option[0].toUpperCase() + option.slice(1)}</span>
          <span
            className='context-menu-option-icon'
            style={{backgroundColor: option}}
          />
        </div>
      ))}
    </div>
  );
}