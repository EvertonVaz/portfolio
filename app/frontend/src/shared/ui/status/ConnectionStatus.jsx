import { useTranslation } from 'react-i18next';


const ConnectionStatus = ({ isConnected }) => {
    const { t } = useTranslation();

    return (
        <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${isConnected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? t('philosophers.status_online') : t('philosophers.status_offline')}
        </div>
    )
}

export default ConnectionStatus;
