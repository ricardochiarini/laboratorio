/* Embaralhar: troca uma palavra por outra passando por símbolos aleatórios.
   Cada letra tem um quadro de início (a) e de fim (b); entre os dois ela mostra um símbolo. */
export default {
  nome: 'Embaralhar',
  tec: 'Scramble de texto · DOM',
  dica: 'passe ou toque',
  params: [['vel', 'Velocidade', 0.5, 3, 0.1, 1]],

  cria(palco, P) {
    const el = document.createElement('div');
    el.className = 'emb';
    palco.appendChild(el);

    const palavras = ['Motion', 'Código', 'Ritmo', 'Pixel', 'Blocos'];
    const sim = '!<>-_\\/[]{}—=+*^?#01';
    let i = 0;
    let fila = [];
    let q = 0;
    let ult = performance.now();

    const troca = () => {
      const de = el.textContent;
      const para = palavras[(i = (i + 1) % palavras.length)];
      fila = [];
      for (let k = 0; k < Math.max(de.length, para.length); k++) {
        const a = Math.floor(Math.random() * 14);
        const b = a + 8 + Math.floor(Math.random() * 18);
        fila.push({ de: de[k] || '', para: para[k] || '', a, b, c: '' });
      }
      q = 0;
    };

    el.textContent = palavras[0];
    palco.addEventListener('pointerenter', troca);
    palco.addEventListener('pointerdown', troca);

    return {
      reinicia: () => {
        i = 0;
        el.textContent = palavras[0];
        fila = [];
      },

      passo() {
        /* sem interação, troca sozinho a cada 2,6 s */
        if (performance.now() - ult > 2600) {
          ult = performance.now();
          troca();
        }
        if (!fila.length) return;

        let out = '';
        let fim = 0;
        for (const f of fila) {
          if (q >= f.b) {
            fim++;
            out += f.para;
          } else if (q >= f.a) {
            if (!f.c || Math.random() < 0.3) f.c = sim[Math.floor(Math.random() * sim.length)];
            out += `<span>${f.c}</span>`;
          } else {
            out += f.de;
          }
        }

        el.innerHTML = out;
        q += P.vel;
        if (fim === fila.length) fila = [];
      },
    };
  },
};
