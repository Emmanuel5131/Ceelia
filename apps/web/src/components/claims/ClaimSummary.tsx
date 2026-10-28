import { paidOnChain } from '@celia/core';
import type { ChainId } from '@celia/core';
import { useFormatter, useTranslations } from 'next-intl';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { shortReference } from '@/components/claims/claim-row';
import { OperatorName } from '@/components/claims/ClaimMeta';
import { ClaimStateBadge } from '@/components/claims/ClaimStateBadge';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClaimExtrasView } from '@/libs/claims/ClaimExtras';
import type { Claim } from '@/libs/claims/Claims';
import { claimState } from '@/utils/claims/ClaimState';
import type { StoredCheck } from '@/utils/claims/Transaction';

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
      <dt className="text-ink-muted">{props.label}</dt>
      <dd className="grid min-w-0 gap-1">{props.children}</dd>
    </div>
  );
}

/**
 * A wallet address or transaction hash cut short, with a small link to check it on the chain's explorer and, for a transaction,
 * what the chain showed when it was checked.
 * @param props - The reference props.
 * @param props.chain - The chain.
 * @param props.kind - Whether the value is a transaction hash or a wallet address.
 * @param props.value - The address or hash.
 * @param props.check - What the chain showed when the claim was saved, for a transaction.
 * @returns The reference.
 */
function Reference(props: {
  chain: ChainId;
  kind: 'tx' | 'address';
  value: string;
  check?: StoredCheck | null;
}) {
  const t = useTranslations('ClaimPage');

  return (
    <>
      <span className="flex items-center gap-2">
        <span className="font-mono" title={props.value}>
          {shortReference(props.value)}
        </span>
        <ExplorerLink chain={props.chain} kind={props.kind} value={props.value} compact />
      </span>
      {props.check && (
        <Badge
          variant={props.check.status === 'found' ? 'solid' : 'dashed'}
          className="justify-self-start"
        >
          {props.check.status === 'found' ? t('chain_found') : t('chain_not_found')}
        </Badge>
      )}
    </>
  );
}

/**
 * The rows about where the money went and when: the transaction, the address it was sent to, what was sent, and the dates.
 * Each shows only when the person gave it.
 * @param props - The rows props.
 * @param props.claim - The claim.
 * @returns The rows.
 */
function PaymentRows(props: { claim: Claim }) {
  const t = useTranslations('CaseClaim');
  const format = useFormatter();
  const { claim } = props;
  const date = (value: string) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: 'medium', timeZone: 'UTC' });
  const dates = [claim.firstPaymentOn, claim.lastPaymentOn]
    .flatMap((value) => (value ? [date(value)] : []))
    .join(' – ');

  return (
    <>
      {claim.fundingTxHash && (
        <Row label={t('funding_transaction')}>
          <Reference
            chain={claim.chain}
            kind="tx"
            value={claim.fundingTxHash}
            check={claim.fundingTxCheck}
          />
        </Row>
      )}
      {claim.txHash && (
        <Row label={t('transaction')}>
          <Reference chain={claim.chain} kind="tx" value={claim.txHash} check={claim.txCheck} />
        </Row>
      )}
      {claim.destinationAddress && (
        <Row label={t('destination')}>
          <Reference chain={claim.chain} kind="address" value={claim.destinationAddress} />
        </Row>
      )}
      {claim.assetSent && <Row label={t('asset_sent')}>{claim.assetSent}</Row>}
      {dates && <Row label={t('first_payment')}>{dates}</Row>}
      {claim.amountLost && <Row label={t('amount')}>{claim.amountLost}</Row>}
    </>
  );
}

/**
 * The extra wallets and transactions on a claim, each with its own chain: the wallets that were affected, the transactions, and the
 * wallets that received the money. A list shows only when it has something in it.
 * @param props - The rows props.
 * @param props.extras - The extra wallets and transactions.
 * @returns The rows.
 */
function ExtraRows(props: { extras?: ClaimExtrasView }) {
  const t = useTranslations('ClaimPage');
  const { extras } = props;

  if (!extras) {
    return null;
  }

  const lists = [
    {
      key: 'affected',
      label: t('more_affected_title'),
      kind: 'address' as const,
      rows: extras.affected.map((row) => ({
        id: row.id,
        chain: row.chain,
        value: row.address,
        check: null,
      })),
    },
    {
      key: 'transactions',
      label: t('more_transactions_title'),
      kind: 'tx' as const,
      rows: extras.transactions.map((row) => ({
        id: row.id,
        chain: row.chain,
        value: row.hash,
        check: row.check,
      })),
    },
    {
      key: 'receiving',
      label: t('more_receiving_title'),
      kind: 'address' as const,
      rows: extras.receiving.map((row) => ({
        id: row.id,
        chain: row.chain,
        value: row.address,
        check: null,
      })),
    },
  ];

  return (
    <>
      {lists
        .filter((list) => list.rows.length > 0)
        .map((list) => (
          <Row key={list.key} label={list.label}>
            <ul className="grid gap-2">
              {list.rows.map((row) => (
                <li key={row.id} className="grid gap-1">
                  <ChainLabel chain={row.chain} />
                  <Reference
                    chain={row.chain}
                    kind={list.kind}
                    value={row.value}
                    check={row.check}
                  />
                </li>
              ))}
            </ul>
          </Row>
        ))}
    </>
  );
}

/**
 * Everything the person entered about a claim, in one box beside the steps: what happened, how it was paid, the wallet and
 * transactions with links to check them on the explorer, and who took the money. Only what was given is listed. A footer holds
 * the actions that belong to the claim, such as deleting a draft.
 * @param props - The summary props.
 * @param props.claim - The claim.
 * @param props.extras - Its extra wallets and transactions, each on its own chain.
 * @param props.footer - Actions for the claim, shown under the rows.
 * @returns The summary card.
 */
export function ClaimSummary(props: {
  claim: Claim;
  extras?: ClaimExtrasView;
  footer?: React.ReactNode;
}) {
  const t = useTranslations('ClaimPage');
  const tc = useTranslations('CaseClaim');
  const tl = useTranslations('ClaimList');
  const labels = useClaimLabels();
  const { claim } = props;
  const kinds = claim.fraudTypes.length > 0 ? claim.fraudTypes : [claim.fraudType];

  return (
    <Card variant="outline" size="sm">
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle className="font-sans text-base font-medium">{t('summary_title')}</CardTitle>
        <ClaimStateBadge state={claimState(claim)} />
      </CardHeader>
      <CardContent className="grid gap-4">
        {claim.rejectedAt && claim.rejectionNote && (
          <div className="grid gap-1 border border-seal bg-status-rejected-bg p-3 text-sm">
            <p className="font-medium text-seal">{tl('rejection_title')}</p>
            <p className="whitespace-pre-wrap">{claim.rejectionNote}</p>
          </div>
        )}
        <dl className="grid gap-3 text-sm">
          <Row label={t('summary_what')}>
            {kinds.map((type) => labels.fraudType[type]).join(', ')}
          </Row>
          <Row label={tc('paid_by')}>{labels.paymentMethod[claim.paymentMethod]}</Row>
          {paidOnChain(claim.paymentMethod) && (
            <Row label={tc('chain')}>
              <ChainLabel chain={claim.chain} />
            </Row>
          )}
          {claim.walletAddress && (
            <Row label={tc('wallet')}>
              <Reference chain={claim.chain} kind="address" value={claim.walletAddress} />
            </Row>
          )}
          <PaymentRows claim={claim} />
          <ExtraRows extras={props.extras} />
          <Row label={tc('operator')}>
            <span>
              <OperatorName name={claim.platformName} />
            </span>
            {claim.platformUrl && (
              <span className="break-all text-ink-muted">{claim.platformUrl}</span>
            )}
            {claim.operatorHandle && <span className="text-ink-muted">{claim.operatorHandle}</span>}
          </Row>
          {claim.contactChannel && (
            <Row label={tc('contact')}>{labels.contactChannel[claim.contactChannel]}</Row>
          )}
        </dl>
      </CardContent>
      {props.footer && <CardFooter className="justify-between gap-3">{props.footer}</CardFooter>}
    </Card>
  );
}
