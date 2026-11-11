import { tela, ponteiro, cor } from './base.js';

/* Nome em partículas: o texto é desenhado num canvas fora da tela e amostrado em grade.
   Cada pixel opaco vira uma partícula com um lugar de origem, para onde uma mola a puxa.
   O cursor espalha as partículas próximas; um toque dá um empurrão em todas. */
export default {
  nome: 'Nome em partículas',
  tec: 'Amostragem de texto + molas · canvas 2D',
  dica: 'passe para espalhar, toque para explodir',
  params: [
    ['passo', 'Densidade', 3, 9, 1, 5],
    ['forca', 'Força', 1, 12, 0.5, 5],
    ['mola', 'Mola', 0.02, 0.2, 0.01, 0.07],
  ],

  cria(palco, P) {
    const T = tela(palco);
    const m = ponteiro(palco);
    let ps = [];

    const monta = () => {
      const { W, H } = T;
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const o = off.getContext('2d');

      const txt = W < 520 ? 'RC' : 'CHIARINI';
      const fs = Math.min(H * 0.55, W / (txt.length * 0.62));
      o.font = `400 ${fs}px "Instrument Serif", Georgia, serif`;
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.fillText(txt, W / 2, H / 2);

      /* canal alfa acima de 128 = dentro da letra */
      const d = o.getImageData(0, 0, W, H).data;
      ps = [];
      for (let y = 0; y < H; y += P.passo) {
        for (let x = 0; x < W; x += P.passo) {
          if (d[(y * W + x) * 4 + 3] > 128) {
            ps.push({ hx: x, hy: y, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 });
          }
        }
      }
    };

    palco.addEventListener('pointerdown', (e) => {
      const r = palco.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ps.forEach((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * 18 * Math.random();
        p.vy += (dy / d) * 18 * Math.random();
      });
    });

    /* espera a fonte carregar: amostrar antes disso desenharia o texto com a fonte reserva */
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(monta);

    return {
      reinicia: monta,
      mudou: monta,
      medir: monta,

      passo() {
        const { g, W, H } = T;
        const fg = cor(palco, '--fg');
        const ac = cor(palco, '--ac');
        g.clearRect(0, 0, W, H);
        const R = 70;

        for (const p of ps) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            const f = (1 - d / R) * P.forca;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }

          p.vx += (p.hx - p.x) * P.mola;
          p.vy += (p.hy - p.y) * P.mola;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.x += p.vx;
          p.y += p.vy;

          const fora = Math.min(1, Math.hypot(p.x - p.hx, p.y - p.hy) / 24);
          g.fillStyle = fora > 0.2 ? ac : fg;
          const s = P.passo * 0.62;
          g.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        }
      },
    };
  },
};
