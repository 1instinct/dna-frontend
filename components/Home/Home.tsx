import React from 'react';
import { useTheme } from '@emotion/react';

import * as Layouts from './Layouts';

export const Home = () => {
  const theme = useTheme();

  const enableThemeLayout = (theme: any) => {
    switch (theme.name) {
      case 'Omniscient':
        return <Layouts.TelevisionHome />;
      case 'Fashion':
        return <Layouts.FashionHome />;
      default:
        return <Layouts.TelevisionHome />;
    }
  };

  return (
    <div className="home">
      {enableThemeLayout(theme)}
    </div>
  );
}