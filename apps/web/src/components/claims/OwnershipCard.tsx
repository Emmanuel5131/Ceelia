'use client';

import type { ChainId } from '@celia/core';
import { PenNibIcon, WalletIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import type { ClaimState } from '@/app/[locale]/(auth)/dashboard/claims/actions';
import { FileList, VideoItem } from '@/components/claims/OwnershipEvidence';
import {
  DocumentsWay,
  HandCopy,
  HandPaste,
  VideoWay,
  WalletWay,
} from '@/components/claims/OwnershipWays';
import type { OwnershipAction } from '@/components/claims/OwnershipWays';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ProofFile } from '@/libs/claims/ClaimProofs';
import type { OwnershipMethod } from '@/utils/claims/Ownership';

type Section = 'sign' | 'video' | 'files';
type SignStep = 'choose' | 'wallet' | 'copy' | 'paste';

export type OwnershipCardProps = {
  claimId: string;
  chain: ChainId;
  address: string;
  message: string;
  /** How the wallet was confirmed, or null while it is not. */
  method: OwnershipMethod | null;
  /** Whether a signature has been checked, whatever else confirmed the wallet. */
  signed: boolean;
  /** Whether a video or files are waiting for staff to look at. */
  waiting: boolean;
  reviewNote: string | null;
  videoUrl: string | null;
  files: ProofFile[];
  canVerify: boolean;
  inBrowser: boolean;
  tool: { name: 'Etherscan' | 'Tronscan'; url: string } | null;
  verify: OwnershipAction;
  sendProof: OwnershipAction;
  sendVideo: OwnershipAction;
  withdraw: () => Promise<ClaimState>;
  remove: (target: { kind: 'video' | 'file'; proofId?: string }) => Promise<ClaimState>;
};

/**
 * One kind of evidence: what it is, whether it has been added, and a button to add or change it. Its form opens underneath, and
 * what was already added is listed under the heading.
 * @param props - The section props.
 * @param props.title - What it is.
 * @param props.text - One line on what it shows.
 * @param props.status - The word for where it stands, such as "Done" or "Not added".
 * @param props.added - Whether anything has been added, which fills the badge.
 * @param props.action - The text of the button, or nothing when it cannot be used.
 * @param props.open - Whether the form is showing.
 * @param props.onToggle - Called when the button is pressed.
 * @param props.details - What was already added.
 * @param props.children - The form.
 * @returns The section.
 */
function EvidenceSection(props: {
  title: string;
  text: string;
  status: string;
  added: boolean;
  action?: string;
  open: boolean;
  onToggle: () => void;
  details?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outline" size="sm">
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid min-w-0 flex-1 gap-1">
            <h3 className="text-base font-medium">{props.title}</h3>
            <p className="text-sm text-ink-muted">{props.text}</p>
          </div>
          <Badge variant={props.added ? 'solid' : 'dashed'}>{props.status}</Badge>
          {props.action && (
            <Button
              type="button"
              variant={props.open ? 'ghost' : 'outline'}
              size="sm"
              aria-expanded={props.open}
              onClick={props.onToggle}
            >
              {props.action}
            </Button>
          )}
        </div>
        {props.details}
        {props.open && props.children}
      </CardContent>
    </Card>
  );
}

function SignForm(props: {
  card: OwnershipCardProps;
  step: SignStep;
  onStep: (step: SignStep) => void;
}) {
  const t = useTranslations('ClaimPage');
  const { card } = props;
  const back = props.step === 'paste' ? 'copy' : 'choose';
  const first = card.inBrowser ? 'choose' : 'copy';
  const inner =
    props.step === first ? null : (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="justify-self-start"
        onClick={() => {
          props.onStep(back);
        }}
      >
        {t('back')}
      </Button>
    );

  if (props.step === 'choose') {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            props.onStep('wallet');
          }}
        >
          <WalletIcon aria-hidden="true" />
          {t('own_way_wallet_title')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            props.onStep('copy');
          }}
        >
          <PenNibIcon aria-hidden="true" />
          {t('own_way_hand_title')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {inner}
      {props.step === 'wallet' && (
        <WalletWay
          chain={card.chain}
          address={card.address}
          message={card.message}
          action={card.verify}
          onUseHand={() => {
            props.onStep('copy');
          }}
        />
      )}
      {props.step === 'copy' && (
        <HandCopy
          message={card.message}
          tool={card.tool}
          inBrowser={card.inBrowser}
          onNext={() => {
            props.onStep('paste');
          }}
        />
      )}
      {props.step === 'paste' && <HandPaste action={card.verify} />}
    </div>
  );
}

function Summary(props: { card: OwnershipCardProps }) {
  const t = useTranslations('ClaimPage');
  const { card } = props;
  const lines = [
    card.signed && t('own_summary_signature'),
    !card.signed && card.method === 'staff' && t('own_summary_staff'),
    card.waiting && t('own_summary_waiting'),
  ].filter((line) => typeof line === 'string');

  return (
    <>
      {card.reviewNote && (
        <p role="alert" className="border border-seal p-3 text-sm">
          {t('own_declined', { note: card.reviewNote })}
        </p>
      )}
      {lines.length > 0 && <p className="text-sm font-medium">{lines.join(' ')}</p>}
    </>
  );
}

/**
 * The ownership step, as evidence the person can add in any combination: a signed message, a video and files. None replaces
 * another, and the more they add the stronger the claim. A signature is checked at once; a video and files are looked at by staff.
 * Each section opens its own form and closes when it succeeds.
 * @param props - The card props.
 * @returns The step.
 */
export function OwnershipCard(props: OwnershipCardProps) {
  const t = useTranslations('ClaimPage');
  const [open, setOpen] = React.useState<Section | null>(null);
  const [signStep, setSignStep] = React.useState<SignStep>(props.inBrowser ? 'choose' : 'copy');
  const [removing, startRemoving] = React.useTransition();
  const toggle = (section: Section) => {
    setOpen(open === section ? null : section);
  };
  // A form that succeeds closes its section; the page then shows what was added.
  const closing =
    (action: OwnershipAction): OwnershipAction =>
    async (state, data) => {
      const result = await action(state, data);

      if (result.done) {
        setOpen(null);
      }

      return result;
    };
  const hasFiles = props.files.length > 0;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-lg font-medium">{t('own_title')}</h2>
        <p className="text-sm text-ink-muted">{t('own_lead')}</p>
      </div>
      <Summary card={props} />
      <EvidenceSection
        title={t('own_sec_sign_title')}
        text={props.canVerify ? t('own_sec_sign_text') : t('own_sign_unsupported')}
        status={props.signed ? t('own_status_done') : t('own_status_none')}
        added={props.signed}
        action={props.canVerify && !props.signed ? t('own_add') : undefined}
        open={open === 'sign'}
        onToggle={() => {
          toggle('sign');
        }}
      >
        <SignForm
          card={{ ...props, verify: closing(props.verify) }}
          step={signStep}
          onStep={setSignStep}
        />
      </EvidenceSection>
      <EvidenceSection
        title={t('own_sec_video_title')}
        text={t('own_sec_video_text')}
        status={props.videoUrl ? t('own_status_added') : t('own_status_none')}
        added={props.videoUrl !== null}
        action={props.videoUrl ? t('own_change') : t('own_add')}
        open={open === 'video'}
        onToggle={() => {
          toggle('video');
        }}
        details={
          props.videoUrl && (
            <VideoItem
              url={props.videoUrl}
              onRemove={async () => await props.remove({ kind: 'video' })}
            />
          )
        }
      >
        <VideoWay action={closing(props.sendVideo)} link={props.videoUrl} />
      </EvidenceSection>
      <EvidenceSection
        title={t('own_sec_files_title')}
        text={t('own_sec_files_text')}
        status={
          hasFiles ? t('own_status_files', { count: props.files.length }) : t('own_status_none')
        }
        added={hasFiles}
        action={hasFiles ? t('own_add_more') : t('own_add')}
        open={open === 'files'}
        onToggle={() => {
          toggle('files');
        }}
        details={
          hasFiles && (
            <FileList
              claimId={props.claimId}
              files={props.files}
              onRemove={async (proofId) => await props.remove({ kind: 'file', proofId })}
            />
          )
        }
      >
        <DocumentsWay action={closing(props.sendProof)} />
      </EvidenceSection>
      <div className="grid gap-2">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <a
              href={`/api/claims/${props.claimId}/evidence`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('own_record_view')}
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={`/api/claims/${props.claimId}/evidence?download=1`}>{t('own_record_save')}</a>
          </Button>
        </div>
        <p className="text-xs text-ink-muted">{t('own_record_hint')}</p>
      </div>
      {props.waiting && (
        <div className="grid gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-self-start"
            disabled={removing}
            onClick={() => {
              startRemoving(async () => {
                await props.withdraw();
              });
            }}
          >
            {t('own_withdraw')}
          </Button>
          <p className="text-xs text-ink-muted">{t('own_withdraw_hint')}</p>
        </div>
      )}
    </div>
  );
}
