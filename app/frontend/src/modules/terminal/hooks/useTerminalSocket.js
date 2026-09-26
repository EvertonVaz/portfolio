import { useBackend } from '../../../shared/hooks/useBackend';

/**
 * Hook dedicado para gerenciar a conexão WebSocket do Terminal.
 * Centraliza a lógica para evitar conexões duplicadas e facilitar o acesso ao status.
 */
export function useTerminalSocket() {
    // Saída de shell é texto puro: "echo 42" não pode virar o número 42
    const { connected: isConnected, send, on, off, connect } = useBackend('/ws/minishell', {
        useToken: true,
        parseJson: false
    });

    return { isConnected, send, on, off, connect };
}
