import { tela, ponteiro, cor } from './base.js';

/* Ímã: uma grade de pontos, cada um preso ao seu lugar por uma mola.
   O cursor repele os pontos dentro do raio; sem cursor, um ponto invisível passeia pelo palco. */
export default {
  nome: 'Ímã',
  tec: 'Campo de força · canvas 2D',
  dica: 'passe por cima',
  params: [
    ['forca', 'Força', 0.5, 5, 0.1, 2.2],
    ['raio', 'Raio', 60, 220, 5, 120],
  ],

  cria(palco, P) {
    const T = tela(palco);
    const m = ponteiro(palco);
    let pts = [];
    let t = 0;

    const monta = () => {
      pts = [];
      const s = T.W < 500 ? 20 : 24;
      for (let y = s / 2; y < T.H; y += s) {
        for (let x = s / 2; x < T.W; x += s) {
          pts.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
        }
      }
    };
    monta();

    return {
      reinicia: monta,
      medir: monta,

      passo(dt) {
        t += dt;
        const { g, W, H } = T;
        const fg = cor(palco, '--fg');
        const ac = cor(palco, '--ac');
        g.clearRect(0, 0, W, H);

        const ax = m.dentro ? m.x : W / 2 + Math.cos(t * 0.9) * W * 0.3;
        const ay = m.dentro ? m.y : H / 2 + Math.sin(t * 1.3) * H * 0.3;

        for (const p of pts) {
          const dx = p.x - ax;
          const dy = p.y - ay;
          const d = Math.hypot(dx, dy) || 1;

          /* repulsão: mais forte quanto mais perto do centro do campo */
          if (d < P.raio) {
            const f = (1 - d / P.raio) * P.forca;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }

          /* mola de volta para a posição de origem, com atrito */
          p.vx += (p.hx - p.x) * 0.06;
          p.vy += (p.hy - p.y) * 0.06;
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;

          /* k: quanto o ponto está fora do lugar (0 a 1); muda cor, opacidade e tamanho */
          const k = Math.min(1, Math.hypot(p.x - p.hx, p.y - p.hy) / 30);
          g.fillStyle = k > 0.15 ? ac : fg;
          g.globalAlpha = 0.35 + k * 0.65;
          g.fillRect(p.x - 1.5 - k * 2, p.y - 1.5 - k * 2, 3 + k * 4, 3 + k * 4);
        }
        g.globalAlpha = 1;
      },
    };
  },
};
