import * as React from 'react';

const unsubscribe = () => {
  // Nothing changes after the first render, so there is nothing to clean up.
};
const subscribe = () => unsubscribe;

/**
 * Tells whether the component is running in the browser, without an effect. Use it to hold back a value that only the
 * browser knows (a saved theme, for example) so the server and the first browser render match.
 * @returns False on the server and during hydration, true after.
 */
export function useIsClient() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
