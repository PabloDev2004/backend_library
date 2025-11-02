const Usuario = require('../models/usuario.model');

// Obtener lista de usuarios (con búsqueda opcional)
exports.getUsuarios = async (req, res) => {
  try {
    const { search } = req.query;
    let filtro = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filtro = { $or: [{ nombre: regex }, { rut: regex }] };
    }

    const usuarios = await Usuario.find(filtro);
    return res.status(200).json(usuarios);

  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    return res.status(201).json(usuarioGuardado);

  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// Actualizar usuario existente
exports.updateUsuario = async (req, res) => {
  try {
    const { password, ...otrosDatos } = req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualiza los campos excepto la contraseña
    Object.assign(usuario, otrosDatos);

    // Solo actualiza la contraseña si fue enviada
    if (password && password.trim().length > 0) {
      usuario.password = password;
    }

    const usuarioActualizado = await usuario.save();
    return res.status(200).json(usuarioActualizado);

  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return res.status(400).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No devolver la contraseña
    usuario.password = undefined;
    return res.status(200).json(usuario);

  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};
