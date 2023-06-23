/**
 * Recebe um texto e um conjunto de configurações para ler um número. Devolve o número lido.
 * @param {Object} cfgs Dicionário com dados de limites e mensagens de erro.
 * @param {number} cfgs.min Valor mínimo aceito pela função.
 *                 Rejeita qualquer valor abaixo disso.
 *                 Se não for especificado, não haverá valor mínimo.
 * @param {number} cfgs.max Valor máximo aceito pela função.
 *                 Rejeita qualquer valor acima disso.
 *                 Se não for especificado, não haverá valor máximo.
 * @param {number} cfgs.casas Número máximo de casas decimais aceitas pela função.
 *                 Rejeita qualquer valor com mais casas decimais.
 *                 Se não for especificado, não haverá limite de casas decimais.
 * @param {String} cfgs.erroFormato Mensagem de erro a ser colocada na exceção se o valor lido não for numérico.
 *                 Se não for especificado, o valor de cfgs.erro é usado.
 * @param {String} cfgs.erroMin Mensagem de erro a ser colocada na exceção se o valor lido for abaixo do mínimo.
 *                 Se não for especificado, o valor de cfgs.erro é usado.
 * @param {String} cfgs.erroMax Mensagem de erro a ser colocada na exceção se o valor lido for acima do máximo.
 *                 Se não for especificado, o valor de cfgs.erro é usado.
 * @param {String} cfgs.erroCasas Mensagem de erro a ser colocada na exceção se o valor lido ultrapassar o limite de casas decimais.
 *                 Se não for especificado, o valor de cfgs.erro é usado.
 * @param {String} cfgs.erro Mensagem de erro a ser colocada na exceção nos casos onde uma mensagem mais específica não tenha sido definida.
 *                 Se não for especificado, uma string vazia é utilizada.
 * @returns {number} O número lido, caso tenha conseguido.
 * @throws Se o valor lido não for numérico, estiver abaixo do mínimo permitido, estiver acima do máximo permitido
 *         ou tiver mais casas decimais que o limite permitido.
 */
function lerNumero(texto, cfgs) {
    if (!cfgs) cfgs = {};
    const erro = cfgs.erro || "";
    const erroFormato = cfgs.erroFormato || cfgs.erro;
    const erroMin = cfgs.erroMin || cfgs.erro;
    const erroMax = cfgs.erroMax || cfgs.erro;
    const erroCasas = cfgs.erroCasas || cfgs.erro;
    if (texto === "" || typeof texto !== "string") throw new Error(erroFormato);
    const negativo = texto.charAt(0) === "-";
    if (negativo) texto = texto.substring(1);
    for (let i = 0; i < texto.length; i++) {
        if (!"0123456789.".includes(texto.charAt(i))) throw new Error(erroFormato);
    }
    const dot = texto.indexOf(".");
    if (dot !== texto.lastIndexOf(".")) throw new Error(erroFormato);
    if (dot === 0 || dot === texto.length - 1) throw new Error(erroFormato);
    if (cfgs.casas !== undefined && dot !== -1 && dot + cfgs.casas + 1 < texto.length) throw new Error(erroCasas);
    const n = negativo ? -texto : +texto;
    if (cfgs.min !== undefined && n < cfgs.min) throw new Error(erroMin);
    if (cfgs.max !== undefined && n > cfgs.max) throw new Error(erroMax);
    return n;
}

/**
 * Recebe um objeto e devolve uma string com o nome do tipo correspondente a ele.
 * Se o objeto pertencer a alguma classe, devolve o nome dessa classe.
 * @param {Object} elemento O elemento para o qual queremos determinar o tipo.
 * @returns {String} O nome do tipo resultante.
 */
function determinarTipo(elemento) {
    if (elemento === null) return "null";
    if (typeof elemento !== "object") return typeof elemento;
    return elemento.constructor.name;
}
