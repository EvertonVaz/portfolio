import React from 'react';

/**
 * Componente especializado na área de entrada de comandos.
 * Gerencia o prompt e o campo de input.
 */
const TerminalInput = React.forwardRef(({ value, onChange, onKeyDown }, ref) => {
    return (
        <div className="flex items-center gap-2 mt-1">
            <span className="text-accent-pink font-bold">$</span>
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono lowercase"
                autoFocus
                spellCheck="false"
                autoComplete="off"
            />
        </div>
    );
});

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;
