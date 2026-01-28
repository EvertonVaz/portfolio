import { HashLink } from 'react-router-hash-link';
import { useTranslation } from 'react-i18next';

const Logo = () => {
    const { t } = useTranslation();
    return (
        <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
            <HashLink smooth to="/#home" className="flex items-center">
                <span className="w-2 h-6 bg-white mr-1 block"></span>
                <span className="text-white">{t('shared.name')}</span>
            </HashLink>
        </div>
    );
};

export default Logo;
