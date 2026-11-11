/* Peças comuns aos experimentos: canvas que acompanha o tamanho do palco,
   ponteiro (mouse, toque ou caneta) e leitura de cores do tema. */

export const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

const DPR = Math.min(2, devicePixelRatio || 1);

/* Lê uma variável CSS (--fg, --ac) do elemento, para o desenho seguir o tema claro ou escuro. */
export const cor = (el, v) => getComputedStyle(el).getPropertyValue(v).trim();

/* Cria um canvas 2D dentro do palco e o mantém nítido em telas de alta densidade. */
export function tela(palco) {
  const cv = document.createElement('canvas');
  palco.appendChild(cv);
  const g = cv.getContext('2d');
  const o = { cv, g, W: 0, H: 0 };

  o.medir = () => {
    o.W = palco.clientWidth;
    o.H = palco.clientHeight;
    cv.width = o.W * DPR;
    cv.height = o.H * DPR;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  o.medir();
  new ResizeObserver(() => o.medir()).observe(palco);
  return o;
}

/* Posição atual (x, y) e anterior (px, py) do ponteiro, relativas ao palco.
   Fora do palco as coordenadas vão para longe, para nenhum cálculo de distância reagir. */
export function ponteiro(palco) {
  const m = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, dentro: false, baixo: false };

  const pos = (e) => {
    const r = palco.getBoundingClientRect();
    m.px = m.x;
    m.py = m.y;
    m.x = e.clientX - r.left;
    m.y = e.clientY - r.top;
  };

  palco.addEventListener('pointermove', (e) => {
    pos(e);
    m.dentro = true;
  });
  palco.addEventListener('pointerdown', (e) => {
    pos(e);
    m.px = m.x;
    m.py = m.y;
    m.baixo = true;
    m.dentro = true;
    try {
      palco.setPointerCapture(e.pointerId);
    } catch (er) {}
  });
  palco.addEventListener('pointerup', () => (m.baixo = false));
  palco.addEventListener('pointercancel', () => (m.baixo = false));
  palco.addEventListener('pointerleave', () => {
    m.dentro = false;
    m.baixo = false;
    m.x = m.y = -1e4;
  });

  return m;
}
