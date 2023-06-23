"use strict";

prepararTestes(funcs => {
    const erroGravissimo = funcs.erroGravissimo;
    window.onerror = (ev, arquivo, linha, coluna, erro) => {
        erroGravissimo(""
                + "<h1>SE VOCÊ ESTÁ VENDO ISSO, É PORQUE O SEU JAVASCRIPT CONTÉM ERROS SINTÁTICOS.</h1>"
                + "<p>Este é um erro gravíssimo. Veja mais detalhes no console do navegador para tentar entender onde ocorreu o erro.</p>"
                + "<p>Quem entregar para o professor algo que faça esta mensagem aparecer, vai ficar com nota zero!</p>"
        );
        document.querySelector("#testefw-botao-executar").disabled = true;
    };
    const divNota = document.querySelector("#testefw-nota");
    if (divNota) divNota.style.display = "none";
},
funcs => {
    const grupo = funcs.grupo;
    const teste = funcs.teste;
    const igual = funcs.igual;
    const naoDeuErro = funcs.naoDeuErro;
    const Utilitarios = funcs.Utilitarios;
    const Pagina = funcs.Pagina;
    const Xoshiro128ssSeedRandom = funcs.Xoshiro128ssSeedRandom;
    const erroGravissimo = funcs.erroGravissimo;
    const numeroMaximoDeAlunos = 4;
    const random = Xoshiro128ssSeedRandom.std();
    let nomesOk = false;
    function testOk() { return nomesOk; }
    function setTestOk(ok) { nomesOk = ok; }

    const nomesMasculinos = Object.freeze([
        "Carlos", "Paulo", "Cláudio", "Roberto", "Joaquim", "Pedro", "Rodrigo", "Ricardo", "Marcos", "Eduardo",
        "Osvaldo", "Yago", "Felipe", "Victor", "Alex", "Tiago", "Diego", "André", "Fernando", "Luciano"
    ]);
    const nomesFemininos = Object.freeze([
        "Maria", "Fabiana", "Fernanda", "Elizabete", "Solange", "Yasmin", "Rayssa", "Juliana", "Meire", "Sílvia",
        "Daniela", "Valéria", "Vanessa", "Michelle", "Janete", "Karen", "Larissa", "Andreia", "Andressa", "Luciana"
    ]);
    const sobrenomes = Object.freeze([
        "de Souza", "de Oliveira", "dos Santos", "de Gusmões", "de Andrade", "da Silva", "Melo", "da Cunha", "Brito", "da Luz",
        "Fernandes", "Teixeira", "Pereira", "Freitas", "do Amaral", "da Cruz", "Machado", "Assis", "Figueiredo", "da Conceição",
        "Ferreira", "Matos", "de Campos", "dos Reis", "Rainha", "Valete"
    ]);

    function nomeAleatorio(genero) {
        if (!["M", "F"].includes(genero)) genero = random.sortear(["M", "F"]);
        return random.nomeAleatorio(genero === "M" ? nomesMasculinos : nomesFemininos, sobrenomes);
    }

    function nomeAleatorioGenero() {
        const genero = random.sortear(["M", "F"]);
        return [nomeAleatorio(genero), genero];
    }

    let urlBase;

    // NOME DOS ALUNOS.

    function nomesDosAlunos() {
        urlBase = configuracaoDoAdo();
        return nomesDoAdo();
    }

    function validarNomesAlunos() {
        const alunos = nomesDosAlunos(), nomes = [];
        if (!(alunos instanceof Array)) throw new Error("Os nomes do(a)(s) aluno(a)(s) deveriam estar em um array.");
        if (alunos.length === 0) throw new Error("Você(s) se esqueceu(ram) de preencher os nomes do(a)(s) aluno(a)(s).");

        alunos.forEach((aluno, idx) => {
            const numero = idx + 1;

            if (typeof aluno !== "string") throw new Error(`O nome do(a) aluno(a) ${numero} deveria ser uma string.`);
            if (["João da Silva", "Maria da Silva", ""].includes(aluno.trim())) {
                throw new Error(`O nome do(a) aluno(a) ${numero} não está correto.`);
            }
            if (aluno !== aluno.trim()) {
                throw new Error(`Não deixe espaços em branco sobrando no começo ou no final do nome de ${aluno.trim()}.`);
            }
            if (nomes.includes(aluno)) throw new Error("Há nomes de alunos(as) repetidos.");
            nomes.push(aluno);
        });
        if (alunos.length > numeroMaximoDeAlunos) {
            throw new Error(`Vocês só podem fazer grupo de até ${numeroMaximoDeAlunos} alunos(as).`);
        }
        return alunos;
    }

    function mostrarValidacaoNomesAlunos() {
        try {
            const alunos = validarNomesAlunos();
            alunos.forEach(nome => {
                const li = document.createElement("li");
                li.append(nome);
                document.querySelector("#testefw-alunos").append(li);
            });
        } catch (e) {
            erroGravissimo(""
                    + "<h1>SE VOCÊ ESTÁ VENDO ISSO, É PORQUE VOCÊ NÃO DEFINIU CORRETAMENTE OS INTEGRANTES DO SEU GRUPO.</h1>"
                    + "<p>Arrumar isto é a primeira coisa que você tem que fazer neste ADO, e assim que o fizer esta mensagem vai desaparecer.</p>"
                    + "<p>Arrume o nome no nomes.js.</p>"
                    + "<p>Quem entregar para o professor algo que faça esta mensagem aparecer, vai ficar com nota zero!</p>"
            );
            throw e;
        }
    }

    grupo("Nomes dos alunos", "Verifica se a identificação do(a)(s) aluno(a)(s) está ok").naoFracionado.minimo(-10).testes([
        teste("Listagem de alunos ok.", () => mostrarValidacaoNomesAlunos(), naoDeuErro(), undefined, setTestOk)
    ]);

    // EXERCÍCIO 1.

    const ddds = [
        11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
        21, 22, 24, 27, 28,                 // RJ e ES
        31, 32, 33, 34, 35, 37, 38,         // MG
        41, 42, 43, 44, 45, 46, 47, 48, 49, // PR e SC
        51, 53, 54, 55,                     // RS
        61, 62, 63, 64, 65, 66, 67, 68, 69, // DF, GO, TO, MT, MS, AC e RO
        71, 73, 74, 75, 77, 79,             // BA e SE
        81, 82, 83, 84, 85, 86, 87, 88, 89, // PE, AL, PB, RN, CE e PI
        91, 92, 93, 94, 95, 96, 97, 98, 99  // PA, AM, RR, AP e MA
    ];
    function digitos(n) {
        let r = "";
        for (let i = 0; i < n; i++) {
            r += random.nextInt(0, 9);
        }
        return r;
    }

    function rc(n) {
        let r = "";
        for (let i = 0; i < n; i++) {
            r += random.sortear("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$@*+-()^~".split(""));
        }
        return r;
    }

    const testesEx1 = [
        ["", "", false],
        ["?telefone=batatinha", "batatinha", false],
        ["?telefone=", "", false]
    ];

    for (let i = 0; i < 100; i++) {
        const codigo = (i < 10 ? "0" : "") + i;
        const dddOk = ddds.includes(i);
        const fones = [
            [ "?telefone=", codigo + "9"  + random.nextInt(1, 9) + digitos(7), dddOk ],
            [ "?telefone=", codigo + ""   + random.nextInt(2, 8) + digitos(7), dddOk ],
        ];
        for (const t of fones) {
            t[0] += t[1];
        }
        testesEx1.push(...fones);
    }

    for (let i = 0; i < 3; i++) {
        const fonesLixo = [
            [ "?telefone=", random.sortear(ddds) + "9"  + random.nextInt(1, 9) + digitos(8), false ],
            [ "?telefone=", random.sortear(ddds) + ""   + random.nextInt(2, 8) + digitos(8), false ],
            [ "?telefone=", random.sortear(ddds) + "9"  + random.nextInt(1, 9) + digitos(6), false ],
            [ "?telefone=", random.sortear(ddds) + ""   + random.nextInt(2, 8) + digitos(6), false ],
            [ "?telefone=", random.sortear(ddds) + "90" + ""                   + digitos(7), false ],
            [ "?telefone=", random.sortear(ddds) + "1"  + ""                   + digitos(7), false ],
            [ "?telefone=", random.sortear(ddds) + "0"  + ""                   + digitos(7), false ],
            [ "?telefone=", random.sortear(ddds) + "1"  + ""                   + digitos(8), false ],
            [ "?telefone=", random.sortear(ddds) + "0"  + ""                   + digitos(8), false ],
            [ "?kkkkkkkk=", random.sortear(ddds) + "9"  + random.nextInt(1, 9) + digitos(7), false ],
            [ "?kkkkkkkk=", random.sortear(ddds) + ""   + random.nextInt(2, 8) + digitos(7), false ],
            [ "?telefone=", random.sortear(ddds) + "9"  + digitos(4)  +  rc(1) + digitos(4), false ],
            [ "?telefone=", random.sortear(ddds) + ""   + digitos(4)  +  rc(1) + digitos(4), false ],
        ];
        for (const t of fonesLixo) {
            t[0] += t[1];
        }
        testesEx1.push(...fonesLixo);
    }

    function telefoneFormatado(t) {
        return t.length === 10
            ? `(${t.substring(0, 2)}) ${t.substring(2, 6)}-${t.substring(6, 10)}`
            : `(${t.substring(0, 2)}) ${t.substring(2, 7)}-${t.substring(7, 11)}`;
    }

    async function validarPaginaTelefone(queryString) {
        const pg = new Pagina(urlBase + "ex1.php" + queryString);
        await pg.testarGet();
        const v = await pg.validar();
        Pagina.validouHTML().testar(v);
        const html = pg.src.substring(pg.src.indexOf("<html"));
        return html.substring(html.indexOf("<p>") + 3, html.indexOf("</p>"));
    }

    grupo("Exercício 1", "Telefones").maximo(5).testes(testesEx1.map(t =>
        teste(
            `Validar com [${t[0]}].`,
            eval(`async () => await validarPaginaTelefone("${t[0]}")`),
            igual(t[2] ? telefoneFormatado(t[1]) : "Número inválido"),
            testOk
        )
    ));

    // EXERCÍCIO 2.

    const datasBoas = [
        "1975-01-31",
        "2019-02-10",
        "1977-03-28",
        "1944-04-07",
        "2001-05-14",
        "1989-06-22",
        "1921-07-31",
        "1982-08-25",
        "2014-09-12",
        "1966-10-01",
        "1910-11-04",
        "1977-12-03",
        "1920-01-09",
        "1989-02-12",
        "2022-03-24",
        "2020-04-30",
        "2000-05-16",
        "2011-06-19",
        "2010-07-13",
        "1967-08-13",
        "1923-09-13",
        "1948-10-29",
        "1925-11-30",
        "2022-12-31",
        "2001-01-01",
        "2001-01-31",
        "2020-02-29",
        "1952-02-29",
        "2001-03-31",
        "2009-05-31",
        "2021-07-31",
        "1997-08-31",
        "1953-10-31",
    ];

    const datasFuturas = [
        "2067-08-13",
        "2023-08-13",
        "2023-11-04",
        "2024-09-16"
    ];

    const datasAntigas = [
        "1900-08-13",
        "1777-11-04",
        "1212-03-10",
        "0476-09-30"
    ];

    const datasRuins = [
        "1756-00-30",
        "2023-01-32",
        "1984--1-10",
        "1984-13-10",
        "1984-04-00",
        "9999-99-99",
        "1928-04--5",
        "2023-02-29",
        "1900-02-29",
        "2100-02-29",
        "2023-02-30",
        "2024-02-30",
        "2023-04-31",
        "2023-06-31",
        "2023-09-31",
        "2023-11-31",
        "2023/10/14",
        "2023.10.14",
        "2023-7-3",
        "0000-08-12",
        "-001-04-31",
        "    -  -  ",
        "  24- 1- 1",
        "2010-10-10 xxx",
        "abacaxi e pêra",
        "zoado",
        "WTFw-tf-WTF",
        "",
        "  23-11-31",
        "23-11-31",
        undefined
    ];

    function anosDesde(d) {
        const agora = new Date();
        const [dAno, dMes, dDia] = d.split("-").map(x => parseInt(x));
        const [aAno, aMes, aDia] = [agora.getFullYear(), agora.getMonth() + 1, agora.getDate()];
        return aAno - dAno - ((dMes > aMes || (dMes === aMes && dDia > aDia)) ? 1 : 0);
    }

    function formatarResultadoData(t) {
        if (!t[3]) return "Errado";
        return `${t[0].trim()} é ${t[1] === "M" ? "um garoto" : "uma garota"} de ${anosDesde(t[2])} anos de idade.`;
    }

    const testesEx2 = [
        ["", "", "", false],
        [undefined, undefined, undefined, false]
    ];

    for (const d of datasBoas) {
        testesEx2.push([...nomeAleatorioGenero(), d, true]);
    }

    for (const n of ["     ", "", undefined]) {
        testesEx2.push([n, random.sortear(["M", "F"]), random.sortear(datasBoas), false]);
    }

    for (const s of ["G", "H", "m", "f", "", "batatinha", undefined]) {
        testesEx2.push([nomeAleatorio(), s, random.sortear(datasBoas), false]);
    }

    for (const d of datasRuins.concat(datasAntigas).concat(datasFuturas)) {
        testesEx2.push([...nomeAleatorioGenero(), d, false]);
    }

    const [n1, n2, n3] = [nomeAleatorioGenero(), nomeAleatorioGenero(), nomeAleatorioGenero()];
    testesEx2.push(["    " + n1[0]         , n1[1], random.sortear(datasBoas), true]);
    testesEx2.push([         n2[0] + "    ", n2[1], random.sortear(datasBoas), true]);
    testesEx2.push(["  "   + n3[0] + "  "  , n3[1], random.sortear(datasBoas), true]);

    async function validarPaginaData(nome, sexo, data) {
        let dados = "";
        if (nome !== undefined) dados += "&nome=" + nome.replaceAll(" ", "%20");
        if (sexo !== undefined) dados += "&sexo=" + sexo;
        if (data !== undefined) dados += "&data-nascimento=" + data;
        if (dados.length > 0) dados = dados.substring(1);
        const pg = new Pagina(urlBase + "ex2.php");
        await pg.testarPost(dados, { "Content-Type": "application/x-www-form-urlencoded" });
        const v = await pg.validar();
        Pagina.validouHTML().testar(v);
        const html = pg.src.substring(pg.src.indexOf("<html"));
        return html.substring(html.indexOf("<p>") + 3, html.indexOf("</p>"));
    }

    function ex2Format(x) {
        if (x === undefined) return "undefined";
        return `"${x}"`;
    }

    grupo("Exercício 2", "Nome, datas e sexo").maximo(5).testes(testesEx2.map(t =>
        teste(
            `Validar com "${t[0]}", "${t[1]}", "${t[2]}".`,
            eval(`async () => await validarPaginaData(${ex2Format(t[0])}, ${ex2Format(t[1])}, ${ex2Format(t[2])})`),
            igual(formatarResultadoData(t)),
            testOk
        )
    ));
});
