import {
  CheckSquareIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  SealCheckIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/locales/en.json';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const swatches = [
  ['ink', 'bg-ink'],
  ['ink-muted', 'bg-ink-muted'],
  ['paper', 'bg-paper'],
  ['paper-sunken', 'bg-paper-sunken'],
  ['seal', 'bg-seal'],
  ['line', 'bg-line'],
] as const;

const rows = [
  { wallet: '0x7a3f…e91c', amount: '12,400.00', status: 'Confirmed' },
  { wallet: '0x19cd…04b2', amount: '3,150.50', status: 'Confirmed' },
  { wallet: '0x52a8…c1d9', amount: '980.00', status: 'Not confirmed' },
];

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl">{props.title}</h2>
      {props.children}
    </section>
  );
}

function Foundations() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 bg-surface p-8">
      <Section title="Type">
        <div className="grid gap-2">
          <h1 className="text-3xl">Page title, Aeonik 32</h1>
          <h2 className="text-2xl">Section title, Aeonik 24</h2>
          <h3 className="text-xl">Card title, Aeonik 20</h3>
          <p className="text-base">
            Body, Mulish 15. Every screen uses these sizes and nothing else.
          </p>
          <p className="text-sm text-ink-muted">Table cell and label, Mulish 13.5</p>
          <p className="font-mono text-xs">0x7a3f…e91c · evidence data in IBM Plex Mono 12.5</p>
        </div>
      </Section>

      <Section title="Colour">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
          {swatches.map(([name, cls]) => (
            <div key={name} className="grid gap-2">
              <div className={`h-16 border border-border ${cls}`} />
              <span className="text-xs text-ink-muted">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Report fraud</Button>
          <Button>Primary</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Remove</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="sm" variant="outline">
            <DownloadSimpleIcon /> Export
          </Button>
          <Button>
            <FileTextIcon /> Open case
          </Button>
          <Button size="icon" variant="outline" aria-label="Search">
            <MagnifyingGlassIcon />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Form row: same height, same edges">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet">Wallet</Label>
            <Input id="wallet" placeholder="0x…" className="w-64 font-mono text-xs" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="chain">Chain</Label>
            <Select defaultValue="eth">
              <SelectTrigger id="chain" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eth">Ethereum</SelectItem>
                <SelectItem value="sol">Solana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <WalletIcon /> Add wallet
          </Button>
        </div>
      </Section>

      <Section title="Badges and status marks">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Pending</Badge>
          <Badge variant="solid">
            <CheckSquareIcon /> Confirmed
          </Badge>
          <Badge variant="dashed">Not confirmed</Badge>
          <Badge variant="seal">
            <SealCheckIcon /> Finding
          </Badge>
          <Badge variant="muted">Draft</Badge>
        </div>
      </Section>

      <Section title="Card, tabs, table">
        <Card>
          <CardHeader>
            <CardTitle>Evidence file</CardTitle>
            <CardDescription>What the chain confirms, and what it does not.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wallets">
              <TabsList>
                <TabsTrigger value="wallets">Wallets</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
              </TabsList>
              <TabsContent value="wallets">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.wallet}>
                        <TableCell className="font-mono text-xs">{r.wallet}</TableCell>
                        <TableCell className="text-right">{r.amount}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === 'Confirmed' ? 'solid' : 'dashed'}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="evidence">Sealed evidence appears here.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Section>

      <Section title="Dialog">
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add your wallet</DialogTitle>
                <DialogDescription>
                  Ownership is proven by signing from the wallet.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button>Sign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Overview',
  component: Foundations,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      // WORKAROUND: incompatibility issue between Storybook 10.5.8 and Next.js 16.4
      appDirectory: false,
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
