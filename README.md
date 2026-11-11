# Laboratório

Código dos oito experimentos de motion do laboratório de [ricardochiarini.com](https://ricardochiarini.com/lab).

São peças pequenas para mexer com o cursor ou o dedo: física, tipografia e pixels, escritas à mão em canvas 2D, SVG e DOM. Não há biblioteca nem etapa de build.

## Experimentos

| # | Experimento | Técnica | Arquivo |
|---|---|---|---|
| 01 | Pintura em pixels | Grade de células com tempo de vida, canvas 2D | [`src/pintura.js`](src/pintura.js) |
| 02 | Nome em partículas | Amostragem de texto em canvas fora da tela + molas | [`src/nome.js`](src/nome.js) |
| 03 | Tipografia elástica | Mola de Hooke por letra, DOM | [`src/elastica.js`](src/elastica.js) |
| 04 | Tecido | Integração de Verlet com ligações que rasgam | [`src/tecido.js`](src/tecido.js) |
| 05 | Cordas | Mola amortecida, canvas 2D | [`src/corda.js`](src/corda.js) |
| 06 | Ímã | Campo de força sobre uma grade de pontos | [`src/ima.js`](src/ima.js) |
| 07 | Embaralhar | Scramble de texto quadro a quadro, DOM | [`src/embaralha.js`](src/embaralha.js) |
| 08 | Gosma | Metaballs com filtro SVG (desfoque + limiar de alfa) | [`src/gosma.js`](src/gosma.js) |

## Como está organizado

- [`src/base.js`](src/base.js): o que os experimentos compartilham. Um canvas que acompanha o tamanho do palco e a densidade da tela, o estado do ponteiro (mouse, toque ou caneta) e a leitura das cores do tema.
- `src/<experimento>.js`: cada arquivo exporta um objeto com o nome, os parâmetros ajustáveis e uma função `cria(palco, P)`. Ela monta o experimento dentro do elemento `palco` e devolve `passo(dt)`, chamado a cada quadro, além de `reinicia`, `mudou` e `medir` quando fazem sentido.
- [`src/lab.js`](src/lab.js): monta os cartões, liga os controles aos parâmetros e roda o laço de animação.

## Decisões

- **Só roda o que está na tela.** Um `IntersectionObserver` liga e desliga o laço de cada experimento quando ele passa de 30% visível.
- **Movimento reduzido.** Com `prefers-reduced-motion`, cada experimento desenha um único quadro e para.
- **Cores do tema.** O desenho lê `--fg` e `--ac` do CSS a cada quadro, então acompanha o modo claro e o escuro sem recarregar.
- **Teclado.** Com um cartão em foco, `R` reinicia e `[` `]` ajustam o primeiro controle.

## Rodar

Os arquivos são módulos ES, então precisam ser servidos por HTTP (abrir o `index.html` direto do disco não funciona). Qualquer servidor estático serve:

```bash
npx serve .
```

## Sobre esta versão

No site, os experimentos ficam num único arquivo e dividem a página com o restante do portfólio (GSAP para a entrada dos cartões, Lenis para o scroll). Aqui cada um está em seu módulo, com os mesmos algoritmos e sem essas dependências, para facilitar a leitura.

Feito por [Ricardo Chiarini](https://ricardochiarini.com).
