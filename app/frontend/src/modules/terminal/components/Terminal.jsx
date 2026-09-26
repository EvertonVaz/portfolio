import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

// Mesmo tamanho do PTY no sandbox (terminfo xterm-256color: 80x24)
const COLS = 80;
const ROWS = 24;

const THEME = {
    background: '#000000',
    foreground: '#ffffff',
    cursor: '#ff00ff',
    selectionBackground: '#39ff1455',
    green: '#39ff14',
    brightGreen: '#39ff14',
    magenta: '#ff00ff',
    cyan: '#00ffff',
};

const dim = (text) => `\x1b[2m${text}\x1b[0m`;

/**
 * Terminal de verdade: xterm.js ligado ao PTY do minishell na jaula.
 * Cada tecla vai crua para o backend (Tab, setas, Ctrl+C são do readline/minishell)
 * e a saída do PTY volta em bytes, que o xterm.js interpreta.
 */
const Terminal = ({ socket }) => {
    const { t } = useTranslation();
    const { send, on, off, connect } = socket;

    const containerRef = useRef(null);
    const xtermRef = useRef(null);
    // Teclas digitadas sem sessão (exit, ociosidade): abrem outra e vão junto ao conectar
    const pendingRef = useRef('');

    useEffect(() => {
        const term = new XTerm({
            cols: COLS,
            rows: ROWS,
            cursorBlink: true,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 14,
            theme: THEME,
        });
        term.open(containerRef.current);
        term.writeln(`\x1b[32m${t('terminal.initializing')}\x1b[0m`);
        term.writeln(`\x1b[32m${t('terminal.welcome')}\x1b[0m`);
        term.writeln(dim(t('terminal.hint')));
        term.focus();
        xtermRef.current = term;

        return () => term.dispose();
    }, [t]);

    useEffect(() => {
        const sub = xtermRef.current.onData((data) => {
            if (send(data)) return;
            pendingRef.current += data;
            connect();
        });
        return () => sub.dispose();
    }, [send, connect]);

    useEffect(() => {
        const handleOpen = () => {
            if (pendingRef.current && send(pendingRef.current)) pendingRef.current = '';
        };
        on('open', handleOpen);
        return () => off('open', handleOpen);
    }, [on, off, send]);

    useEffect(() => {
        // Mensagens de controle do backend chegam como texto; a saída do PTY, como bytes
        const statusMap = {
            '[PROCESS TERMINATED]': t('terminal.status_terminated'),
            '[SESSION IDLE]': t('terminal.status_idle'),
            '[ERROR: SANDBOX UNAVAILABLE]': t('terminal.error_sandbox'),
            '[ERROR: INPUT TOO LONG]': t('terminal.error_input_too_long'),
        };

        const handleMessage = (msg) => {
            const term = xtermRef.current;
            if (msg instanceof ArrayBuffer) {
                term.write(new Uint8Array(msg));
            } else {
                term.writeln(`\r\n\x1b[35m${statusMap[msg] ?? msg}\x1b[0m`);
            }
        };

        on('message', handleMessage);
        return () => off('message', handleMessage);
    }, [on, off, t]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="terminal-container overflow-hidden bg-black/90 border border-white/10 rounded-lg shadow-2xl shadow-accent-pink/5">
                {/* Header Estilizado */}
                <div className="bg-white/95 text-black p-2 flex justify-between items-center px-4 cursor-default select-none">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                        born2code@minishell — 42sp
                    </span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 border border-black/20 rounded-full"></div>
                        <div className="w-2.5 h-2.5 border border-black/20 rounded-full bg-black/5"></div>
                    </div>
                </div>

                {/* 80 colunas fixas como o PTY; em tela estreita, rola na horizontal */}
                <div className="p-4 bg-black overflow-x-auto">
                    <div ref={containerRef} className="w-fit" />
                </div>
            </div>
        </div>
    );
};

export default Terminal;
