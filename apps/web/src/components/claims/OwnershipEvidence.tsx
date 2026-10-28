'use client';

import { FilePdfIcon, PlayCircleIcon, XIcon } from '@phosphor-icons/react';
import { useFormatter, useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { Button } from '@/components/ui/button';
import type { ProofFile } from '@/libs/claims/ClaimProofs';

// A row of what was added, with its own Remove button. Removing is done on the server, which checks it is the person's own claim.
function EvidenceRow(props: {
  icon: React.ReactNode;
  title: React.ReactNode;
  meta: string;
  onRemove: () => Promise<ClaimState>;
}) {
  const t = useTranslations('ClaimPage');
  const [pending, startTransition] = React.useTransition();

  return (
    <li className="flex items-center gap-3 border border-border bg-paper p-2">
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden bg-surface">
        {props.icon}
      </span>
      <div className="grid min-w-0 flex-1">
        <span className="truncate text-sm font-medium">{props.title}</span>
        <span className="truncate text-xs text-ink-muted">{props.meta}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={t('own_remove')}
        onClick={() => {
          startTransition(async () => {
            await props.onRemove();
          });
        }}
      >
        <XIcon aria-hidden="true" />
        {t('own_remove')}
      </Button>
    </li>
  );
}

/**
 * The video the person added: where it lives, a link to open it, and Remove. The link is shown by its site, not as a long address.
 * @param props - The video props.
 * @param props.url - The link.
 * @param props.onRemove - The server action that forgets it.
 * @returns The row.
 */
export function VideoItem(props: { url: string; onRemove: () => Promise<ClaimState> }) {
  const t = useTranslations('ClaimPage');
  const host = new URL(props.url).hostname.replace(/^www\./u, '');

  return (
    <ul className="grid gap-2">
      <EvidenceRow
        icon={<PlayCircleIcon className="size-6" aria-hidden="true" />}
        title={
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 focus-ring"
          >
            {t('own_video_open', { host })}
          </a>
        }
        meta={props.url}
        onRemove={props.onRemove}
      />
    </ul>
  );
}

/**
 * The files the person added: a small picture for an image and an icon for a PDF, the name, the size and Remove. A file opens in a
 * new tab from the name.
 * @param props - The files props.
 * @param props.claimId - The claim.
 * @param props.files - The files.
 * @param props.onRemove - The server action that deletes one file.
 * @returns The list.
 */
export function FileList(props: {
  claimId: string;
  files: ProofFile[];
  onRemove: (proofId: string) => Promise<ClaimState>;
}) {
  const format = useFormatter();

  return (
    <ul className="grid gap-2">
      {props.files.map((file) => {
        const href = `/api/claims/${props.claimId}/proofs/${file.id}`;

        return (
          <EvidenceRow
            key={file.id}
            icon={
              file.contentType.startsWith('image/') ? (
                <Image
                  src={href}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="size-12 object-cover"
                />
              ) : (
                <FilePdfIcon className="size-6" aria-hidden="true" />
              )
            }
            title={
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 focus-ring"
              >
                {file.name}
              </a>
            }
            meta={`${format.number(file.size / 1024, { maximumFractionDigits: 0 })} KB`}
            onRemove={async () => await props.onRemove(file.id)}
          />
        );
      })}
    </ul>
  );
}
