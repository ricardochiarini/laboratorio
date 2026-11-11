import { ponteiro, cor } from './base.js';

/* Gosma: círculos SVG que se seguem em fila, fundidos por um filtro.
   O desfoque mistura as bordas e a matriz de cor corta a transparência com um limiar alto,
   o que faz círculos próximos parecerem um único corpo (metaballs). */
export default {
  nome: 'Gosma',
  tec: 'Metaballs · filtro SVG',
  dica: 'mexa o cursor',
  params: [
    ['n', 'Bolhas', 3, 9, 1, 6],
    ['atraso', 'Atraso', 0.05, 0.3, 0.01, 0.2],
  ],

  cria(palco, P) {
    const ns = 'http://www.w3.org/2000/svg';
    const id = 'goo' + Math.random().toString(36).slice(2, 7);
    const svg = document.createElementNS(ns, 'svg');

    svg.innerHTML = `<defs><filter id="${id}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b"/>
      <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9"/>
    </filter></defs><g filter="url(#${id})"></g>`;
    palco.appendChild(svg);

    const g = svg.querySelector('g');
    const m = ponteiro(palco);
    let bs = [];
    let t = 0;

    const monta = () => {
      g.innerHTML = '';
      bs = Array.from({ length: P.n }, (_, i) => {
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('r', 46 - i * (30 / P.n));
        g.appendChild(c);
        return { c, x: palco.clientWidth / 2, y: palco.clientHeight / 2 };
      });
    };

    const tam = () => svg.setAttribute('viewBox', `0 0 ${palco.clientWidth} ${palco.clientHeight}`);
    tam();
    monta();

    return {
      reinicia: monta,
      mudou: monta,
      medir: tam,

      passo(dt) {
        t += dt;
        const W = palco.clientWidth;
        const H = palco.clientHeight;
        const ac = cor(palco, '--ac');
        const ac2 = cor(palco, '--fg');

        let tx = m.dentro ? m.x : W / 2 + Math.sin(t * 1.1) * W * 0.28;
        let ty = m.dentro ? m.y : H / 2 + Math.sin(t * 1.7) * H * 0.25;

        /* cada bolha persegue a anterior; as últimas da fila são mais lentas */
        bs.forEach((b, i) => {
          const k = P.atraso - i * (P.atraso / (P.n + 2));
          b.x += (tx - b.x) * k;
          b.y += (ty - b.y) * k;
          b.c.setAttribute('cx', b.x);
          b.c.setAttribute('cy', b.y);
          b.c.setAttribute('fill', i % 2 ? ac2 : ac);
          tx = b.x;
          ty = b.y;
        });
      },
    };
  },
};
