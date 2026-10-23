'use client';

import { IconContext } from '@phosphor-icons/react';

// One icon style for the whole app: Phosphor, regular weight. Size comes from the component an icon sits in
// (16px in dense controls, 20px by default), so icons never need a weight or size prop of their own.
const iconDefaults = { weight: 'regular', size: 20 } as const;

/**
 * Applies the app-wide icon defaults.
 * @param props - The provider props.
 * @param props.children - The tree that renders icons.
 * @returns The children inside the icon context.
 */
export function IconProvider(props: { children: React.ReactNode }) {
  return <IconContext.Provider value={iconDefaults}>{props.children}</IconContext.Provider>;
}
