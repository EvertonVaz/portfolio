/**
 * FractalShaders.js - Shaders GLSL com Emulação de Precisão Dupla (FP64).
 * Permite zoom profundo (até 10^15) superando o limite de 32-bits do WebGL.
 */

export const VERTEX_SHADER = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_position * 0.5 + 0.5;
    }
`;

export const FRAGMENT_SHADER = `
    precision highp float;
    varying vec2 v_texCoord;

    uniform vec2 u_resolution;
    uniform int u_maxIterations;
    uniform int u_type;
    uniform vec2 u_juliaParams;

    // Uniforms de Precisão Dupla (High/Low)
    uniform vec2 u_zoom;        // u_zoom.x = high, u_zoom.y = low
    uniform vec2 u_offsetX;     // u_offsetX.x = high, u_offsetX.y = low
    uniform vec2 u_offsetY;     // u_offsetY.x = high, u_offsetY.y = low

    // Aritmética Double-Single (DS)
    // Representa um número como a soma de dois floats: high + low

    vec2 ds_set(float a) {
        return vec2(a, 0.0);
    }

    vec2 ds_add(vec2 d1, vec2 d2) {
        float s = d1.x + d2.x;
        float t = (s - d1.x) - d2.x;
        float low = (d1.x - (s - t)) + (d2.x - t) + (d1.y + d2.y);
        return vec2(s + low, low - ((s + low) - s));
    }

    vec2 ds_sub(vec2 d1, vec2 d2) {
        return ds_add(d1, vec2(-d2.x, -d2.y));
    }

    vec2 ds_mul(vec2 d1, vec2 d2) {
        float con = 8193.0;
        float a1 = d1.x * con;
        float a2 = a1 - (a1 - d1.x);
        float a3 = d1.x - a2;
        float b1 = d2.x * con;
        float b2 = b1 - (b1 - d2.x);
        float b3 = d2.x - b2;
        float c11 = d1.x * d2.x;
        float c21 = a2 * b2 - c11 + a2 * b3 + a3 * b2 + a3 * b3 + d1.x * d2.y + d1.y * d2.x;
        return vec2(c11 + c21, c21 - ((c11 + c21) - c11));
    }

    // Helper para converter HSL para RGB
    vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }

    void main() {
        // Coordenadas normalizadas [-0.5, 0.5]
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv = v_texCoord - 0.5;
        uv.x *= aspect;

        // u_zoom.x é o zoom base (32-bit float)
        // Precisamos calcular a posição no plano complexo com precisão dupla

        // complexCoord = (uv / scale) + offset
        float scaleVal = 0.5 * u_zoom.x;

        // Conversão de UV para DS
        vec2 uvX = ds_set(uv.x / scaleVal);
        vec2 uvY = ds_set(uv.y / scaleVal);

        vec2 cx = ds_add(uvX, u_offsetX);
        vec2 cy = ds_add(uvY, u_offsetY);

        vec2 zx, zy;
        vec2 cx_val, cy_val;

        if (u_type == 0) { // Mandelbrot
            zx = ds_set(0.0);
            zy = ds_set(0.0);
            cx_val = cx;
            cy_val = cy;
        } else { // Julia
            zx = cx;
            zy = cy;
            cx_val = ds_set(u_juliaParams.x);
            cy_val = ds_set(u_juliaParams.y);
        }

        int iterations = 0;
        for (int i = 0; i < 1000; i++) {
            if (i >= u_maxIterations) break;

            // z = z^2 + c
            // (zx + i*zy)^2 = (zx^2 - zy^2) + i*(2*zx*zy)

            vec2 zx2 = ds_mul(zx, zx);
            vec2 zy2 = ds_mul(zy, zy);

            // x = (zx^2 - zy^2) + cx
            vec2 next_zx = ds_add(ds_sub(zx2, zy2), cx_val);

            // y = 2*zx*zy + cy
            vec2 zxzy = ds_mul(zx, zy);
            vec2 next_zy = ds_add(ds_add(zxzy, zxzy), cy_val);

            zx = next_zx;
            zy = next_zy;

            // check: |z|^2 > 4
            if (zx.x * zx.x + zy.x * zy.x > 4.0) break;

            iterations++;
        }

        if (iterations == u_maxIterations) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            float hue = float(iterations) / float(u_maxIterations);
            vec3 rgb = hsl2rgb(vec3(hue, 0.8, 0.5));
            gl_FragColor = vec4(rgb, 1.0);
        }
    }
`;
