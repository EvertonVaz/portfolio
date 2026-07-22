import { useCallback, useRef } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../utils/FractalShaders';

/**
 * Hook para gerenciar a renderização do fractal utilizando WebGL (GPU).
 */
export const useFractalRenderer = () => {
    const glRef = useRef(null);
    const programRef = useRef(null);
    const bufferRef = useRef(null);

    const initWebGL = (canvas) => {
        const gl = canvas.getContext('webgl');
        if (!gl) return null;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        const program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        return { gl, program, positionBuffer };
    };

    /**
     * Divide um número 64-bit (JS double) em dois floats de 32-bit (high/low)
     * para emulação de precisão dupla na GPU.
     */
    const splitDouble = (val) => {
        const high = Math.fround(val);
        const low = val - high;
        return [high, low];
    };

    const render = useCallback((canvas, params) => {
        if (!canvas) return;

        if (!glRef.current) {
            const res = initWebGL(canvas);
            if (!res) return;
            glRef.current = res.gl;
            programRef.current = res.program;
            bufferRef.current = res.positionBuffer;
        }

        const gl = glRef.current;
        const program = programRef.current;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const { type, zoom, offsetX, offsetY, maxIterations, juliaReal, juliaImag } = params;

        // Envio de Uniforms com Precisão Dupla (High/Low)
        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
        gl.uniform2f(gl.getUniformLocation(program, "u_zoom"), ...splitDouble(zoom));
        gl.uniform2f(gl.getUniformLocation(program, "u_offsetX"), ...splitDouble(offsetX));
        gl.uniform2f(gl.getUniformLocation(program, "u_offsetY"), ...splitDouble(offsetY));
        gl.uniform1i(gl.getUniformLocation(program, "u_maxIterations"), maxIterations);
        gl.uniform1i(gl.getUniformLocation(program, "u_type"), type === 'mandelbrot' ? 0 : 1);
        gl.uniform2f(gl.getUniformLocation(program, "u_juliaParams"), juliaReal, juliaImag);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }, []);

    const calculateZoomOffset = (mouseX, mouseY, width, height, oldZoom, newZoom, oldOffsetX, oldOffsetY) => {
        // No WebGL, a escala é baseada na altura (height) para manter o aspect ratio.
        // O eixo Y do mouse (top=0) é invertido em relação ao WebGL (bottom=0).
        const scaleOld = 2.0 / (oldZoom * height);
        const scaleNew = 2.0 / (newZoom * height);

        const centerX = oldOffsetX + (mouseX - width / 2) * scaleOld;
        const centerY = oldOffsetY + (height / 2 - mouseY) * scaleOld;

        const newOffsetX = centerX - (mouseX - width / 2) * scaleNew;
        const newOffsetY = centerY - (height / 2 - mouseY) * scaleNew;

        return { newOffsetX, newOffsetY };
    };

    const calculatePanOffset = (dx, dy, width, height, zoom) => {
        const scale = 2.0 / (zoom * height);
        return {
            dOffsetX: -dx * scale,
            dOffsetY: dy * scale // Invertido pois dy positivo no mouse é para baixo
        };
    };

    return { render, calculateZoomOffset, calculatePanOffset };
};
