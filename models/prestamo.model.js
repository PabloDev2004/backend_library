const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario/rut es obligatorio']
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro',
    required: [true, 'El libro es obligatorio']
  },
  fechaPrestamo: {
    type: Date,
    required: [true, 'La fecha de préstamo es obligatoria'],
    default: Date.now // por si se olvida incluirla
  },
  fechaDevolucion: {
    type: Date,
    required: [true, 'La fecha de devolución es obligatoria'],
    validate: {
      validator: function (value) {
        // Valida que la fecha de devolución sea posterior al préstamo
        return !this.fechaPrestamo || value > this.fechaPrestamo;
      },
      message: 'La fecha de devolución debe ser posterior a la fecha de préstamo'
    }
  }
}, {
  timestamps: true
});

// 🔹 Hook opcional: asegura consistencia si el préstamo se guarda sin fecha
prestamoSchema.pre('save', function (next) {
  if (!this.fechaPrestamo) this.fechaPrestamo = new Date();
  next();
});

module.exports = mongoose.model('Prestamo', prestamoSchema);
