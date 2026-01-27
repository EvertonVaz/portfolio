import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Utilitário para Scroll To Top em mudanças de rota.
 * Essencial ao usar BrowserRouter para garantir UX consistente.
 */
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Se houver um hash (âncora), não scrollamos para o topo,
        // deixamos o HashLink ou o comportamento padrão lidar com isso.
        if (!hash) {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
