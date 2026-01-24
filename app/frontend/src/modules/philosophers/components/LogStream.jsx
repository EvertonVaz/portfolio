import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function LogStream({ logs }) {
    const { t } = useTranslation();
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-[300px] rounded-lg border border-gray-800 bg-black/80 font-mono text-xs overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50 text-gray-500 text-[10px] uppercase tracking-wider">
                {t('philosophers.log_title')}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
                {logs.length === 0 && (
                    <div className="text-gray-700 italic">{t('philosophers.log_waiting')}</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="text-gray-400 border-l-2 border-transparent hover:border-blue-900 pl-2">
                        <span className="opacity-50 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
