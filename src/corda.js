import { tela, ponteiro, cor } from './base.js';

/* Cordas: cada linha é uma mola amortecida.
   O cursor prende a corda ao cruzá-la; ao se afastar, ela solta e oscila até parar. */
export default {
  nome: 'Cordas',
  tec: 'Mola amortecida · canvas 2D',
  dica: 'puxe as linhas',
  params: [
    ['n', 'Cordas', 3, 10, 1, 6],
    ['tensao', 'Tensão', 0.02, 0.2, 0.01, 0.08],
  ],

  cria(palco, P) {
    const T = tela(palco);
    const m = ponteiro(palco);
    let cs = [];

    const monta = () => {
      cs = Array.from({ length: P.n }, () => ({ off: 0, v: 0, cx: 0, preso: false }));
    };
    monta();

    return {
      reinicia: monta,
      mudou: monta,

      passo() {
        const { g, W, H } = T;
        const fg = cor(palco, '--fg');
        const ac = cor(palco, '--ac');
        g.clearRect(0, 0, W, H);

        cs.forEach((c, i) => {
          const yb = H * (0.18 + (0.64 * i) / Math.max(1, cs.length - 1));

          if (m.dentro) {
            /* prende quando o cursor cruza a linha de repouso entre dois quadros */
            const cruzou = (m.py - yb) * (m.y - yb) <= 0;
            if (!c.preso && (cruzou || Math.abs(m.y - yb) < 6)) c.preso = true;
            if (c.preso && Math.abs(m.y - yb) > 70) c.preso = false;
          } else {
            c.preso = false;
          }

          if (c.preso) {
            c.off = (m.y - yb) * 2;
            c.cx = m.x;
            c.v = 0;
          } else {
            /* mola: aceleração proporcional ao deslocamento, com atrito */
            c.v += -P.tensao * c.off;
            c.v *= 0.9;
            c.off += c.v;
          }

          g.strokeStyle = Math.abs(c.off) > 2 ? ac : fg;
          g.lineWidth = i % 2 ? 1.5 : 2.5;
          g.beginPath();
          g.moveTo(0, yb);
          g.quadraticCurveTo(c.cx || W / 2, yb + c.off, W, yb);
          g.stroke();
        });
      },
    };
  },
};
