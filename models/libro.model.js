const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true // elimina espacios innecesarios
  },
  autor: {
    type: String,
    required: [true, 'El autor es obligatorio'],
    trim: true
  },
  genero: {
    type: String,
    default: 'No especificado',
    trim: true
  },
  annio: {
    type: Number,
    min: [0, 'El año no puede ser negativo'],
    max: [new Date().getFullYear(), 'El año no puede ser futuro']
  },
  cantidad: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'La cantidad no puede ser negativa']
  }
}, {
  timestamps: true
});

// 🔹 Asegura que el título y autor se guarden con la primera letra mayúscula (sin alterar datos previos)
libroSchema.pre('save', function (next) {
  if (this.titulo) {
    this.titulo = this.titulo.charAt(0).toUpperCase() + this.titulo.slice(1);
  }
  if (this.autor) {
    this.autor = this.autor.charAt(0).toUpperCase() + this.autor.slice(1);
  }
  next();
});

module.exports = mongoose.model('Libro', libroSchema);
