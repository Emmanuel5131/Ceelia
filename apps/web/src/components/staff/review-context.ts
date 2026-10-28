import * as React from 'react';

/** Lets a button in a table row open that row's side panel, since the columns are built once at module scope and cannot see state. */
export const ReviewContext = React.createContext<{ open: (id: string) => void } | null>(null);
