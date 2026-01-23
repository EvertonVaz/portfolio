import { useEffect, useRef, useState, useCallback } from 'react';

export const useRabbitMQ = (onMessageReceived) => {
    const socketRef = useRef(null);
    const callbackRef = useRef(onMessageReceived);
    const [connected, setConnected] = useState(false);

    // Atualiza o ref sempre que a função mudar, sem disparar re-renders ou re-conexões
    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    const connect = useCallback(async () => {
        // Evita múltiplas tentativas de conexão simultâneas
        if (socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            const baseUrl = window.location.origin;
            const tokenResponse = await fetch(`${baseUrl}/token`, {
                headers: {
                    'x-terminal-request': 'true'
                }
            });
            const { token } = await tokenResponse.json();

            if (!token) throw new Error('Falha ao obter token');

            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

            console.log('[Socket V1.1.3] Estabilizando conexão segura...');
            const socket = new WebSocket(wsUrl, token);

            socket.onopen = () => {
                console.log('[Socket] Conexão estável e autenticada.');
                setConnected(true);
            };

            socket.onmessage = (event) => {
                // Usa a referência estável para o callback
                if (callbackRef.current) {
                    callbackRef.current(event.data);
                }
            };

            socket.onclose = (event) => {
                setConnected(false);
                socketRef.current = null;
                // Só tenta reconectar se não foi um fechamento intencional (unmount)
                if (event.code !== 1000) {
                    console.log('[Socket] Conexão perdida. Reconectando em 5s...');
                    setTimeout(connect, 5000);
                }
            };

            socket.onerror = (error) => {
                console.error('[Socket] Erro detectado:', error);
                socket.close();
            };

            socketRef.current = socket;
        } catch (err) {
            console.error('[Socket] Falha ao conectar:', err);
            setTimeout(connect, 5000);
        }
    }, []); // Dependências vazias = estabilidade total

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                console.log('[Socket] Fechando conexão por desmontagem do componente.');
                socketRef.current.close(1000); // Code 1000 = Normal Closure
            }
        };
    }, [connect]);

    const sendCommand = useCallback((command) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(command);
        } else {
            console.warn('[Socket] Não enviado: Aguardando conexão...');
        }
    }, []);

    return { connected, sendCommand };
};
