import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { emailTheme } from '@/components/email/email-theme';

const { light, dark, font } = emailTheme;

// Mail clients that support it switch to the dark colours; the rest keep the light ones written inline.
const darkMode = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  @media (prefers-color-scheme: dark) {
    .page { background-color: ${dark.page} !important; }
    .panel { background-color: ${dark.panel} !important; border-color: ${dark.line} !important; }
    .ink { color: ${dark.ink} !important; }
    .muted { color: ${dark.muted} !important; }
    .rule { border-color: ${dark.line} !important; }
    .button { background-color: ${dark.ink} !important; color: ${dark.onInk} !important; }
  }
`;

/**
 * The frame of every email: the Celia name, one heading, a short message, one button, and a footer that says why the person got
 * it and, for optional updates, how to stop it. Square panels, a pill button and sentence case, as in docs/DESIGN.md. It has
 * no images and no tracking.
 * @param props - The layout props.
 * @param props.lang - The language of the email.
 * @param props.preview - The line mail apps show beside the subject.
 * @param props.heading - The heading.
 * @param props.body - The message.
 * @param props.action - The button's label.
 * @param props.url - Where the button goes.
 * @param props.footer - The footer lines.
 * @returns The email.
 */
export function EmailLayout(props: {
  lang: string;
  preview: string;
  heading: string;
  body: string;
  action: string;
  url: string;
  footer: {
    reason: string;
    manage?: { label: string; url: string };
    unsubscribe?: { label: string; url: string };
  };
}) {
  return (
    <Html lang={props.lang}>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{darkMode}</style>
      </Head>
      <Preview>{props.preview}</Preview>
      <Body
        className="page"
        style={{ backgroundColor: light.page, fontFamily: font, margin: 0, padding: '32px 16px' }}
      >
        <Container style={{ maxWidth: 560, margin: '0 auto' }}>
          <Text
            className="ink"
            style={{ color: light.ink, fontSize: 20, fontWeight: 700, margin: '0 0 24px' }}
          >
            Celia
          </Text>
          <Section
            className="panel"
            style={{
              backgroundColor: light.panel,
              border: `1px solid ${light.line}`,
              padding: '32px 24px',
            }}
          >
            <Heading
              as="h1"
              className="ink"
              style={{
                color: light.ink,
                fontSize: 24,
                fontWeight: 600,
                lineHeight: '32px',
                margin: '0 0 16px',
              }}
            >
              {props.heading}
            </Heading>
            <Text
              className="ink"
              style={{ color: light.ink, fontSize: 16, lineHeight: '24px', margin: '0 0 24px' }}
            >
              {props.body}
            </Text>
            <Button
              href={props.url}
              className="button"
              style={{
                backgroundColor: light.ink,
                color: light.onInk,
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                padding: '14px 28px',
                textDecoration: 'none',
              }}
            >
              {props.action}
            </Button>
          </Section>
          <Hr className="rule" style={{ borderColor: light.line, margin: '32px 0 16px' }} />
          <Text
            className="muted"
            style={{ color: light.muted, fontSize: 13, lineHeight: '20px', margin: 0 }}
          >
            {props.footer.reason}
          </Text>
          {props.footer.manage && (
            <Text
              className="muted"
              style={{ color: light.muted, fontSize: 13, lineHeight: '20px', margin: '8px 0 0' }}
            >
              <Link href={props.footer.manage.url} className="muted" style={{ color: light.muted }}>
                {props.footer.manage.label}
              </Link>
              {props.footer.unsubscribe && (
                <>
                  {' · '}
                  <Link
                    href={props.footer.unsubscribe.url}
                    className="muted"
                    style={{ color: light.muted }}
                  >
                    {props.footer.unsubscribe.label}
                  </Link>
                </>
              )}
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}
