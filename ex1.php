<?php
    // Deixe essas duas linhas. Caso contrário, o navegador não vai conseguir rodar os testes.
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");

/*
Exercício 1 - Validação e formatação de número de telefone.

commit - 12h

Crie uma página PHP com as seguintes características:
- 1. Receba informações por GET.
- 2. Sempre devolva uma página HTML completa e bem formada (o teste sempre vai passar ela num validador).
- 3. As informações recebidas na query string estão num parâmetro chamado "telefone".
- 4. O telefone passado na query string é número de telefone brasileiro com 10 ou 11 dígitos, sem pontuação, traços ou parênteses.
- 5. Se o número de telefone for bem-formado, coloque dentro do <body>, apenas uma tag <p> contendo o número corretamente formatado.
- 6. Formate o número da seguinte forma: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx.
- 7. Se o número de telefone não for bem-formado, coloque dentro do <body>, apenas uma tag <p> contendo o texto "Número inválido".

Regras para um número de telefone recebido na query string ser considerado bem-formado:
- 1. Deve ter 10 ou 11 dígitos. Qualquer coisa com menos de 10 ou mais que 11, não é bem formado.
- 2. Deve ter somente caracteres numéricos (0-9). Qualquer coisa contendo outros caracteres, não é bem formada.
- 3. O número do DDD deve ser válido (veja abaixo).
- 4. Um número de telefone de 11 dígitos é um celular. Dessa forma, após o DDD, ele tem que começar com 9.
- 5. Nenhum número de celular pode começar com 90, pois esse é o prefixo para ligações à cobrar. Qualquer número assim é mal-formado.
- 6. Um número de telefone de 10 dígitos é um telefone fixo. Dessa forma, após o DDD, ele tem que começar com um número de 2 a 8.
- 7. Não existem números de telefone regulares que comecem com 0 ou 1. Todos esses são mal-formados.
     - Números de emergência ou de serviços (190, 193, 156, 180, 0800, 0900, 0300, etc) não contam e devem ser desconsiderados.
     - Números de fora do Brasil também devem ser desconsiderados.
- 8. Se o número nem sequer existir na query string, então ele é mal-formado.
- 9. Não haverão casos onde haja vários números de telefone na query string.

DDDs válidos, obtido de https://pt.wikipedia.org/wiki/Discagem_direta_à_distância:
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, 27, 28,                 // RJ e ES
    31, 32, 33, 34, 35, 37, 38,         // MG
    41, 42, 43, 44, 45, 46, 47, 48, 49, // PR e SC
    51, 53, 54, 55,                     // RS
    61, 62, 63, 64, 65, 66, 67, 68, 69, // DF, GO, TO, MT, MS, AC e RO
    71, 73, 74, 75, 77, 79,             // BA e SE
    81, 82, 83, 84, 85, 86, 87, 88, 89, // PE, AL, PB, RN, CE e PI
    91, 92, 93, 94, 95, 96, 97, 98, 99  // PA, AM, RR, AP e MA

Dica:
- As funções substr, strlen, in_array, isset e str_contains podem ser úteis.
*/
?>
<?php


if (!isset($_GET['telefone'])) {
    $telefoneValido = false;
} else {
    $telefone = $_GET['telefone'];
    if (!ctype_digit($telefone)) {
        $telefoneValido = false;
      } else {
    if (!ctype_digit($telefone)) {
        $telefoneValido = false;
      } else {
    if (strlen($telefone) == 10 || strlen($telefone) == 11) {
        $ddd = substr($telefone, 0, 2);
        if (in_array($ddd, array('11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'))) {


            if (strlen($telefone) == 11) {
                $prefixo = substr($telefone, 2, 2);
                if ($prefixo != '90' && substr($telefone, 2, 1) == '9') {
                    $telefoneValido = true;
                } else {
                    $telefoneValido = false;
                }
            } elseif (strlen($telefone) == 10) {
                $prefixo = substr($telefone, 2, 1);
                if ($prefixo >= '2' && $prefixo <= '8') {
                    $telefoneValido = true;
                } else {
                    $telefoneValido = false;
                }
            }
        } else {
            $telefoneValido = false;
        }
    } else {
        $telefoneValido = false;
    }
}
}
}

echo '<!DOCTYPE html>';
echo '<html>';
echo '<head>';
echo '<meta charset="UTF-8">';
echo '<title>Validação de telefone</title>';
echo '</head>';
echo '<body>';

if ($telefoneValido) {
    if (strlen($telefone) == 11) {
        echo '<p>(' . substr($telefone, 0, 2) . ') ' . substr($telefone, 2, 5) . '-' . substr($telefone, 7) . '</p>';
    } else {
        echo '<p>(' . substr($telefone, 0, 2) . ') ' . substr($telefone, 2, 4) . '-' . substr($telefone, 6) . '</p>';
    }
} else {
    echo '<p>Número inválido</p>';
}

echo '</body>';
?>