const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    lowercase: true,
    unique: true, // Evita duplicados
    trim: true,

    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Por favor ingresa un correo válido'
    ]
  },
  rut: {
    type: String,
    required: [true, 'El RUT es obligatorio'],
    unique: true,
    trim: true
  },
  cargo: {
    type: String,
    enum: ['Estudiante', 'Docente'],
    default: 'Estudiante'
  },
  rol: {
    type: String,
    enum: ['Admin', 'Usuario'],
    default: 'Usuario'
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  situacion: {
    type: String,
    enum: ['Vigente', 'Atrasado', 'Bloqueado', 'Prestamo Activo'],
    default: 'Vigente'
  }
}, {
  timestamps: true
});

// 🔹 Antes de guardar, encripta la contraseña si ha sido modificada
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔹 Método opcional para comparar contraseñas (útil en login)
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
