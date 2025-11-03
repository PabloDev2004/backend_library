const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');

// --- LÓGICA DE LOGIN MEJORADA (SIN HASHEO) ---
exports.login = async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body;

        // 1. Validar que los datos fueron enviados
        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'El usuario y la contraseña son requeridos.' });
        }

        // 2. Buscar al usuario por correo o nombre de usuario
        const usuario = await Usuario.findOne({
            $or: [{ correo: loginIdentifier }, { nombre: loginIdentifier }]
        });

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. ⚠️ Comparación directa de la contraseña (INSEGURA, solo para la demo)
        const passwordValida = (password === usuario.password); 
        
        if (!passwordValida) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Crear el token si todo es correcto
        const payload = { id: usuario._id, rol: usuario.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'JWT_SECRET_PARA_PROYECTO_UNI', { expiresIn: '1d' });
        
        // 5. Enviar respuesta exitosa con el token y datos del usuario
        return res.status(200).json({ 
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- FUNCIÓN DE INVITADO PARA PRUEBAS RÁPIDAS ---
exports.guestLogin = async (req, res) => {
    try {
        const tempUser = { 
            _id: 'guest_' + Date.now(), 
            rol: 'lector', // Rol limitado
            nombre: 'Invitado', 
            correo: 'invitado@biblioteca.com'
        };

        const payload = { id: tempUser._id, rol: tempUser.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'JWT_SECRET_PARA_PROYECTO_UNI', { expiresIn: '1h' });

        return res.status(200).json({ 
            token,
            user: tempUser
        });
    } catch (error) {
        console.error('Error en el acceso de invitado:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};