/**
 * FractalEngine - Lógica matemática pura para cálculo de fractais.
 * Segue o SRP (Single Responsibility Principle) e OCP (Open/Closed Principle).
 */

const FRACTAL_STRATEGIES = {
    mandelbrot: (zx, zy, cx, cy) => {
        // Para Mandelbrot, z começa em 0 e c é o ponto do plano
        return {
            nzx: zx * zx - zy * zy + cx,
            nzy: 2 * zx * zy + cy
        };
    },
    julia: (zx, zy, cx, cy) => {
        // Para Julia, z é o ponto do plano e c é uma constante fixa
        return {
            nzx: zx * zx - zy * zy + cx,
            nzy: 2 * zx * zy + cy
        };
    }
};

/**
 * Calcula a iteração para um ponto específico.
 */
export const calculateIteration = (type, x, y, maxIterations, params = {}) => {
    let zx, zy, cx, cy;

    if (type === 'mandelbrot') {
        zx = 0;
        zy = 0;
        cx = x;
        cy = y;
    } else if (type === 'julia') {
        zx = x;
        zy = y;
        cx = params.juliaReal ?? -0.7;
        cy = params.juliaImag ?? 0.27;
    } else {
        return 0;
    }

    const iterate = FRACTAL_STRATEGIES[type] || FRACTAL_STRATEGIES.mandelbrot;

    let iteration = 0;
    while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
        const { nzx, nzy } = iterate(zx, zy, cx, cy);
        zx = nzx;
        zy = nzy;
        iteration++;
    }

    return iteration;
};

/**
 * Converte HSL para RGB.
 */
export const hslToRgb = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
