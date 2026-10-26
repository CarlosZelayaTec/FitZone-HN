// frontend/src/services/authService.js
import API_URL from './api.js';

// 1. Función para registrar un nuevo usuario
export const registrarUsuario = async (datosUsuario) => {
    try {
        const respuesta = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convertimos los datos del formulario a texto JSON
            body: JSON.stringify(datosUsuario) 
        });
        
        const data = await respuesta.json();
        return data;
    } catch (error) {
        console.error("Error al conectar con el servidor en el registro:", error);
    }
};

// 2. Función para iniciar sesión (Login)
export const iniciarSesion = async (credenciales) => {
    try {
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credenciales)
        });
        
        const data = await respuesta.json();
        return data;
    } catch (error) {
        console.error("Error al conectar con el servidor en el login:", error);
    }
};