import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTerminalSocket } from '../hooks/useTerminalSocket';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { parseResponse } from '../domain/parser';
import TerminalHistory from './TerminalHistory';
import TerminalInput from './TerminalInput';

/**
 * Componente principal do Terminal (Orquestrador).
 * Segui o SOLID (SRP, OCP) decompondo logicamente as partes.
 */
const Terminal = () => {
    const { t } = useTranslation();
    const [historyLines, setHistoryLines] = useState([
        { type: 'output', content: t('terminal.initializing') },
        { type: 'output', content: t('terminal.welcome') },
    ]);
    const [input, setInput] = useState('');

    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    // Gestão de histórico delegada ao Hook (SOLID: SRP)
    const { addToHistory, navigateUp, navigateDown } = useCommandHistory();

    // Gestão de conexão delegada ao Hook especializado
    const { isConnected: connected, send: sendCommand, on, off } = useTerminalSocket();

    useEffect(() => {
        const handleMessage = (msg) => {
            const parsedWords = parseResponse(msg);
            const content = parsedWords.length > 0 ? parsedWords.join(' ') : msg;
            setHistoryLines(prev => [...prev, { type: 'output', content }]);
        };

        on('message', handleMessage);
        return () => off('message', handleMessage);
    }, [on, off]);

    const focusInput = () => inputRef.current?.focus();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) return;

            if (cmd.toLowerCase() === 'clear') {
                setHistoryLines([]);
                setInput('');
                return;
            }

            if (cmd.toLowerCase() === 'help') {
                setHistoryLines(prev => [
                    ...prev,
                    { type: 'input', content: cmd },
                    { type: 'output', content: t('terminal.local_commands') },
                    { type: 'output', content: t('terminal.remote_commands') }
                ]);
                setInput('');
                return;
            }

            // Fluxo normal de comando
            setHistoryLines(prev => [...prev, { type: 'input', content: cmd }]);
            addToHistory(cmd);

            if (connected) {
                sendCommand(cmd);
            } else {
                setHistoryLines(prev => [...prev, { type: 'output', content: t('terminal.error_not_connected') }]);
            }

            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevCmd = navigateUp(input);
            if (prevCmd !== null) setInput(prevCmd);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextCmd = navigateDown();
            if (nextCmd !== null) setInput(nextCmd);
        }
    };

    // Auto-scroll ao adicionar linhas
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [historyLines]);

    // Foco inicial
    useEffect(() => {
        focusInput();
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8" onClick={focusInput}>
            <div className="terminal-container overflow-hidden bg-black/90 border border-white/10 rounded-lg shadow-2xl shadow-accent-pink/5">
                {/* Header Estilizado */}
                <div className="bg-white/95 text-black p-2 flex justify-between items-center px-4 cursor-default select-none">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                        born2code@bash — 42sp
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 border border-black/20 rounded-full"></div>
                        <div className="w-2.5 h-2.5 border border-black/20 rounded-full bg-black/5"></div>
                    </div>
                </div>

                {/* Área de Conteúdo */}
                <div
                    ref={terminalRef}
                    className="flex-1 p-5 font-mono text-sm overflow-y-auto scrollbar-hide text-white selection:bg-accent-green selection:text-black min-h-[450px] cursor-text"
                >
                    <TerminalHistory lines={historyLines} />

                    <TerminalInput
                        ref={inputRef}
                        value={input}
                        onChange={setInput}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
        </div>
    );
};

export default Terminal;
