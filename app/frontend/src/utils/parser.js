/**
 * Parser para formatar a resposta vinda do backend Elixir.
 * O backend envia uma string sanitizada com palavras separadas por vírgula.
 */
export const parseResponse = (msg) => {
    if (!msg) return [];

    // Divide por vírgula e limpa espaços extras
    const words = msg.split(',').map(word => word.trim()).filter(word => word !== "");

    return words;
};
