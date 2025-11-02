// Importaciones ya existentes
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------------------------------------------------------------------
// 1. FUNCIÓN DE LOGIN ESTÁNDAR (Existente)
// ----------------------------------------------------------------------

exports.login = async (req, res) => {
    // ... (Tu lógica de login estándar con bcrypt.compare) ...
    try {
        const { loginIdentifier, password } = req.body;
        // Buscar usuario por correo o nombre
        const usuario = await Usuario.findOne({
            $or: [{ correo: loginIdentifier }, { nombre: loginIdentifier }]
        });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario o correo no encontrado' });
        }
        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Crear payload del token
        const payload = { id: usuario._id, rol: usuario.rol };
        // Generar token JWT con expiración de 1 día
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// ----------------------------------------------------------------------
// 2. FUNCIÓN DE ACCESO TEMPORAL (NUEVA)
// ----------------------------------------------------------------------

exports.guestLogin = async (req, res) => {
    try {
        // 1. Buscar el usuario predefinido de "Invitado"
        // Busca al usuario por su rol 'invitado' o por su correo/nombre específico
        const invitado = await Usuario.findOne({ rol: 'invitado' });
        
        if (!invitado) {
            // Error si el usuario 'invitado' no ha sido creado en la DB
            return res.status(500).json({ 
                message: 'El modo invitado no está configurado en la base de datos.' 
            });
        }

        // 2. Crear payload del token.
        // El rol 'invitado' es crucial aquí.
        const payload = {
            id: invitado._id,
            rol: 'invitado' // Aseguramos que el token refleje el rol limitado
        };

        // 3. Generar un token JWT (quizás con una expiración más corta, ej. 1 hora)
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 4. Enviar respuesta con el token.
        return res.status(200).json({ 
            token: token,
            message: 'Acceso temporal de invitado concedido.'
        });

    } catch (error) {
        console.error('Error en guestLogin:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
