/**
 * The MCP page: Celia's research reports, readable by an AI assistant. Reports only: no victim details leave Celia. Words follow
 * the house language: the reports establish what the chain shows and declare no fraud.
 */
export const mcp = {
  eyebrow: 'MCP',
  title: 'Fraud research,\nfor your AI assistant.',
  lead: 'The Celia MCP lets an AI assistant read our research reports: what the chain shows about a platform, what is proven and what is not proven.',
  cta: { label: 'Request access', subject: 'Celia MCP access' },
  features: [
    { title: 'Research reports', text: 'Read the report on a platform: the findings, the estimated wallets affected and losses, and what each finding establishes.' },
    { title: 'Proven and not proven', text: 'Every finding is split into what the chain establishes and what it does not. The assistant quotes the split as it is written.' },
    { title: 'Evidence rules', text: 'Look up the rule that decides whether electronic evidence is accepted in a jurisdiction, with the research notes behind it.' },
    { title: 'Reports only', text: 'No victim names, wallets or statements. What victims share stays private, shared only with the lawyer or firm on the case.' },
  ],
  asksLabel: 'Questions you can ask',
  asks: [
    'What does the report say about this platform?',
    'Which findings are not proven yet?',
    'How many wallets are estimated to be affected?',
    'Which rule decides electronic evidence in New York?',
  ],
  note: 'Reports describe what the chain shows. They declare no fraud: a court decides intent. These are research notes, not legal advice.',
};
