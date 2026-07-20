import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook universal para comunicação com o backend via WebSocket.
 * Suporta múltiplos endpoints, autenticação via token e sistema de eventos.
 *
 * @param {string} endpoint - O path do websocket (ex: '/minishell' ou '/philosophers')
 * @param {Object} options - Configurações adicionais
 * @param {boolean} options.useToken - Se deve buscar um token de autenticação
 * @param {boolean} options.autoConnect - Se deve conectar automaticamente no mount
 * @param {number} options.reconnectInterval - Intervalo para tentativa de reconexão em ms
 */
// O token é emitido para a sessão (cookie). Se dois sockets pedirem ao mesmo
// tempo antes de a sessão existir, cada request criaria uma sessão diferente e
// só o último cookie sobreviveria — invalidando o outro token. Compartilhar a
// requisição em voo garante uma sessão só.
let tokenInFlight = null;

const fetchToken = async (baseUrl) => {
    if (!tokenInFlight) {
        tokenInFlight = fetch(`${baseUrl}/api/token`, {
            headers: { 'x-terminal-request': 'true' },
            credentials: 'same-origin',
        })
            .then(res => res.json())
            .then(data => data.token)
            .finally(() => { tokenInFlight = null; });
    }
    return tokenInFlight;
};

export const useBackend = (endpoint, options = {}) => {
    const {
        useToken = false,
        autoConnect = true,
        reconnectInterval = 5000
    } = options;

    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const listenersRef = useRef(new Map());

    // Sistema de tratamento de eventos estável
    const on = useCallback((event, callback) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, new Set());
        }
        listenersRef.current.get(event).add(callback);
    }, []);

    const off = useCallback((event, callback) => {
        if (listenersRef.current.has(event)) {
            listenersRef.current.get(event).delete(callback);
        }
    }, []);

    const emit = useCallback((event, data) => {
        if (listenersRef.current.has(event)) {
            listenersRef.current.get(event).forEach(cb => cb(data));
        }
        // Listener universal para debug ou monitoramento global
        if (listenersRef.current.has('*')) {
            listenersRef.current.get('*').forEach(cb => cb({ event, data }));
        }
    }, []);

    const connect = useCallback(async () => {
        // Evita duplicidade de conexão
        if (socketRef.current?.readyState === WebSocket.OPEN ||
            socketRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            const baseUrl = window.location.origin;
            const host = window.location.host;
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

            let token = null;
            if (useToken) {
                token = await fetchToken(baseUrl);

                if (!token) throw new Error('Falha ao obter token de autenticação');
            }

            const url = `${wsProtocol}//${host}${endpoint}`;
            console.log(`[useBackend] Conectando a ${url}${token ? ' (com token)' : ''}`);

            const socket = token ? new WebSocket(url, token) : new WebSocket(url);

            socket.onopen = () => {
                setConnected(true);
                emit('open', { endpoint });
                console.log(`[useBackend] Conectado: ${endpoint}`);
            };

            socket.onmessage = (event) => {
                let payload = event.data;
                try {
                    // Tenta fazer o parse automático se for JSON
                    payload = JSON.parse(event.data);
                } catch (e) {
                    // Mantém como string se não for JSON
                }
                emit('message', payload);
            };

            socket.onclose = (event) => {
                setConnected(false);
                socketRef.current = null;
                emit('close', event);

                // Reconecta apenas se não for um fechamento intencional
                if (event.code !== 1000) {
                    console.log(`[useBackend] Conexão perdida (${endpoint}). Reconectando em ${reconnectInterval}ms...`);
                    setTimeout(connect, reconnectInterval);
                }
            };

            socket.onerror = (error) => {
                console.error(`[useBackend] Erro em ${endpoint}:`, error);
                emit('error', error);
                socket.close();
            };

            socketRef.current = socket;
        } catch (err) {
            console.error(`[useBackend] Falha ao iniciar conexão para ${endpoint}:`, err);
            emit('error', err);
            setTimeout(connect, reconnectInterval);
        }
    }, [endpoint, useToken, reconnectInterval, emit]);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            if (socketRef.current) {
                console.log(`[useBackend] Desconectando: ${endpoint}`);
                socketRef.current.close(1000);
            }
        };
    }, [connect, autoConnect, endpoint]);

    const send = useCallback((data) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            socketRef.current.send(message);
        } else {
            console.warn(`[useBackend] Tentativa de envio sem conexão ativa em ${endpoint}`);
        }
    }, [endpoint]);

    return { connected, send, on, off, connect };
};
