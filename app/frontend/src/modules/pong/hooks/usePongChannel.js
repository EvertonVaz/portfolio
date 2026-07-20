import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'phoenix';

export function usePongChannel() {
    const socketRef = useRef(null);
    const channelRef = useRef(null);
    const gameStateRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [mode, setModeState] = useState('pvp');
    const [models, setModelsState] = useState({ ai: 'ppo', player: 'ppo' });

    useEffect(() => {
        let cancelled = false;
        let socket = null;
        let channel = null;

        (async () => {
            // o backend emite o cookie HttpOnly com o room_id da sessão; sem ele
            // o socket é recusado. O cookie viaja sozinho no handshake do WS.
            let csrfToken;
            try {
                const res = await fetch('/api/pong/room', { credentials: 'include' });
                ({ csrf_token: csrfToken } = await res.json());
            } catch (err) {
                console.error('[PongChannel] falha ao obter a sala:', err);
                return;
            }
            if (cancelled) return;

            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            socket = new Socket(`${wsProtocol}//${window.location.host}/socket`, {
                params: { _csrf_token: csrfToken },
            });
            socket.connect();

            channel = socket.channel('game:pong', {});

            channel.on('game_state', (state) => {
                gameStateRef.current = state;
                if (state.status === 'game_over') setGameOver(true);
                if (state.mode) setModeState(state.mode);
                if (state.ai_model) {
                    // evita re-render a 60fps: só troca o objeto quando o valor muda
                    setModelsState(prev =>
                        prev.ai === state.ai_model && prev.player === state.player_model
                            ? prev
                            : { ai: state.ai_model, player: state.player_model }
                    );
                }
            });

            channel.join()
                .receive('ok', () => setConnected(true))
                .receive('error', (err) => console.error('[PongChannel] join error:', err));

            socketRef.current = socket;
            channelRef.current = channel;
        })();

        return () => {
            cancelled = true;
            channel?.leave();
            socket?.disconnect();
        };
    }, []);

    const movePlayer = useCallback((direction) => {
        channelRef.current?.push('player_move', { direction });
    }, []);

    const restart = useCallback(() => {
        channelRef.current?.push('restart', {});
        setGameOver(false);
    }, []);

    const setMode = useCallback((newMode) => {
        channelRef.current?.push('set_mode', { mode: newMode });
        setGameOver(false);
    }, []);

    const setModels = useCallback((aiModel, playerModel) => {
        channelRef.current?.push('set_models', { ai_model: aiModel, player_model: playerModel });
    }, []);

    return { gameStateRef, connected, gameOver, mode, models, movePlayer, restart, setMode, setModels };
}
