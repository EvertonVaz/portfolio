import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

const RABBITMQ_URL = import.meta.env.VITE_RABBITMQ_URL;
const QUEUE_COMMAND = import.meta.env.VITE_QUEUE_COMMAND;
const QUEUE_RESPONSE = import.meta.env.VITE_QUEUE_RESPONSE;

export const useRabbitMQ = (onMessageReceived) => {
    const clientRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const client = new Client({
            brokerURL: RABBITMQ_URL,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to RabbitMQ via WebStomp');
                setConnected(true);

                // Subscribe to response queue
                client.subscribe(`/queue/${QUEUE_RESPONSE}`, (message) => {
                    if (message.body) {
                        onMessageReceived(message.body);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from RabbitMQ');
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [onMessageReceived]);

    const sendCommand = useCallback((command) => {
        if (clientRef.current && connected) {
            clientRef.current.publish({
                destination: `/queue/${QUEUE_COMMAND}`,
                body: command,
            });
            console.log(`Command sent: ${command}`);
        } else {
            console.warn('Cannot send command: STOMP client not connected');
        }
    }, [connected]);

    return { connected, sendCommand };
};
