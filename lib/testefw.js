"use strict";

class NaoImplementadoAinda extends Error {
    constructor() {
        super("Não implementado ainda.");
        Object.freeze(this);
    }
}
Object.freeze(NaoImplementadoAinda.prototype);

class PularTeste extends Error {
    constructor(motivo) {
        super(motivo);
        Object.freeze(this);
    }
}
Object.freeze(PularTeste.prototype);

const naoFizIssoAinda = function() {
    throw new NaoImplementadoAinda();
}
Object.freeze(naoFizIssoAinda.prototype);

const prepararTestes = (() => {

    // Funções utilitárias.

    class Utilitarios {

        constructor() {
            throw new Error("Não é para instanciar isto!");
        }

        static escapeHtml(unsafe) {
            if (!unsafe) return unsafe;
            return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
        }

        static htmlToElement(html) {
            const template = document.createElement("template");
            let i;
            for (i = 0; i < html.length; i++) {
                if (![" ", "\n", "\r", "\t"].includes(html.charAt(i))) break;
            }
            html = html.substring(i);
            template.innerHTML = html;
            return template.content.firstChild;
        }

        static htmlToElements(html) {
            const template = document.createElement("template");
            template.innerHTML = html;
            return template.content.childNodes;
        }

        static deepEqual(x, y) {
            if (x === y) return true;
            if (x !== x && y !== y) return true; // NaN === NaN
            if (x === null || y === null || typeof x !== "object" || typeof y !== "object") return false;
            if (Object.keys(x).length !== Object.keys(y).length) return false;

            for (let prop in x) {
                if (!y.hasOwnProperty(prop) || !Utilitarios.deepEqual(x[prop], y[prop])) return false;
            }

            return true;
        }

        static deepDiff(x, y) {
            const xStack = [];
            const yStack = [];

            function diffFindInner(x, y) {
                if (x === y) return null;
                if (x !== x && y !== y) return null; // NaN === NaN

                // Testes rasos lembrando que o === já falhou.
                if (x === null || x === undefined || y === null || y === undefined) {
                    return [
                            x === undefined ? "(undefined)" : x === null ? "(null)" : "(value)",
                            y === undefined ? "(undefined)" : y === null ? "(null)" : "(value)"
                    ];
                };
                if (typeof x !== typeof y) return [`(typeof === ${typeof x})`, `(typeof === ${typeof y})`];
                if (typeof x !== "object") return [`(value === ${x})`, `(value === ${y})`];

                const xc = x.constructor.name;
                const yc = y.constructor.name;
                if (xc !== yc) return [`(class === ${xc})`, `(class === ${yc})`];

                const xs = Object.keys(x).length;
                const ys = Object.keys(y).length;
                if (xs !== ys) return [`(length == ${xs})`, `(length == ${ys})`];

                for (let prop in x) {
                    if (!y.hasOwnProperty(prop)) return [prop, `(undefined ${prop})`];
                    let p, q;
                    for (let v = 0; v < xStack.length - 1; v++) {
                        if (xStack[v] === x) {
                            p = v;
                            break;
                        }
                    }
                    for (let v = 0; v < yStack.length - 1; v++) {
                        if (yStack[v] === y) {
                            q = v;
                            break;
                        }
                    }
                    if (p === q && p !== undefined) continue; // Evita recursão infinita.
                    if (p !== undefined || q !== undefined) return [`${p} (${prop})`, `${q} (${prop})`];
                    const dif = diffFind(x[prop], y[prop]);
                    if (dif !== null) return [`${prop}->${dif[0]}`, `${prop}->${dif[1]}`];
                }

                return null;
            }

            function diffFind(x, y) {
                try {
                    xStack.push(x);
                    yStack.push(y);
                    return diffFindInner(x, y);
                } finally {
                    xStack.pop();
                    yStack.pop();
                }
            }

            return diffFind(x, y);
        }

        static listGetters(instance) {
            return Object.entries(Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(instance)))
                    .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
                    .map(e => e[0]);
        }

        static extractGetters(instance, ordenar) {
            let getters = Utilitarios.listGetters(instance);
            if (ordenar) getters = ordenar(getters);
            const result = {};
            getters.forEach(prop => {
                try {
                    result[prop] = instance[prop];
                } catch (e) {
                    result[prop] = e;
                }
            });
            return result;
        }

        static JSONbonito(dados, keys) {
            return JSON.stringify(dados, keys, 1);
        }
    }

    // https://stackoverflow.com/a/47593316/540552 - xoshiro128ss
    class Xoshiro128ssSeedRandom {
        #a; #b; #c; #d;

        static #stdRandom = new Xoshiro128ssSeedRandom(
            Math.sqrt(2) * 2 ** 32,
            Math.sqrt(3) * 2 ** 32,
            Math.sqrt(5) * 2 ** 32,
            Math.sqrt(7) * 2 ** 32
        );

        static #realPseudorandom = new Xoshiro128ssSeedRandom(
            Math.random() * 2 ** 32,
            Math.random() * 2 ** 32,
            Math.random() * 2 ** 32,
            Math.random() * 2 ** 32
        );

        constructor(a, b, c, d) {
            this.#a = a >>> 0;
            this.#b = b >>> 0;
            this.#c = c >>> 0;
            this.#d = d >>> 0;
        }

        next() {
            let a = this.#a, b = this.#b, c = this.#c, d = this.#d;
            const t = b << 9;
            let r = a * 5;
            r = (r << 7 | r >>> 25) * 9;
            c ^= a;
            d ^= b;
            b ^= c;
            a ^= d;
            c ^= t;
            d = d << 11 | d >>> 21;
            this.#a = a;
            this.#b = b;
            this.#c = c;
            this.#d = d;
            return (r >>> 0) / 4294967296;
        }

        nextInt(min, max) {
            return min + Math.floor(this.next() * (max - min + 1));
        }

        embaralhar(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = this.nextInt(0, i);
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        sortear(array) {
            return array[this.nextInt(0, array.length - 1)];
        }

        nomeAleatorio(nomes, sobrenomes) {
            return this.sortear(nomes) + " " + this.sortear(sobrenomes);
        }

        static std() {
            return Xoshiro128ssSeedRandom.#stdRandom;
        }

        static pseudorandom() {
            return Xoshiro128ssSeedRandom.#realPseudorandom;
        }
    }

    // Classes do framework de teste.

    class Grupo {
        #sucessos = 0;
        #niy = 0;
        #pulados = 0;
        #erros = 0;
        #percorridos = 0;
        #peso;
        #minima = 0;
        #maxima = 0;
        #fracionado;
        #totalTestes;
        #testes;
        #elemento;
        #atualizarSuite;
        #atualizarAutomatico;

        constructor(nome, subtitulo, fracionado, pararNoPrimeiroErro, minima, maxima, testes, atualizarSuite) {
            this.#minima = minima;
            this.#maxima = maxima;
            const peso = this.#maxima - this.#minima;
            this.#peso = peso;
            this.#fracionado = fracionado;

            this.#testes = testes;
            this.#totalTestes = this.#testes.length;

            const subPesoTexto = this.#minima === 0
                    ? `Peso: ${peso} ponto${peso === 1 ? "" : "s"}.`
                    : `Penalidade para quem fizer isso errado: -${peso} ponto${peso === 1 ? "" : "s"}.`;
            const elementoHTML = ``
                    + `<li class="testefw-grupo testefw-futuro">`
                    + `<div class="testefw-mostrar testefw-botao">+</div>`
                    + `<div class="testefw-ocultar testefw-botao">-</div>`
                    + `<h2 class="testefw-cabecalho">${nome}: <span class="testefw-sucessos">0</span> / ${this.#testes.length}</h2>`
                    + `<h3 class="testefw-cabecalho">${subtitulo}</h3>`
                    + `<h3 class="testefw-cabecalho ${this.#minima === 0 ? "" : "testefw-perigo"}">${subPesoTexto}</h3>`
                    + `<ul></ul>`
                    + `</li>`;
            const elemento = Utilitarios.htmlToElement(elementoHTML);
            this.#elemento = elemento;
            document.querySelector("#testefw-resultados").append(elemento);

            const mostrar = elemento.querySelector(".testefw-mostrar");
            const ocultar = elemento.querySelector(".testefw-ocultar");
            const detalhes = elemento.querySelector("ul");
            const desativarAutomatico = () => this.#atualizarAutomatico = false;
            mostrar.onclick = function() {
                detalhes.classList.remove("testefw-oculto");
                mostrar.classList.add("testefw-oculto");
                ocultar.classList.remove("testefw-oculto");
                desativarAutomatico();
            };
            ocultar.onclick = function() {
                detalhes.classList.add("testefw-oculto");
                mostrar.classList.remove("testefw-oculto");
                ocultar.classList.add("testefw-oculto");
                desativarAutomatico();
            };
            ocultar.onclick();
            this.#atualizarAutomatico = true;

            this.#testes.forEach(proximoTeste => proximoTeste.agrupar(detalhes, this));
            this.#atualizarSuite = atualizarSuite;

            if (pararNoPrimeiroErro) {
                for (let i = 0; i < testes.length - 1; i++) {
                    const a = testes[i];
                    const b = testes[i + 1];
                    const x = [false];
                    a.maisPosOperacao(ok => x[0] = ok);
                    b.maisPreCondicao(() => x[0]);
                }
            }
        }

        abrir() {
            if (this.#atualizarAutomatico) {
                this.#elemento.querySelector(".testefw-mostrar").onclick();
                this.#atualizarAutomatico = true;
            } else {
                this.#elemento.scrollIntoView();
                window.scrollBy(0, 5);
            }
        }

        get sucessos() { return this.#sucessos; }
        get pulados() { return this.#pulados; }
        get niy() { return this.#niy; }
        get erros() { return this.#erros; }
        get maxima() { return this.#maxima; }
        get totalTestes() { return this.#totalTestes; }

        get nota() {
            if (!this.#fracionado && this.#sucessos !== this.#percorridos) return this.#minima;
            const ganho = this.#maxima * this.#sucessos / this.#totalTestes;
            const perda = this.#minima * (this.#percorridos - this.#sucessos) / this.#totalTestes;
            return ganho + perda;
        }

        atualizar(tipo) {
            if (tipo !== "executando") this.#percorridos++;
            if (tipo === "ok") this.#sucessos++;
            if (tipo === "niy") this.#niy++;
            if (tipo === "skip") this.#pulados++;
            if (tipo === "erro") this.#erros++;

            const foiTudo = this.#percorridos === this.#totalTestes;
            const tipoItem =
                      this.#sucessos === this.#percorridos ? (foiTudo ? "testefw-ok"      : "testefw-executando-ok"     )
                    : this.#pulados  === this.#percorridos ? (foiTudo ? "testefw-skip"    : "testefw-executando-skip"   )
                    : this.#niy      === this.#percorridos ? (foiTudo ? "testefw-niy"     : "testefw-executando-niy"    )
                    : this.#sucessos >   0                 ? (foiTudo ? "testefw-parcial" : "testefw-executando-parcial")
                    : this.#erros    >   0                 ? (foiTudo ? "testefw-erro"    : "testefw-executando-erro"   )
                    :                                        (foiTudo ? "testefw-niy"     : "testefw-executando-niy"    );

            if (this.#atualizarAutomatico) {
                const deveEsconder = tipo !== "executando" && (this.#sucessos === this.#totalTestes || this.#niy + this.#pulados === this.#totalTestes);
                this.#elemento.querySelector(deveEsconder ? ".testefw-ocultar" : ".testefw-mostrar").onclick();
                this.#atualizarAutomatico = true;
            }
            this.#elemento.querySelector(".testefw-sucessos").innerHTML = this.#sucessos;
            this.#elemento.classList.remove(
                "testefw-ok", "testefw-parcial", "testefw-erro", "testefw-skip", "testefw-niy", "testefw-futuro",
                "testefw-executando-ok", "testefw-executando-parcial", "testefw-executando-erro", "testefw-executando-skip", "testefw-executando-niy"
            );
            this.#elemento.classList.add(tipoItem);

            this.#atualizarSuite();
        }

        adicionarTestes(onde) {
            this.#testes.forEach(teste => onde.push(teste));
        }
    }

    class Teste {
        #execucao;
        #testeDoResultado;
        #preCondicao;
        #posOperacao;
        #elemento;
        #grupo;

        constructor(regra, execucao, testeDoResultado, preCondicao, posOperacao) {
            const tamanhoPrefixo = "() => ".length;
            const codigo = execucao.toString().substring(tamanhoPrefixo);
            const escapeRegra = Utilitarios.escapeHtml(regra);
            const escapeCodigo = Utilitarios.escapeHtml(codigo);
            const elementoHTML = ""
                    + `<li class="testefw-exercicio testefw-futuro">`
                    + `<div class="testefw-regra">Regra: <span>${escapeRegra}</span></div>`
                    + `<div class="testefw-codigo">Código: <span>${escapeCodigo}</span></div>`
                    + `<div class="resultado-esperado">${testeDoResultado.esperado}</div>`
                    + `<div class="resultado-obtido">Aguardando a execução.</div>`
                    + `</li>`;
            const elemento = Utilitarios.htmlToElement(elementoHTML);

            this.#execucao = execucao;
            this.#testeDoResultado = testeDoResultado;
            this.#preCondicao = preCondicao;
            this.#posOperacao = posOperacao;
            this.#elemento = elemento;
            this.#grupo = null;
        }

        #atualizarHtml(tipo, esperado, obtido, scroll) {
            this.#elemento.classList.remove("testefw-ok", "testefw-niy", "testefw-erro", "testefw-skip", "testefw-executando", "testefw-futuro");
            this.#elemento.classList.add(`testefw-${tipo}`);
            if (esperado !== undefined) this.#elemento.querySelector(".resultado-esperado").innerHTML = esperado;
            this.#elemento.querySelector(".resultado-obtido").innerHTML = obtido;
            if (scroll && document.querySelector("#testefw-seguir").checked) {
                this.#grupo.abrir();
                this.#elemento.scrollIntoView();
                const escondido = this.#elemento.getBoundingClientRect().top - document.querySelector("#testefw-nota").offsetHeight - this.#elemento.offsetHeight - 10;
                if (escondido < 0) window.scrollBy(0, escondido);
            }
            return tipo;
        }

        async executar(scroll) {
            if (this.#preCondicao && !this.#preCondicao()) {
                return this.#atualizarHtml(
                        "skip",
                        undefined,
                        `Resultado obtido: <span class="testefw-skip">O teste não pôde ser executado por causa de erros detectados em testes anteriores.</span>`,
                        scroll
                );
            }
            let ok = false;
            this.#atualizarHtml("executando", undefined, `<div class="resultado-obtido">Executando...</div>`, scroll);
            try {
                let resultado = this.#execucao.constructor.name === "AsyncFunction" ? await this.#execucao() : this.#execucao();
                this.#testeDoResultado.testar(resultado);
                ok = true;
                return this.#atualizarHtml("ok", undefined, `Resultado obtido: <span class="testefw-funcionou">Funcionou como esperado.</span>`, scroll);
            } catch (e) {
                if (e instanceof PularTeste) {
                    return this.#atualizarHtml("skip", undefined, e.message, scroll);
                }
                if (e instanceof NaoImplementadoAinda) {
                    return this.#atualizarHtml("niy", undefined, `Resultado obtido: <span class="testefw-naoimplementado">Não implementado ainda.</span>`, scroll);
                }
                if (e instanceof ErroFormatado) {
                    return this.#atualizarHtml("erro", e.esperado, e.obtido, scroll);
                }
                console.log(e);
                const msg = ``
                        + `Resultado obtido: Um erro inesperado - `
                        + `<span class="testefw-inesperado">[${e.constructor.name}] ${Utilitarios.escapeHtml(e.message)}</span>`;
                return this.#atualizarHtml("erro", undefined, msg, scroll);
            } finally {
                if (this.#posOperacao) this.#posOperacao(ok);
            }
        }

        agrupar(onde, grupo) {
            onde.append(this.#elemento);
            this.#grupo = grupo;
        }

        preTeste(scroll) {
            this.#atualizarHtml("executando", undefined, `<div class="resultado-obtido">Próximo a executar...</div>`, scroll);
            this.#grupo.atualizar("executando");
        }

        async testar(scroll) {
            this.#grupo.atualizar(await this.executar(scroll));
        }

        maisPreCondicao(novaCondicao) {
            if (!this.#preCondicao) {
                this.#preCondicao = novaCondicao;
            } else {
                const antigaCondicao = this.#preCondicao;
                this.#preCondicao = () => antigaCondicao() && novaCondicao();
            }
        }

        maisPosOperacao(novaOperacao) {
            if (!this.#posOperacao) {
                this.#posOperacao = novaOperacao;
            } else {
                const antigaOperacao = this.#posOperacao;
                this.#posOperacao = ok => {
                    antigaOperacao(ok);
                    novaOperacao(ok);
                };
            }
        }
    }

    function igual(valorEsperado) {
        const v1 = typeof valorEsperado === "string" ? `"${valorEsperado}"` : Utilitarios.escapeHtml("" + valorEsperado);
        return {
            testar: valorObtido => {
                const diff = Utilitarios.deepDiff(valorEsperado, valorObtido);
                if (diff === null) return;
                throw new ErroFormatado(valorEsperado, valorObtido, diff);
            },
            esperado: `Resultado esperado: ${v1}.`
        };
    }

    function bonitoIgual(valorEsperado) {
        const novoIgual = igual(Utilitarios.JSONbonito(valorEsperado));
        const testarVelho = novoIgual.testar;
        novoIgual.testar = valorObtido => testarVelho(Utilitarios.JSONbonito(valorObtido));
        return novoIgual;
    }

    function naoDeuErro() {
        return {
            testar: resultado => {},
            esperado: `Resultado esperado: Apenas executar corretamente e não lançar nenhum erro.`
        };
    }

    function erroGravissimo(texto) {
        let zoado = document.querySelector(".testefw-gravissimo");
        if (!zoado) {
            zoado = document.createElement("div");
            zoado.classList.add("testefw-gravissimo");
            document.body.prepend(zoado);
        }
        zoado.innerHTML = texto;
    }

    const painelHTML = ""
            + '<div id="testefw-run">'
            + '    <div id="testefw-nota">'
            + '        <ul id="testefw-alunos"></ul>'
            + '        <div>'
            + '            <h1>Nota: <span id="testefw-valor">0</span> / <span id="testefw-valormax">0</span></h1>'
            + '            <div id="testefw-div-seguir">'
            + '                 <input type="checkbox" checked="checked" id="testefw-seguir" />'
            + '                 <label for="testefw-seguir">Acompanhar os testes</label>'
            + '            </div>'
            + '        </div>'
            + '        <div>'
            + '            <h2>Sucessos: <span id="testefw-contasucessos">0 / 0</span></h2>'
            + '            <h2>Erros: <span id="testefw-contaerros">0 / 0</span></h2>'
            + '            <h2>Pulados: <span id="testefw-contapulos">0 / 0</span></h2>'
            + '            <h2>Não implementados: <span id="testefw-contaniy">0 / 0</span></h2>'
            + '            <h2>Aguardando: <span id="testefw-contaespera">0 / 0</span></h2>'
            + '        </div>'
            + '    </div>'
            + '    <ul id="testefw-resultados"></ul>'
            + '</div>';

    class Suite {
        #grupos;
        #preparacao;

        constructor(inicializacao, preparacao) {
            this.#grupos = [];
            this.#preparacao = preparacao;
            this.#criarFormExecutarTestes();
            inicializacao(new CallbacksInicializacao());
        }

        #criarFormExecutarTestes() {
            const antigo = document.querySelector("#testefw-form-executar");
            const delayAntigo = antigo ? document.querySelector("#testefw-delay").value : "-1";
            if (antigo) antigo.remove();
            const conteudoForm = ""
                    + '<div id="testefw-form-executar">'
                    + '    <p>'
                    + '        <label for="delay">Delay dos testes:</label>'
                    + `        <input type="text" id="testefw-delay" value="${delayAntigo}">`
                    + '    </p>'
                    + '    <p>'
                    + '        <label for="testefw-botao-executar">&nbsp;</label>'
                    + '        <button type="button" id="testefw-botao-executar">EXECUTAR OS TESTES!</button>'
                    + '    </p>'
                    + '    <p>'
                    + '        <label>O delay entre um teste e outro está em milissegundos.</label>'
                    + '        <label>Coloque -1 para testar tudo de uma vez sem delay.</label>'
                    + '    </p>'
                    + '</div>';

            document.body.innerHTML = conteudoForm + document.body.innerHTML;
            document.querySelector("#testefw-botao-executar").onclick = () => this.#executarTestes();
        }

        #executarTestes() {
            // https://stackoverflow.com/a/39914235/540552
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            // 1. Lê o valor do delay. Dá um alert e sai se o valor digitado não for um número inteiro.
            const cfg = { erro: "O delay deve ser um número inteiro.", casas: 0 };
            let delay;
            try {
                delay = lerNumero(document.querySelector("#testefw-delay").value, cfg);
            } catch (e) {
                alert(e.message);
                return;
            }
            const comDelay = delay >= 0;

            // 2. Desabilita o botão de executar para evitar que seja clicado duas vezes.
            document.querySelector("#testefw-botao-executar").disabled = true;
            document.querySelector("#testefw-delay").disabled = true;
            document.querySelector("#testefw-delay").readonly = true;

            // 3. Remove o painel com o resultado das notas antigo, caso haja algum.
            const jaTemR = document.querySelector("#testefw-run");
            if (jaTemR) jaTemR.remove();
            
            // 4. Cria o painel com o resultado das notas.
            document.body.innerHTML += painelHTML;
            if (!comDelay) document.querySelector("#testefw-div-seguir").style.display = "none";

            // 5. Remove quaisquer erros gravíssimos que tenham aparecido (se houver algum decerto os erros os
            //    farão reaparecer, exceto se eles tiverem surgido a partir de algo feito no console do navegador.
            document.querySelectorAll(".testefw-gravissimo").forEach(e => e.remove());

            // 6. Chama a função responsável por criar os grupos de testes e os testes, mas sem executá-los ainda.
            this.#grupos = [];
            const atualizar = () => this.#atualizar();
            const adicionouGrupo = g => this.#grupos.push(g);
            this.#preparacao(new CallbacksConfiguracao(adicionouGrupo, atualizar));

            // 7. Coleta todos os testes em um só array.
            const passos = [];
            this.#grupos.forEach(grupo => grupo.adicionarTestes(passos));

            (async () => {
                // 8. Correção de um bug obscuro.
                document.querySelector("#testefw-delay").value = "" + delay;
                document.querySelector("#testefw-botao-executar").onclick = () => this.#executarTestes();

                // 9. Roda todos os testes.
                for (let i = 0; i < passos.length; i++) {
                    const proximoTeste = passos[i];
                    proximoTeste.preTeste(comDelay);
                    if (comDelay) await sleep(delay);
                    await proximoTeste.testar(comDelay);
                }

                // 10. Reativa o botão de executar.
                document.querySelector("#testefw-botao-executar").disabled = false;
                document.querySelector("#testefw-delay").disabled = false;
                document.querySelector("#testefw-delay").readonly = false;

                // 11. Oculta a opção de seguir os testes, vez que já acabaram.
                document.querySelector("#testefw-div-seguir").style.display = "none";

                // 12. Mostra o resultado, caso não estivesse sendo acompanhado diretamente.
                if (!comDelay) document.querySelector("#testefw-run").scrollIntoView();
            })();
        }

        #atualizar() {
            let nota = 0, valormax = 0, totalSucessos = 0, totalErros = 0, totalPulos = 0, totalNiy = 0, totalTestes = 0, penalidades = 0;
            for (let idx in this.#grupos) {
                const grupo = this.#grupos[idx];
                const gn = grupo.nota;
                if (gn < 0) {
                    penalidades -= gn;
                } else {
                    nota += gn;
                }
                totalTestes += grupo.totalTestes;
                totalSucessos += grupo.sucessos;
                totalErros += grupo.erros;
                totalPulos += grupo.pulados;
                totalNiy += grupo.niy;
                valormax += grupo.maxima;
            }
            function arredondar(num, casas) {
                return Math.round(num * 10 ** casas) / 10 ** casas;
            }
            nota = arredondar(nota, 2);
            if (penalidades > 0) {
                const notaPenalizada = arredondar(nota - penalidades, 2);
                penalidades = arredondar(penalidades, 2);
                document.querySelector("#testefw-valor").innerHTML = `${nota} - ${penalidades} = ${notaPenalizada}` + (notaPenalizada < 0 ? " (0)" : "");
            } else {
                document.querySelector("#testefw-valor").innerHTML = "" + nota;
            }
            const totalEspera = totalTestes - totalSucessos - totalErros - totalPulos - totalNiy;
            document.querySelector("#testefw-valormax"     ).innerHTML = "" + (valormax < 0 ? 0 : arredondar(valormax, 2));
            document.querySelector("#testefw-contasucessos").innerHTML = totalSucessos + " / " + totalTestes;
            document.querySelector("#testefw-contaerros"   ).innerHTML = totalErros    + " / " + totalTestes;
            document.querySelector("#testefw-contapulos"   ).innerHTML = totalPulos    + " / " + totalTestes;
            document.querySelector("#testefw-contaniy"     ).innerHTML = totalNiy      + " / " + totalTestes;
            document.querySelector("#testefw-contaespera"  ).innerHTML = totalEspera   + " / " + totalTestes;
            const divNota = document.querySelector("#testefw-nota");
            if (divNota) divNota.style.display = "block";
        }
    }

    class GrupoBuilder {
        #adicionouGrupo;
        #atualizarSuite;
        #nome;
        #subtitulo;
        #minimo = 0;
        #maximo = 0;
        #fracionado = true;
        #pararNoPrimeiroErro = false;
        #queimado = false;

        constructor(adicionouGrupo, atualizarSuite, nome, subtitulo) {
            this.#adicionouGrupo = adicionouGrupo;
            this.#atualizarSuite = atualizarSuite;
            this.#nome = nome;
            this.#subtitulo = subtitulo;
        }

        get fracionado() {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#fracionado = true;
            return this;
        }

        get naoFracionado() {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#fracionado = false;
            return this;
        }

        get pararNoPrimeiroErro() {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#pararNoPrimeiroErro = true;
            return this;
        }

        get naoPararNoPrimeiroErro() {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#pararNoPrimeiroErro = false;
            return this;
        }

        minimo(valor) {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#minimo = valor;
            return this;
        }

        maximo(valor) {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            this.#maximo = valor;
            return this;
        }

        testes(arrayTestes) {
            if (this.#queimado) throw new Error("O Builder já foi fechado.");
            const g = new Grupo(this.#nome, this.#subtitulo, this.#fracionado, this.#pararNoPrimeiroErro, this.#minimo, this.#maximo, arrayTestes, this.#atualizarSuite);
            this.#adicionouGrupo(g);
            this.#queimado = true;
            return g;
        }
    }

    function determinarTipoInterno(elemento) {
        if (elemento === null) return "null";
        if (typeof elemento !== "object") return typeof elemento;
        return elemento.constructor.name;
    }

    class Pagina {
        #url;
        #src;

        constructor(url) {
            this.#url = url;
            this.#src = undefined;
        }

        async testarGet() {
            try {
                this.#src = await Pagina.download(this.#url);
            } catch (e1) {
                const m1 = e1 instanceof Error ? `[${determinarTipoInterno(e1)}] ${e1.message}` : "" + e1;
                throw new PularTeste(``
                        + `Resultado obtido:`
                        + `<span class="testefw-destaque testefw-bloco">`
                        + `Não foi possível obter o código-fonte de ${this.#url}.<br>`
                        + `Erro: ${m1}<br>`
                        + `</span>`
                );
            }
        }

        async testarPost(dados, cabecalhos) {
            try {
                this.#src = await Pagina.post(this.#url, dados, cabecalhos);
            } catch (e1) {
                const m1 = e1 instanceof Error ? `[${determinarTipoInterno(e1)}] ${e1.message}` : "" + e1;
                throw new PularTeste(``
                        + `Resultado obtido:`
                        + `<span class="testefw-destaque testefw-bloco">`
                        + `Não foi possível obter o código-fonte de ${this.#url}.<br>`
                        + `Erro: ${m1}<br>`
                        + `</span>`
                );
            }
        }

        get downloadOk() {
            return this.#src !== undefined;
        }

        get src() {
            return this.#src;
        }

        async validar() {
            if (!this.downloadOk) throw new Error("Não baixou ainda");
            try {
               return await Pagina.validarHTML(this.#src);
            } catch (e) {
                if (e instanceof PularTeste) throw e;
                const m = e instanceof Error ? `[${determinarTipoInterno(e)}] ${e.message}` : "" + e;
                throw new PularTeste(`Não foi possível chamar o site de validação da página: ${m}`);
            }
        }

        static validarHTML(htmlString) {
            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();

                function veio() {
                    console.log(req);
                    resolve(req.responseText);
                }

                function abortado() {
                    console.log(req);
                    reject(new PularTeste("A requisição ao validador foi cancelada."));
                }

                function deuPau() {
                    console.log(req);
                    if (req.status === 0) {
                        reject(new PularTeste("Não foi possível realizar a requisição ao validador. Talvez você não esteja conectado à internet?"));
                    } else {
                        reject(new PularTeste(`O validador devolveu uma resposta ${req.status} com o seguinte conteúdo: ${req.responseText}.`));
                    }
                }

                req.addEventListener("load", veio);
                req.addEventListener("error", deuPau);
                req.addEventListener("abort", abortado);
                req.open("POST", "https://validator.w3.org/nu/");
                req.setRequestHeader("Content-Type", "text/html");
                req.send(htmlString);
            });
        }

        static async download(url) {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fetch(url).then(response => response.text()));
                } catch (e1) {
                    reject(e1); 
                }
            });
        }

        static async post(url, dados, cabecalhos) {
            const cfg = {
                method: "POST",
                body: dados
            };
            if (cabecalhos !== undefined) cfg.headers = cabecalhos;
            return new Promise((resolve, reject) => {
                try {
                    resolve(fetch(url, cfg).then(response => response.text()));
                } catch (e1) {
                    reject(e1); 
                }
            });
        }

        static validouHTML() {
            const sucesso = '<p class="success">The document validates according to the specified schema(s).</p>';
            return {
                testar: valorObtido => {
                    if (!valorObtido.includes(sucesso)) {
                        throw new ErroFormatado(Utilitarios.escapeHtml(sucesso), valorObtido, ["", ""]);
                    }
                },
                esperado: `Resultado esperado: ${Utilitarios.escapeHtml(sucesso)}.`
            };
        }
    }

    class CallbacksInicializacao {
        get erroGravissimo() {
            return erroGravissimo;
        }

        get Utilitarios() {
            return Utilitarios;
        }

        get Pagina() {
            return Pagina;
        }

        get ErroFormatado() {
            return ErroFormatado;
        }

        get Xoshiro128ssSeedRandom() {
            return Xoshiro128ssSeedRandom;
        }
    }

    class CallbacksConfiguracao extends CallbacksInicializacao {
        #adicionouGrupo;
        #atualizarSuite;

        constructor(adicionouGrupo, atualizarSuite) {
            super();
            this.#adicionouGrupo = adicionouGrupo;
            this.#atualizarSuite = atualizarSuite;
        }

        get teste() {
            return function(regra, execucao, testeDoResultado, preCondicao, posOperacao) {
                return new Teste(regra, execucao, testeDoResultado, preCondicao, posOperacao);
            };
        }

        get grupo() {
            const adicionouGrupo = this.#adicionouGrupo;
            const atualizarSuite = this.#atualizarSuite;
            return function(nome, subtitulo) {
                return new GrupoBuilder(adicionouGrupo, atualizarSuite, nome, subtitulo);
            }
        }

        get igual() {
            return igual;
        }

        get bonitoIgual() {
            return bonitoIgual;
        }

        get naoDeuErro() {
            return naoDeuErro;
        }
    }

    class ErroFormatado extends Error {
        #esperado;
        #obtido;

        constructor(valorEsperado, valorObtido, diff) {
            const v1 = typeof valorEsperado === "string" ? `"${valorEsperado}"` : Utilitarios.escapeHtml("" + valorEsperado);
            const t1 = determinarTipoInterno(valorEsperado);
            const v2 = typeof valorObtido === "string" ? `"${valorObtido}"` : Utilitarios.escapeHtml("" + valorObtido);
            const t2 = determinarTipoInterno(valorObtido);
            let esperado, obtido;
            if (t1 === t2 && v1 === v2) {
                esperado = `Resultado esperado: [${t1}] ${v1}.`;
                obtido = `Resultado obtido: [${t2}] ${v2}. `
                        + `Entretanto, ainda assim a comparação de igualdade entre o obtido e o esperado resultou em false. `
                        + `As diferenças são <span class="testefw-destaque">${diff[0]}</span> e <span class="testefw-destaque">${diff[1]}</span>.`
            } else if (t1 === t2) {
                esperado = `Resultado esperado: <span class="testefw-destaque">${v1}</span>.`;
                obtido = `Resultado obtido: <span class="testefw-destaque">${v2}</span>.`;
            } else if (v1 === v2) {
                esperado = `Resultado esperado: <span class="testefw-destaque">[${t1}]</span> ${v1}.`;
                obtido = `Resultado obtido: <span class="testefw-destaque">[${t2}]</span> ${v2}.`;
            } else {
                esperado = `Resultado esperado: <span class="testefw-destaque">[${t1}]</span> <span class="testefw-destaque">${v1}</span>.`;
                obtido = `Resultado obtido: <span class="testefw-destaque">[${t2}]</span> <span class="testefw-destaque">${v2}</span>.`;
            }
            super(esperado + " " + obtido);
            this.#esperado = esperado;
            this.#obtido = obtido;
        }

        get esperado() { return this.#esperado; }
        get obtido() { return this.#obtido; }
    }

    return (inicializador, configurador) => new Suite(inicializador, configurador);
})();