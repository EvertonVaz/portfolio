import { useState, useEffect, useCallback } from 'react';
import { useBackend } from '../../../shared/hooks/useBackend';

export function usePhilosophersSocket() {
    const [logs, setLogs] = useState([]);
    const [philosophers, setPhilosophers] = useState({});

    // Conecta ao endpoint dedicado /philosophers com token
    const { connected: isConnected, send, on, off } = useBackend('/ws/philosophers', {
        useToken: true
    });

    const handleUpdate = useCallback((data) => {
        // data = { time, philo_id, action }
        const { philo_id, action, time } = data;

        // Add to logs
        const localTime = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-49), `[${localTime}] Philo ${philo_id}: ${action} (at ${time}ms)`]);

        // Update philosopher state
        setPhilosophers(prev => {
            const newState = { ...prev };

            // Determine status based on action string
            let status = 'thinking';
            if (action.includes('eating')) status = 'eating';
            if (action.includes('fork')) status = 'waiting'; // Has fork but maybe not eating yet
            if (action.includes('sleeping')) status = 'sleeping';
            if (action.includes('thinking')) status = 'thinking';
            if (action.includes('died')) status = 'dead';

            newState[philo_id] = {
                id: philo_id,
                status,
                lastAction: action,
                lastUpdate: Date.now()
            };

            return newState;
        });
    }, []);

    useEffect(() => {
        if (isConnected) {
            console.log('Connected to Philosophers Socket');
            // Inicializa conexão/contexto do terminal se necessário
            send("philosophers_client_init");
        }
    }, [isConnected, send]);

    useEffect(() => {
        const handleMessage = (payload) => {
            try {
                // Handle standardized JSON responses from our backend
                if (payload.type === 'philosophers_update') {
                    handleUpdate(payload.data);
                } else if (payload.type === 'philosophers_exit') {
                    const isSuccess = payload.status === 0;
                    if (isSuccess) {
                        setPhilosophers(prev => {
                            const newState = { ...prev };
                            Object.keys(newState).forEach(id => {
                                if (newState[id].status !== 'dead') {
                                    newState[id].status = 'satisfied';
                                    newState[id].lastAction = 'Simulation Complete: Target Reached';
                                }
                            });
                            return newState;
                        });
                    }
                    setLogs(prev => [...prev, `[SYSTEM] Simulation exited with status: ${payload.status}`]);
                } else {
                    // Maybe standard terminal output
                    if (typeof payload === 'string') {
                        // Ignore command echoing
                    }
                }
            } catch {
                // Fallback for plain text messages (legacy or errors)
                console.log("Received raw:", payload);
            }
        };

        on('message', handleMessage);
        return () => off('message', handleMessage);
    }, [on, off, handleUpdate]);

    const startSimulation = (n, die, eat, sleep, mustEat) => {
        if (isConnected) {
            // Clear previous state
            setLogs([]);
            setPhilosophers({});

            // Send command
            const cmd = mustEat
                ? `philosophers ${n} ${die} ${eat} ${sleep} ${mustEat}`
                : `philosophers ${n} ${die} ${eat} ${sleep}`;
            send(cmd);
        }
    };

    return { isConnected, startSimulation, logs, philosophers };
}
