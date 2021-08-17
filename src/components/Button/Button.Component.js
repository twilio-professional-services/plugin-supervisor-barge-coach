import * as React from 'react';
import { IconButton, CircularProgress } from '@twilio/flex-ui';

import { ButtonContainer } from './Button.Style';

const Button = ({ icon, disabled, onClick, themeOverride, title, style, loading }) => {
  if (loading) {
    disabled = true;
  }

  const btn = (
    <IconButton
      icon={icon}
      disabled={disabled}
      onClick={onClick}
      themeOverride={themeOverride}
      title={title}
      style={style}
    />
  );
  const progress = <CircularProgress animating size={44} style={{ marginBottom: '-44px' }} />;

  if (loading) {
    return (
      <ButtonContainer>
        {progress}
        {btn}
      </ButtonContainer>
    );
  }

  return <ButtonContainer>{btn}</ButtonContainer>;
};

export default Button;
