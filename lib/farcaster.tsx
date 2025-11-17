'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function useFarcasterFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        sdk.actions.ready();
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Farcaster SDK not available:', error);
        setIsSDKLoaded(true); // Still allow app to work outside frames
      }
    };

    load();
  }, []);

  return { isSDKLoaded, context, sdk };
}
