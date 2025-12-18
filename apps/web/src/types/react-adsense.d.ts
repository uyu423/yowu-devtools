declare module 'react-adsense' {
  import React from 'react';

  interface GoogleAdSenseProps {
    client: string;
    slot: string;
    style?: React.CSSProperties;
    format?: string;
    responsive?: string;
    layoutKey?: string;
    className?: string;
  }

  const AdSense: {
    Google: React.FC<GoogleAdSenseProps>;
  };

  export default AdSense;
}

