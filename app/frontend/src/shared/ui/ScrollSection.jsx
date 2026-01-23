import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente utilitário para animação de entrada ao scrollar.
 * Segue o OCP (Open/Closed Principle) ao permitir qualquer children.
 */
const ScrollSection = ({ children, id, className = "" }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`flex flex-col justify-center scroll-mt-24 ${className}`}
    >
        {children}
    </motion.div>
);

export default ScrollSection;
