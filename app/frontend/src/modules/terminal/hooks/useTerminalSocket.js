import { useBackend } from '../../../shared/hooks/useBackend';

/**
 * Hook dedicado para gerenciar a conexão WebSocket do Terminal.
 * Centraliza a lógica para evitar conexões duplicadas e facilitar o acesso ao status.
 */
export function useTerminalSocket() {
    const { connected: isConnected, send, on, off } = useBackend('/ws/minishell', {
        useToken: true
    });

    return { isConnected, send, on, off };
}
