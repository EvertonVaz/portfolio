import React from 'react';

const Hacklog = () => {
    const logs = [
        { date: '2026.01.14', title: 'SYSTEM_BOOT: NEW_YEAR_PORTFOLIO', status: 'COMPLETE' },
        { date: '2026.01.12', title: 'REFACTORING_AESTHETICS: PUNK_MODE', status: 'ACTIVE' },
        { date: '2026.01.10', title: 'RESEARCH: FRACTAL_GEOMETRY_IN_REACT', status: 'PENDING' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto p-8 font-mono">
            <h2 className="section-title">
                <span className="w-8 h-8 bg-accent-pink"></span>
                Hacklog.status
            </h2>

            <div className="space-y-4">
                {logs.map((log, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-l-4 border-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="flex items-center gap-6">
                            <span className="text-white/40 text-xs">{log.date}</span>
                            <span className="font-bold group-hover:text-accent-blue transition-colors uppercase tracking-tight">
                                {log.title}
                            </span>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <span className={`text-[10px] px-2 py-0.5 border ${log.status === 'COMPLETE' ? 'border-accent-green text-accent-green' : 'border-accent-pink text-accent-pink'}`}>
                                {log.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Hacklog;
