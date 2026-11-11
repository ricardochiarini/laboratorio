import { tela, ponteiro, cor } from './base.js';

/* Pintura em pixels: o palco é uma grade de células.
   Pintar uma célula dá a ela vida = 1; a vida cai com o tempo e a célula encolhe até sumir. */
export default {
  nome: 'Pintura em pixels',
  tec: 'Grade de células · canvas 2D',
  dica: 'arraste para pintar',
  params: [
    ['lado', 'Pixel', 8, 40, 2, 18],
    ['vida', 'Duração (s)', 0.5, 6, 0.1, 2.4],
    ['pincel', 'Pincel', 0, 3, 1, 1],
  ],

  cria(palco, P) {
    const T = tela(palco);
    const m = ponteiro(palco);
    let cols, rows, vida, tom;
    let t = 0;
    let wx = 0;
    let wy = 0;

    const monta = () => {
      cols = Math.ceil(T.W / P.lado);
      rows = Math.ceil(T.H / P.lado);
      vida = new Float32Array(cols * rows);
      tom = new Uint8Array(cols * rows);
    };
    monta();

    /* pinta um losango de células em volta do ponto (x, y) */
    const pinta = (x, y) => {
      const c = Math.floor(x / P.lado);
      const r = Math.floor(y / P.lado);
      for (let a = -P.pincel; a <= P.pincel; a++) {
        for (let b = -P.pincel; b <= P.pincel; b++) {
          const cc = c + a;
          const rr = r + b;
          if (cc < 0 || rr < 0 || cc >= cols || rr >= rows) continue;
          if (Math.abs(a) + Math.abs(b) > P.pincel + 0.5) continue;
          const i = rr * cols + cc;
          vida[i] = 1;
          tom[i] = (cc + rr) % 7 === 0 ? 1 : 0;
        }
      }
    };

    return {
      reinicia: monta,
      mudou: monta,
      medir: monta,

      passo(dt) {
        t += dt;
        const { g, W, H } = T;
        const fg = cor(palco, '--fg');
        const ac = cor(palco, '--ac');

        if (m.dentro && (m.baixo || matchMedia('(hover: hover)').matches)) {
          /* interpola entre a posição anterior e a atual para o traço não falhar em movimentos rápidos */
          const n = Math.ceil(Math.hypot(m.x - m.px, m.y - m.py) / (P.lado / 2)) || 1;
          for (let k = 0; k <= n; k++) {
            pinta(m.px + (m.x - m.px) * (k / n), m.py + (m.y - m.py) * (k / n));
          }
          m.px = m.x;
          m.py = m.y;
        } else if (!m.dentro) {
          /* sem cursor, um pincel automático desenha uma curva de Lissajous */
          wx = W / 2 + Math.sin(t * 0.7) * W * 0.35;
          wy = H / 2 + Math.sin(t * 1.3) * H * 0.3;
          pinta(wx, wy);
        }

        g.clearRect(0, 0, W, H);
        for (let i = 0; i < vida.length; i++) {
          if (vida[i] <= 0) continue;
          vida[i] -= dt / P.vida;
          if (vida[i] <= 0) continue;

          const s = P.lado * Math.min(1, vida[i] * 3);
          const o = (P.lado - s) / 2;
          g.fillStyle = tom[i] ? ac : fg;
          g.fillRect((i % cols) * P.lado + o, Math.floor(i / cols) * P.lado + o, s, s);
        }
      },
    };
  },
};
