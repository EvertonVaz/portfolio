import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            nav: {
                home: 'Home',
                terminal: 'Terminal',
                work: 'Work',
                hacklog: 'Hacklog',
                contact: 'Contact',
            },
            hero: {
                born2code: 'born2code',
                description: 'Software Engineer passionate about complex systems, <1>fractals</1> and the <3>indie</3> culture aesthetic. Ex-entrepreneur with a pragmatic and curious outlook, exploring the intersection of technology, science and philosophy to build impactful solutions.',
                tag_discipline: '# DISCIPLINE:',
                tag_discipline_content: 'PUNK. HARDCORE. INDEPENDENT.',
                tag_logic: '# LOGIC:',
                tag_logic_content: 'MATH. PHYSICS. FRACTALS.',
                tag_vision: '# VISION:',
                tag_vision_content: 'HISTORY. PHILOSOPHY. STREET ART.',
                under_construction: 'site under construction',
            },
            contact: {
                title: 'get in touch',
            },
            work: {
                title: 'work.archives',
                items_count: '({{count}} items)',
                view_project: 'view project',
                projects: {
                    p01: {
                        title: 'Minishell',
                        desc: 'A minimalist Unix shell implementation in C, exploring process management and parsing.',
                        path: '/terminal',
                        type: 'internal'
                    },
                    p02: {
                        title: 'Transcending Logic',
                        desc: 'Exploring fractals and mathematical patterns via low-level graphics.',
                        path: '#',
                        type: 'external'
                    },
                    p03: {
                        title: 'Independent Noise',
                        desc: 'A platform for the underground indie scene.',
                        path: '#',
                        type: 'external'
                    }
                }
            },
            terminal: {
                initializing: 'INITIALIZING MINISHELL...',
                welcome: 'WELCOME A PROJECT OF 42 SÃO PAULO.',
                local_commands: 'LOCAL COMMANDS: HELP, CLEAR',
                remote_commands: 'REMOTE COMMANDS: "ls", "pwd", "echo", "cat", "exit", "whoami"',
                error_not_connected: '[ERROR: TERMINAL NOT CONNECTED TO BACKEND]',
                lab_description: 'This project is an implementation of a minimalist Unix shell developed in C, as part of the 42 curriculum. The goal is to replicate the basic functionality of Bash, handling command reading, parsing, execution and process management.',
                lab_obs: 'Note: Few commands are released on the backend, type help to see the full list.',
                github_link: 'GitHub Repository',
            }
        }
    },
    pt: {
        translation: {
            nav: {
                home: 'Início',
                terminal: 'Terminal',
                work: 'Trabalho',
                hacklog: 'Hacklog',
                contact: 'Contato',
            },
            hero: {
                born2code: 'born2code',
                description: 'Engenheiro de Software apaixonado por sistemas complexos, <1>fractais</1> e a estética da cultura <3>indie</3>. Ex-empreendedor com olhar pragmático e curioso, explorando a interseção entre tecnologia, ciência e filosofia para construir soluções de impacto.',
                tag_discipline: '# DISCIPLINA:',
                tag_discipline_content: 'PUNK. HARDCORE. INDEPENDENTE.',
                tag_logic: '# LÓGICA:',
                tag_logic_content: 'MATEMÁTICA. FÍSICA. FRACTAIS.',
                tag_vision: '# VISÃO:',
                tag_vision_content: 'HISTÓRIA. FILOSOFIA. ARTE DE RUA.',
                under_construction: 'site em construção',
            },
            contact: {
                title: 'entre em contato',
            },
            work: {
                title: 'trabalhos.arquivos',
                items_count: '({{count}} itens)',
                view_project: 'ver projeto',
                projects: {
                    p01: {
                        title: 'Minishell',
                        desc: 'Uma implementação minimalista de um shell Unix em C, explorando gerenciamento de processos e parsing.',
                        path: '/terminal',
                        type: 'internal'
                    },
                    p02: {
                        title: 'Transcending Logic',
                        desc: 'Explorando fractais e padrões matemáticos via gráficos de baixo nível.',
                        path: '#',
                        type: 'external'
                    },
                    p03: {
                        title: 'Som Independente',
                        desc: 'Uma plataforma para a cena indie underground.',
                        path: '#',
                        type: 'external'
                    }
                }
            },
            terminal: {
                initializing: 'INICIALIZANDO MINISHELL...',
                welcome: 'BEM-VINDO A UM PROJETO DA 42 SÃO PAULO.',
                local_commands: 'COMANDOS LOCAIS: HELP, CLEAR',
                remote_commands: 'COMANDOS REMOTOS: "ls", "pwd", "echo", "cat", "exit", "whoami"',
                error_not_connected: '[ERRO: TERMINAL NÃO CONECTADO AO BACKEND]',
                lab_description: 'Este projeto é uma implementação de um shell Unix minimalista desenvolvido em C, como parte do currículo da 42. O objetivo é replicar o funcionamento básico do Bash, lidando com a leitura de comandos, parsing, execução e gerenciamento de processos.',
                lab_obs: 'Obs.: Poucos comandos estão liberados no backend, digite help para ver a lista completa.',
                github_link: 'Repositório GitHub',
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
