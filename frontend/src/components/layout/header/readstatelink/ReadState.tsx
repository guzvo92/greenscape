import { buttonStyles } from '@gear-js/ui';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

type ClassNameProps = {
  isActive: boolean;
};

function ReadStatelink() {
  const getClassName = ({ isActive }: ClassNameProps) =>
    clsx(buttonStyles.button, buttonStyles.small, isActive ? buttonStyles.secondary : buttonStyles.primary);

  return (
    <NavLink to="readstatelink" className={getClassName}>
      State
    </NavLink>
  );
}

export { ReadStatelink };
