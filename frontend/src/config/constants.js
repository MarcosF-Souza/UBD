/**
 * Application configuration constants
 * Reads from environment variables set in .env file
 */

// API base URL - defaults to localhost if not set
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
    energia: {
        rendimento: `${API_BASE_URL}/api/energia/rendimento/`,
        dados: `${API_BASE_URL}/api/energia/dados/`,
    },
    saude: {
        correlacao: `${API_BASE_URL}/api/saude/correlacao-variaveis/`,
        mapaCalor: `${API_BASE_URL}/api/saude/mapa-calor-correlacao/`,
    },
};
