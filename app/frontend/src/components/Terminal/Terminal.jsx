import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRabbitMQ } from '../../hooks/useRabbitMQ';
import { parseResponse } from '../../utils/parser';

const Terminal = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([
        { type: 'output', content: t('terminal.initializing') },
        { type: 'output', content: t('terminal.welcome') },
    ]);
    const [input, setInput] = useState('');
    const terminalRef = useRef(null);

    const onMessageReceived = useCallback((msg) => {
        const parsedWords = parseResponse(msg);
        const content = parsedWords.length > 0 ? parsedWords.join(' ') : msg;

        setHistory(prev => [...prev, { type: 'output', content }]);
    }, []);

    const { connected, sendCommand } = useRabbitMQ(onMessageReceived);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (cmd === '') return;

            const lowerCmd = cmd.toLowerCase();

            if (lowerCmd === 'clear') {
                setHistory([]);
                setInput('');
                return;
            }

            if (lowerCmd === 'help') {
                setHistory(prev => [
                    ...prev,
                    { type: 'input', content: cmd },
                    { type: 'output', content: t('terminal.local_commands') },
                    { type: 'output', content: t('terminal.remote_commands') }
                ]);
                setInput('');
                return;
            }

            setHistory(prev => [...prev, { type: 'input', content: cmd }]);

            if (connected) {
                sendCommand(cmd);
            } else {
                setHistory(prev => [...prev, { type: 'output', content: t('terminal.error_not_connected') }]);
            }

            setInput('');
        }
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="terminal-container overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-white text-black p-2 flex justify-between items-center px-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-tighter">born2code@bash — 42sp</span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 border border-black"></div>
                        <div className="w-3 h-3 border border-black"></div>
                    </div>
                </div>

                {/* Terminal Content */}
                <div
                    ref={terminalRef}
                    className="flex-1 p-4 font-mono text-sm overflow-y-auto scrollbar-hide text-white selection:bg-accent-green selection:text-black"
                >
                    {history.map((line, i) => (
                        <div key={i} className="mb-1 leading-relaxed">
                            {line.type === 'input' ? (
                                <span className="text-accent-pink font-bold">$ {line.content}</span>
                            ) : (
                                <span className="text-accent-green">{line.content}</span>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <span className="text-accent-pink font-bold">$</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleCommand}
                            className="flex-1 bg-transparent border-none outline-none text-white font-mono lowercase"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terminal;
