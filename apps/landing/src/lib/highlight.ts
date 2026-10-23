/** Tiny build-time highlighter (TypeScript/TSX + Python) → HTML lines with token classes. No client JS. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TS = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|\b(import|from|export|default|function|const|let|async|await|if|else|return|new|type|interface)\b|\b(\d+(?:\.\d+)?)\b|(?<=\.)(\w+)(?=\()|\b([A-Z]\w*|use\w+)\b/gm;
const PY = /(#.*$)|("""[\s\S]*?"""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(def|async|await|with|as|return|if|elif|else|for|in|import|from|class|None|True|False|and|or|not|lambda)\b|\b(\d+(?:\.\d+)?)\b|(?<=\.)(\w+)(?=\()|\b([A-Z]\w*)\b/gm;
export function highlight(src: string, language = 'TypeScript') {
  const RE = language === 'Python' ? PY : TS;
  return src.split('\n').map((line) => {
    let out = '', last = 0;
    for (const m of line.matchAll(RE)) {
      out += esc(line.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : m[5] ? 'f' : 'i';
      out += `<span class="tok-${cls}">${esc(m[0])}</span>`;
      last = (m.index ?? 0) + m[0].length;
    }
    return out + esc(line.slice(last));
  });
}
