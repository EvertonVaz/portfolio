import { useTranslation } from "react-i18next";

export const GithubCTA = ({ url }) => {
    const { t } = useTranslation();
    return (
        <div className="max-w-6xl mx-auto px-8 mt-12 text-center">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-accent-green text-black font-mono font-bold rounded hover:bg-opacity-90 transition"
            >
                {t('terminal.github_link')}
            </a>
        </div>
    );
};