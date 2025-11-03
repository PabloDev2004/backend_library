const Usuario = require('../models/usuario.model');
// const bcrypt = require('bcryptjs'); // Desactivamos la importación de bcrypt
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body;

        // Buscar usuario por correo o nombre
        const usuario = await Usuario.findOne({
            $or: [{ correo: loginIdentifier }, { nombre: loginIdentifier }]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario o correo no encontrado' });
        }

        // ⚠️ ADVERTENCIA: COMPARACIÓN INSEGURA PARA PRUEBAS UNIVERSITARIAS ⚠️
        // En producción, DEBES usar await bcrypt.compare(password, usuario.password);
        const passwordValida = password === usuario.password; 
        
        if (!passwordValida) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Crear payload del token
        const payload = {
            id: usuario._id,
            rol: usuario.rol
        };

        // Generar token JWT con expiración de 1 día
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Enviar respuesta con token
        return res.status(200).json({ token });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};