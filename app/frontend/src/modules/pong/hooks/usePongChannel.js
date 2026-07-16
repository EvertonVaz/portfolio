import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'phoenix';

export function usePongChannel(roomId = 'lobby') {
    const socketRef = useRef(null);
    const channelRef = useRef(null);
    const gameStateRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [mode, setModeState] = useState('pvp');
    const [models, setModelsState] = useState({ ai: 'ppo', player: 'ppo' });

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new Socket(`${wsProtocol}//${window.location.host}/socket`);
        socket.connect();

        const channel = socket.channel(`game:${roomId}`, {});

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

        return () => {
            channel.leave();
            socket.disconnect();
        };
    }, [roomId]);

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
