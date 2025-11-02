const Prestamo = require('../models/prestamo.model');
const Usuario = require('../models/usuario.model');
const Libro = require('../models/libro.model');
const Historico = require('../models/historico.model');

// Obtener todos los préstamos
exports.getPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.find()
      .populate('usuario')
      .populate('libro');
    return res.status(200).json(prestamos);
  } catch (error) {
    console.error('Error al obtener los préstamos:', error);
    return res.status(500).json({ message: 'Error al obtener los préstamos', error: error.message });
  }
};

// Crear un nuevo préstamo
exports.createPrestamo = async (req, res) => {
  try {
    const { usuario: usuarioId, libro: libroId } = req.body;

    // Validar usuario
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.situacion !== 'Vigente') {
      return res.status(403).json({
        message: `El usuario ${usuario.nombre} tiene un estado de "${usuario.situacion}" y no puede pedir préstamos.`
      });
    }

    // Validar libro
    const libro = await Libro.findById(libroId);
    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    if (libro.cantidad <= 0) {
      return res.status(400).json({ message: `No quedan copias disponibles de "${libro.titulo}"` });
    }

    // Crear préstamo
    const nuevoPrestamo = new Prestamo(req.body);
    await nuevoPrestamo.save();

    // Actualizar usuario y libro
    usuario.situacion = 'Prestamo Activo';
    await usuario.save();

    libro.cantidad -= 1;
    await libro.save();

    // Devolver préstamo con datos poblados
    const prestamoPopulado = await Prestamo.findById(nuevoPrestamo._id)
      .populate('usuario')
      .populate('libro');

    return res.status(201).json(prestamoPopulado);

  } catch (error) {
    console.error('Error al crear el préstamo:', error);
    return res.status(400).json({ message: 'Error al crear el préstamo', error: error.message });
  }
};

// Archivar un préstamo (pasar a histórico)
exports.archivarPrestamo = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const prestamo = await Prestamo.findById(req.params.id);

    if (!prestamo) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    // Determinar estado final (a tiempo o atrasado)
    let estadoFinal = 'A tiempo';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (prestamo.fechaDevolucion && hoy > prestamo.fechaDevolucion) {
      estadoFinal = 'Atrasado';
    }

    // Crear registro histórico
    const nuevoHistorico = new Historico({
      usuario: prestamo.usuario,
      libro: prestamo.libro,
      fechaPrestamo: prestamo.fechaPrestamo,
      fechaDevolucionEstimada: prestamo.fechaDevolucion,
      fechaDevolucionReal: new Date(),
      estadoEntrega: estadoFinal,
      observaciones: observaciones || 'Sin observaciones'
    });
    await nuevoHistorico.save();

    // Eliminar préstamo actual y devolver libro
    await Prestamo.findByIdAndDelete(prestamo._id);
    await Libro.findByIdAndUpdate(prestamo.libro, { $inc: { cantidad: 1 } });

    // Actualizar estado del usuario si ya no tiene más préstamos
    const otrosPrestamos = await Prestamo.countDocuments({ usuario: prestamo.usuario });
    if (otrosPrestamos === 0) {
      const usuario = await Usuario.findById(prestamo.usuario);
      if (usuario?.situacion === 'Prestamo Activo') {
        await Usuario.findByIdAndUpdate(prestamo.usuario, { situacion: 'Vigente' });
      }
    }

    return res.status(200).json({ message: 'Préstamo archivado y libro re-abastecido' });

  } catch (error) {
    console.error('Error al archivar el préstamo:', error);
    return res.status(500).json({ message: 'Error al archivar el préstamo', error: error.message });
  }
};

// Eliminar préstamo erróneo (corrección manual)
exports.eliminarPrestamoCorrecion = async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    // Re-abastecer libro
    await Libro.findByIdAndUpdate(prestamo.libro, { $inc: { cantidad: 1 } });

    // Eliminar el préstamo
    await Prestamo.findByIdAndDelete(prestamo._id);

    // Actualizar estado del usuario
    const otrosPrestamos = await Prestamo.countDocuments({ usuario: prestamo.usuario });
    if (otrosPrestamos === 0) {
      const usuario = await Usuario.findById(prestamo.usuario);
      if (usuario?.situacion === 'Prestamo Activo') {
        await Usuario.findByIdAndUpdate(prestamo.usuario, { situacion: 'Vigente' });
      }
    }

    return res.status(200).json({ message: 'Préstamo erróneo eliminado y libro re-abastecido' });

  } catch (error) {
    console.error('Error al borrar el préstamo:', error);
    return res.status(500).json({ message: 'Error al borrar el préstamo', error: error.message });
  }
};

// Obtener historial de préstamos
exports.getHistorial = async (req, res) => {
  try {
    const historial = await Historico.find()
      .populate('usuario')
      .populate('libro')
      .sort({ fechaDevolucion: -1 });

    return res.status(200).json(historial);

  } catch (error) {
    console.error('Error al obtener el historial:', error);
    return res.status(500).json({ message: 'Error al obtener el historial', error: error.message });
  }
};

// Actualizar un préstamo
exports.updatePrestamo = async (req, res) => {
  try {
    const prestamoActualizado = await Prestamo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('usuario')
      .populate('libro');

    if (!prestamoActualizado) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    return res.status(200).json(prestamoActualizado);

  } catch (error) {
    console.error('Error al actualizar el préstamo:', error);
    return res.status(400).json({ message: 'Error al actualizar el préstamo', error: error.message });
  }
};
