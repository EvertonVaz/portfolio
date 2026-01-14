import React, { useState, useEffect, useRef } from 'react';

const Terminal = () => {
    const [history, setHistory] = useState([
        { type: 'output', content: 'INITIALIZING BORN2CODE_OS...' },
        { type: 'output', content: 'WELCOME GRADUATE OF 42 SÃO PAULO.' },
        { type: 'output', content: 'TYPE "HELP" FOR AVAILABLE COMMANDS.' },
    ]);
    const [input, setInput] = useState('');
    const terminalRef = useRef(null);

    const handleCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            const newHistory = [...history, { type: 'input', content: input }];

            switch (cmd) {
                case 'help':
                    newHistory.push({ type: 'output', content: 'AVAILABLE COMMANDS: ABOUT, WORK, SKILLS, CLEAR, CONTACT' });
                    break;
                case 'about':
                    newHistory.push({ type: 'output', content: 'DYNAMIC PROFILE: PUNK ENTHUSIAST, INDIE SUPPORTER, MATH & PHYSICS ADMIRER.' });
                    break;
                case 'work':
                    newHistory.push({ type: 'output', content: 'LOADING PORTFOLIO ITEMS... [ERROR: DATABASE NOT CONNECTED]' });
                    break;
                case 'skills':
                    newHistory.push({ type: 'output', content: 'C, C++, REACT, VITE, TAILWIND, REBELLION, LOGIC.' });
                    break;
                case 'clear':
                    setHistory([]);
                    setInput('');
                    return;
                case 'contact':
                    newHistory.push({ type: 'output', content: 'EMAIL: CONTACT@BORN2CODE.RESISTENCE' });
                    break;
                default:
                    if (cmd !== '') {
                        newHistory.push({ type: 'output', content: `COMMAND NOT FOUND: ${cmd}` });
                    }
            }

            setHistory(newHistory);
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
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terminal;
