import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar o histórico de comandos de um terminal.
 * Segue o padrão de responsabilidade única (SRP) do SOLID.
 */
export const useCommandHistory = () => {
    const [history, setHistory] = useState([]);
    const [cursor, setCursor] = useState(-1);

    const addToHistory = useCallback((command) => {
        if (!command) return;
        setHistory((prev) => {
            // Não adiciona se for igual ao último comando (evita duplicatas seguidas)
            if (prev[prev.length - 1] === command) return prev;
            return [...prev, command];
        });
        setCursor(-1); // Reseta o cursor após um novo comando
    }, []);

    const navigateUp = useCallback(() => {
        if (history.length === 0) return null;

        let newCursor;
        if (cursor === -1) {
            // Primeira vez apertando para cima
            newCursor = history.length - 1;
        } else {
            newCursor = Math.max(0, cursor - 1);
        }

        setCursor(newCursor);
        return history[newCursor];
    }, [history, cursor]);

    const navigateDown = useCallback(() => {
        if (cursor === -1) return null;

        const newCursor = cursor + 1;
        if (newCursor >= history.length) {
            setCursor(-1);
            return ''; // Volta para o comando em branco
        }

        setCursor(newCursor);
        return history[newCursor];
    }, [history, cursor]);

    return {
        addToHistory,
        navigateUp,
        navigateDown
    };
};
