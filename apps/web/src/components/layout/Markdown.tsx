import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

// Markdown in the person's own words, drawn with the app's type. Nothing is set apart by colour, and a link always opens away from Celia.
const components: Components = {
  h1: ({ children }) => <h3 className="text-lg font-medium">{children}</h3>,
  h2: ({ children }) => <h3 className="text-base font-medium">{children}</h3>,
  h3: ({ children }) => <h4 className="text-base font-medium">{children}</h4>,
  p: (props) => <p className="text-base" {...props} />,
  ul: (props) => <ul className="grid list-disc gap-1 pl-5" {...props} />,
  ol: (props) => <ol className="grid list-decimal gap-1 pl-5" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-2 border-border pl-4 text-ink-muted" {...props} />
  ),
  code: (props) => <code className="bg-paper px-1 font-mono text-sm" {...props} />,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium underline underline-offset-4 focus-ring"
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  ),
};

/**
 * Shows text written in markdown: headings, bold, italic, lists, quotes and links. Raw HTML is never drawn and a picture is
 * dropped, so a person cannot put a tracking image or a script in a statement that staff and lawyers read. Addresses that are not
 * web or mail links are dropped by the library.
 * @param props - The markdown props.
 * @param props.children - The markdown.
 * @returns The formatted text.
 */
export function Markdown(props: { children: string }) {
  return (
    <div className="grid gap-3 break-words">
      <ReactMarkdown components={components} skipHtml disallowedElements={['img']} unwrapDisallowed>
        {props.children}
      </ReactMarkdown>
    </div>
  );
}
