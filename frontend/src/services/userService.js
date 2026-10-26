// frontend/src/services/userService.js
import API_URL from './api.js';

export const obtenerPerfil = async (token) => {
    try {
        const respuesta = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener perfil:", error);
    }
};