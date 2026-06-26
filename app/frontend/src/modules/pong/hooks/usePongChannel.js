import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'phoenix';

export function usePongChannel(roomId = 'lobby') {
    const socketRef = useRef(null);
    const channelRef = useRef(null);
    const gameStateRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new Socket(`${wsProtocol}//${window.location.host}/socket`);
        socket.connect();

        const channel = socket.channel(`game:${roomId}`, {});

        channel.on('game_state', (state) => {
            gameStateRef.current = state;
            if (state.status === 'game_over') setGameOver(true);
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

    return { gameStateRef, connected, gameOver, movePlayer, restart };
}
