import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, Utensils, Moon, Skull } from 'lucide-react';

export default function PhilosopherCard({ data }) {
    const { t } = useTranslation();
    const { id, status, lastAction } = data;

    const STATUS_CONFIG = {
        thinking: { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', icon: Brain, label: t('philosophers.card_status_thinking') },
        eating: { color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10', icon: Utensils, label: t('philosophers.card_status_eating') },
        sleeping: { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', icon: Moon, label: t('philosophers.card_status_sleeping') },
        waiting: { color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', icon: Utensils, label: t('philosophers.card_status_waiting') },
        dead: { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/20', icon: Skull, label: t('philosophers.card_status_dead') }
    };

    const config = STATUS_CONFIG[status] || STATUS_CONFIG.thinking;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-4 rounded-lg border ${config.border} ${config.bg} backdrop-blur-sm transition-colors duration-300`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">ID_0{id}</span>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${config.border} ${config.color}`}>
                        {config.label}
                    </div>
                </div>
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            <div className="space-y-2">
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    {/* Simple activity indicator pulse */}
                    <motion.div
                        className={`h-full ${config.color.replace('text-', 'bg-')}`}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: '100%' }}
                    />
                </div>
                <p className="text-xs font-mono text-gray-400 truncate">
                    {lastAction || t('philosophers.card_initializing')}
                </p>
            </div>

            {status === 'eating' && (
                <motion.div
                    layoutId={`glow-${id}`}
                    className={`absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] pointer-events-none border ${config.border}`}
                    animate={{ boxShadow: `0 0 20px ${config.color === 'text-green-400' ? '#4ade8055' : 'transparent'}` }}
                />
            )}
        </motion.div>
    );
}
