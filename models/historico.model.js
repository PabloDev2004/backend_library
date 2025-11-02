const mongoose = require('mongoose');

const historicoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  libro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Libro',
    required: true
  },
  fechaPrestamo: {
    type: Date,
    required: true
  },
  fechaDevolucionReal: {
    type: Date,
    default: null 
  },
  fechaDevolucionEstimada: {
    type: Date
  },
  estadoEntrega: { 
    type: String,
    enum: ['A tiempo', 'Atrasado'],
    default: null 
  },
  observaciones: {
    type: String,
    default: 'Sin observaciones'
  }
}, { timestamps: true });

// Cálculo automático del estado según las fechas (sin alterar el flujo general)
historicoSchema.pre('save', function (next) {
  if (this.fechaDevolucionEstimada && this.fechaDevolucionReal) {
    this.estadoEntrega = this.fechaDevolucionReal > this.fechaDevolucionEstimada
      ? 'Atrasado'
      : 'A tiempo';
  }
  next();
});

module.exports = mongoose.model('Historico', historicoSchema);
