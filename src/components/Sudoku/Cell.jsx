import React from 'react';

const Cell = ({ value, isFixed, isSelected, isHighlighted, isError, onCellClick }) => {
  let className = "cell";
  if (isFixed) className += " fixed";
  if (isSelected) className += " selected";
  if (isHighlighted && !isSelected) className += " highlighted";
  if (isError) className += " error";

  return (
    <div className={className} onClick={onCellClick}>
      {value !== 0 ? value : ''}
    </div>
  );
};

export default Cell;
