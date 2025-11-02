const Libro = require('../models/libro.model');

// Obtener todos los libros (con búsqueda opcional)
exports.getLibros = async (req, res) => {
  try {
    const { search } = req.query;
    let filtro = {};

    // Si hay texto de búsqueda, se crea un filtro con expresiones regulares
    if (search) {
      const regex = new RegExp(search, 'i'); 
      filtro = {
        $or: [{ titulo: regex }, { autor: regex }]
      };
    }

    const libros = await Libro.find(filtro);
    return res.status(200).json(libros);

  } catch (error) {
    console.error('Error al obtener los libros:', error);
    return res.status(500).json({ message: 'Error al obtener los libros', error: error.message });
  }
};

// Crear un nuevo libro
exports.createLibro = async (req, res) => {
  try {
    const nuevoLibro = new Libro(req.body);
    const libroGuardado = await nuevoLibro.save();
    return res.status(201).json(libroGuardado);

  } catch (error) {
    console.error('Error al crear el libro:', error);
    return res.status(400).json({ message: 'Error al crear el libro', error: error.message });
  }
};

// Actualizar un libro por ID
exports.updateLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libroActualizado = await Libro.findByIdAndUpdate(id, req.body, { new: true });

    if (!libroActualizado) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    return res.status(200).json(libroActualizado);

  } catch (error) {
    console.error('Error al actualizar el libro:', error);
    return res.status(400).json({ message: 'Error al actualizar el libro', error: error.message });
  }
};

// Eliminar un libro por ID
exports.deleteLibro = async (req, res) => {
  try {
    const { id } = req.params;

    const libroEliminado = await Libro.findByIdAndDelete(id);

    if (!libroEliminado) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    return res.status(200).json({ message: 'Libro eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar el libro:', error);
    return res.status(500).json({ message: 'Error al eliminar el libro', error: error.message });
  }
};
