import { site } from '../data/site';
import { services, faqs, process } from '../data/home';

const clean = (s: string) => s.replace(/\n/g, ' ');

/** llms.txt (https://llmstxt.org) — concise, factual summary for AI assistants. */
export function llmsTxt() {
  return `# ${site.name}

> ${site.description}

## Key facts
- Input: a public claim (the representation), for example "$10M volume", "2,700 new users", "no wash trading" or "decentralized liquidity"
- Output: a sealed report with an explicit proven / not proven split and a jurisdiction-specific evidence certificate. It establishes falsity and loss from the chain, evidences knowledge, and collects reliance from the victims themselves
- Method: ${process.steps.map((s, i) => `${i + 1}. ${s.title}`).join(', ')}
- Services: ${services.map((s) => s.title).join('; ')}
- Position: it does not declare fraud. The court decides intent
- Data infrastructure: ${site.infrastructure.name}
- Contact: ${site.email}

## Frequently asked questions
${faqs.map((f) => `### ${clean(f.q)}\n${f.a}`).join('\n\n')}
`;
}
