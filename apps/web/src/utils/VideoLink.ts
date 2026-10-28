/**
 * Reads the link to a video a person made to explain their case. Only a web address that starts with https and names a host is
 * kept, so staff are never sent to a script, a local file or an address that has no site behind it. The link is returned the way
 * the browser writes it, without a fragment.
 * @param value - What the person typed.
 * @returns The link, or null when it is not one we accept.
 */
export function parseVideoLink(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > 500 || !URL.canParse(trimmed)) {
    return null;
  }

  const url = new URL(trimmed);
  // A host with no dot, such as "localhost" or an address someone typed by mistake, is not a place a video lives.
  const hostable = url.hostname.includes('.') && url.username === '' && url.password === '';

  if (url.protocol !== 'https:' || !hostable) {
    return null;
  }

  url.hash = '';

  return url.toString();
}
