/** Line icons (stroke = currentColor) drawn on the Figma 36/40/32/20 px grids. */
export const serviceIcons: Record<string, string> = {
  // Lucide "pen-tool" (ISC license), the de-facto design icon, centred on our 36px grid
  pen: '<g transform="translate(6 6)" stroke-linecap="round" stroke-linejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></g>',
  asterisk: '<path d="M7 18H29M18 7V29M10.2 10.2L25.8 25.8M25.8 10.2L10.2 25.8"/>',
  device: '<path d="M11 9C6.5 13.5 6.5 22.5 11 27M25 9C29.5 13.5 29.5 22.5 25 27"/><path d="M15 13H18C22.5 13 22.5 23 18 23H15Z"/>',
  sparkle: '<path d="M18 6C19 15 21 17 30 18C21 19 19 21 18 30C17 21 15 19 6 18C15 17 17 15 18 6Z"/><circle cx="18" cy="18" r="1.6" fill="currentColor"/>',
  frame: '<path d="M8 13V8H13M23 8H28V13M28 23V28H23M13 28H8V23M9 9L27 27"/>',
  arcs: '<path d="M7 8Q18 21 29 8M7 28Q18 15 29 28M7 18H29"/>',
};
export const buildIcons: Record<string, string> = {
  browser: '<rect x="4" y="8" width="32" height="24"/><path d="M4 14H36M9 20H24M9 25H19"/><rect x="7" y="10" width="1.5" height="1.5"/><rect x="11" y="10" width="1.5" height="1.5"/>',
  phone: '<rect x="12" y="4" width="16" height="32"/><path d="M17 8H23"/><rect x="18.5" y="30" width="3" height="3"/>',
  dashboard: '<rect x="4" y="6" width="32" height="28"/><path d="M12 6V34M16 28L21 21L25 24L32 14"/>',
  stack: '<rect x="4" y="13" width="22" height="20"/><path d="M4 18H26M11 6H36V26H26M11 6V13"/><path d="M8 23H18M8 27H14"/>',
  question: '<circle cx="20" cy="20" r="15"/><path d="M15.5 16C15.5 11 24.5 11 24.5 16C24.5 19.5 20 19.5 20 23.5"/><rect x="19" y="27.5" width="2" height="2"/>',
};
// Glossary icons: one 32-unit grid, 1.5 stroke, the metaphors developers already read at a glance
// (rocket = launch an MVP, browser = frontend, database = backend data, braces + exchange = API,
//  cloud + deploy arrow = hosting, wrench = maintenance).
export const glossaryIcons: Record<string, string> = {
  mvp: '<path d="M16 3.5C20.5 7 22 12.5 21 20H11C10 12.5 11.5 7 16 3.5Z"/><circle cx="16" cy="12.5" r="2.5"/><path d="M11.2 15.5L7 20.5V25L11 21.5M20.8 15.5L25 20.5V25L21 21.5M13.5 23.5L16 29L18.5 23.5"/>',
  frontend: '<rect x="3" y="5" width="26" height="22"/><path d="M3 10.5H29"/><path d="M6.5 7.8H7.5M9.5 7.8H10.5M12.5 7.8H13.5"/><rect x="7" y="14" width="8" height="9"/><path d="M18.5 15H25M18.5 18.5H25M18.5 22H22.5"/>',
  backend: '<ellipse cx="16" cy="7.5" rx="10" ry="3.5"/><path d="M6 7.5V24.5C6 26.4 10.5 28 16 28S26 26.4 26 24.5V7.5"/><path d="M6 13.2C6 15.1 10.5 16.7 16 16.7S26 15.1 26 13.2M6 18.9C6 20.8 10.5 22.4 16 22.4S26 20.8 26 18.9"/>',
  api: '<path d="M10.5 5.5C7.8 5.5 7.8 7.5 7.8 10V12.5C7.8 14.7 6.3 16 4.5 16C6.3 16 7.8 17.3 7.8 19.5V22C7.8 24.5 7.8 26.5 10.5 26.5M21.5 5.5C24.2 5.5 24.2 7.5 24.2 10V12.5C24.2 14.7 25.7 16 27.5 16C25.7 16 24.2 17.3 24.2 19.5V22C24.2 24.5 24.2 26.5 21.5 26.5"/><path d="M12 13.5H20M17.5 11L20 13.5L17.5 16M20 18.5H12M14.5 16L12 18.5L14.5 21"/>',
  cloud: '<path d="M9 26C5 26 3 23.5 3 20.5C3 17.5 5.5 15 8.5 15C9.5 10.5 13 8 17 8C22 8 25.5 12 25.5 16C28 16.5 29.5 18.5 29.5 21C29.5 23.8 27.3 26 24.5 26H20M12 26H9"/><path d="M16 28V17.5M12.5 21L16 17.5L19.5 21"/>',
  gear: '<path d="M20.2 4.4C17 3.8 13.9 5.3 12.6 8.2C11.7 10.2 11.9 12.4 12.9 14.2L4.5 22.6C3.4 23.7 3.4 25.5 4.5 26.6L5.4 27.5C6.5 28.6 8.3 28.6 9.4 27.5L17.8 19.1C19.6 20.1 21.8 20.3 23.8 19.4C26.7 18.1 28.2 15 27.6 11.8L23.6 15.8L19.4 15.2L16.8 12.6L16.2 8.4Z"/>',
};
export const contactIcons: Record<string, string> = {
  email: '<rect x="2" y="4" width="16" height="12"/><path d="M2 5L10 11L18 5"/>',
  phone: '<path d="M5 2H8L9.5 6L7.5 7.5C8.5 9.5 10.5 11.5 12.5 12.5L14 10.5L18 12V15C18 16.5 16.5 18 15 18C8 17.5 2.5 12 2 5C2 3.5 3.5 2 5 2Z"/>',
  whatsapp: '<path d="M3 17L4.2 13.5C3.4 12.3 3 11 3 9.5C3 5.9 6.1 3 10 3S17 5.9 17 9.5S13.9 16 10 16C8.7 16 7.5 15.7 6.5 15.1Z"/>',
  office: '<path d="M10 18C10 18 16 12.5 16 8C16 4.7 13.3 2 10 2S4 4.7 4 8C4 12.5 10 18 10 18Z"/><rect x="8" y="6" width="4" height="4"/>',
};
export const socialIcons: Record<string, string> = {
  Behance: '<text x="27.5" y="34" text-anchor="middle" font-family="Roboto Mono, monospace" font-weight="700" font-size="19" fill="currentColor">Bē</text>',
  LinkedIn: '<rect x="16" y="16" width="23" height="23" rx="3" stroke="currentColor" stroke-width="2"/><rect x="20.5" y="25" width="2.8" height="9.5" fill="currentColor"/><circle cx="21.9" cy="21.3" r="1.7" fill="currentColor"/><path d="M26 34.5V25H28.7V26.4C29.6 24.6 34.5 24.2 34.5 28.4V34.5H31.7V29C31.7 26.9 28.8 26.9 28.8 29V34.5Z" fill="currentColor"/>',
  Dribbble: '<circle cx="27.5" cy="27.5" r="11" stroke="currentColor" stroke-width="2"/><path d="M20 19.5C26 24 32 31 34 38M16.8 25.5C23 26.5 32 24 36 19.3M17.5 32.5C23 28.5 31 28.5 38.5 30.5" stroke="currentColor" stroke-width="1.8"/>',
  X: '<path d="M18 17H23.5L37 38H31.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M36 17L28.8 25.3M19 38L26.2 29.8" stroke="currentColor" stroke-width="1.8"/>',
};
