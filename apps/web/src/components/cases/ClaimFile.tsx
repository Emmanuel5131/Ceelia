import { useFormatter, useTranslations } from 'next-intl';
import { ChainCheck } from '@/components/cases/ChainCheck';
import { ChainLabel } from '@/components/claims/ChainLabel';
import { useClaimLabels } from '@/components/claims/claim-labels';
import { ExplorerLink } from '@/components/claims/ExplorerLink';
import { Markdown } from '@/components/layout/Markdown';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { getCaseClaim } from '@/libs/CaseClaims';

type ClaimFileProps = {
  claim: NonNullable<Awaited<ReturnType<typeof getCaseClaim>>>;
  /** The person's name, or a label when we have none. */
  name: string;
};

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_1fr]">
      <dt className="text-ink-muted">{props.label}</dt>
      <dd>{props.children}</dd>
    </div>
  );
}

/**
 * The rows about where the money went and what it was: the address it was sent to, the asset, the token and when. Each shows
 * only when the person gave it.
 * @param props - The rows props.
 * @param props.claim - The claim.
 * @returns The rows.
 */
function PaymentRows(props: { claim: ClaimFileProps['claim'] }) {
  const t = useTranslations('CaseClaim');
  const { claim } = props;

  return (
    <>
      {claim.destinationAddress && (
        <Row label={t('destination')}>
          <span className="font-mono break-all">{claim.destinationAddress}</span>
          <ExplorerLink chain={claim.chain} kind="address" value={claim.destinationAddress} />
        </Row>
      )}
      {claim.assetSent && <Row label={t('asset_sent')}>{claim.assetSent}</Row>}
      {claim.tokenName && <Row label={t('token_name')}>{claim.tokenName}</Row>}
      {claim.tokenContract && (
        <Row label={t('token_contract')}>
          <span className="font-mono break-all">{claim.tokenContract}</span>
        </Row>
      )}
      {claim.firstPaymentOn && <Row label={t('first_payment')}>{claim.firstPaymentOn}</Row>}
      {claim.lastPaymentOn && <Row label={t('last_payment')}>{claim.lastPaymentOn}</Row>}
    </>
  );
}

/**
 * One claim as the lawyer handling the case reads it: who and what, the wallet or transaction in full, what the person says
 * happened, and whether they proved the wallet is theirs. The statement is what the person says; the chain does not confirm it.
 * @param props - The file props.
 * @param props.claim - The claim.
 * @param props.name - The person's name or label.
 * @returns The claim file.
 */
export function ClaimFile(props: ClaimFileProps) {
  const t = useTranslations('CaseClaim');
  const labels = useClaimLabels();
  const format = useFormatter();
  const { claim } = props;

  return (
    <div className="grid gap-8">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>{props.name}</CardTitle>
          <CardDescription>{labels.fraudType[claim.fraudType]}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            {claim.fraudDescription && (
              <Row label={t('fraud_description')}>{claim.fraudDescription}</Row>
            )}
            <Row label={t('chain')}>
              <ChainLabel chain={claim.chain} />
            </Row>
            <Row label={t('paid_by')}>{labels.paymentMethod[claim.paymentMethod]}</Row>
            {claim.accountKind && (
              <Row label={t('account_kind')}>{labels.accountKind[claim.accountKind]}</Row>
            )}
            {claim.walletApp && (
              <Row label={t('wallet_app')}>{labels.walletApp[claim.walletApp]}</Row>
            )}
            {claim.walletType && (
              <Row label={t('wallet_type')}>{labels.walletType[claim.walletType]}</Row>
            )}
            {claim.walletAddress && (
              <Row label={t('wallet')}>
                <span className="font-mono break-all">{claim.walletAddress}</span>
                <ExplorerLink chain={claim.chain} kind="address" value={claim.walletAddress} />
              </Row>
            )}
            {claim.fundingTxHash && (
              <Row label={t('funding_transaction')}>
                <span className="font-mono break-all">{claim.fundingTxHash}</span>
                <ExplorerLink chain={claim.chain} kind="tx" value={claim.fundingTxHash} />
                <ChainCheck check={claim.fundingTxCheck} expect="recipient" />
              </Row>
            )}
            {claim.txHash && (
              <Row label={t('transaction')}>
                <span className="font-mono break-all">{claim.txHash}</span>
                <ExplorerLink chain={claim.chain} kind="tx" value={claim.txHash} />
                <ChainCheck check={claim.txCheck} expect="sender" />
              </Row>
            )}
            <PaymentRows claim={claim} />
            <Row label={t('operator')}>{claim.platformName ?? t('unknown')}</Row>
            <Row label={t('amount')}>{claim.amountLost ?? t('unknown')}</Row>
            <Row label={t('country')}>{claim.country?.toUpperCase() ?? t('unknown')}</Row>
            {claim.contactChannel && (
              <Row label={t('contact')}>{labels.contactChannel[claim.contactChannel]}</Row>
            )}
            <Row label={t('ownership')}>
              {claim.ownership === 'signed' ? (
                <>
                  <Badge variant="solid">
                    {claim.ownershipMethod === 'staff'
                      ? t('ownership_staff')
                      : t('ownership_signed')}
                  </Badge>
                  {claim.reviewedAt && claim.ownershipMethod !== 'staff' && (
                    <Badge variant="solid">{t('ownership_reviewed')}</Badge>
                  )}
                </>
              ) : (
                <Badge variant="dashed">{t('ownership_unsigned')}</Badge>
              )}
            </Row>
            {claim.submittedAt && (
              <Row label={t('submitted')}>
                {format.dateTime(claim.submittedAt, { dateStyle: 'medium' })}
              </Row>
            )}
            <Row label={t('validated')}>
              {claim.validatedAt ? (
                <Badge variant="solid">
                  {format.dateTime(claim.validatedAt, { dateStyle: 'medium' })}
                </Badge>
              ) : (
                <Badge variant="dashed">{t('not_validated')}</Badge>
              )}
            </Row>
          </dl>
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-xl">{t('statement_title')}</h2>
        <p className="text-sm text-ink-muted">{t('statement_note')}</p>
        {claim.statement ? <Markdown>{claim.statement}</Markdown> : <p>{t('unknown')}</p>}
      </section>
    </div>
  );
}
