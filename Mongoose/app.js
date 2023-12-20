const mongoose = require('mongoose');
const readline = require('readline');

// Configurar la conexión a la base de datos
mongoose.connect('mongodb://localhost/altared', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el esquema y modelo de Producto
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  idproveedor: { type: String, required: true },
  marca: String,
  modelo: String,
  color: String,
  costo: { type: Number, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  estado: { type: Boolean, default: true },
  descripcion: String,
  imagen: String,
}, {versionKey: false});

const Producto = mongoose.model('Producto', productoSchema);

// Función para leer la entrada del usuario desde la consola
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Funciones CRUD

async function crearProducto() {
  try {
    const nombre = await prompt('Nombre: ');
    const idproveedor = await prompt('ID del proveedor: ');
    const marca = await prompt('Marca: ');
    const modelo = await prompt('Modelo: ');
    const color = await prompt('Color: ');
    const costo = parseFloat(await prompt('Costo: '));
    const precio = parseFloat(await prompt('Precio: '));
    const stock = parseInt(await prompt('Stock: '), 10);
    const estado = (await prompt('Estado (true/false): ')) === 'true';
    const descripcion = await prompt('Descripción: ');

    const nuevoProducto = new Producto({
      nombre,
      idproveedor,
      marca,
      modelo,
      color,
      costo,
      precio,
      stock,
      estado,
      descripcion,
    });

    const productoGuardado = await nuevoProducto.save();
    console.log('Producto creado:', productoGuardado);
  } catch (error) {
    console.error('Error al crear el producto:', error.message);
  }
}

async function listarProductos() {
  try {
    // Realizar la operación de listar productos
    const productos = await Producto.find({}, '-imagen');
    console.log('Lista de productos:');
    console.log(productos);
  } catch (error) {
    console.error('Error al listar los productos:', error.message);
  }
}

async function editarProducto() {
  try {
    const idProducto = await prompt('ID del producto a editar: ');
    const producto = await Producto.findById(idProducto);

    if (!producto) {
      console.log('Producto no encontrado.');
      return;
    }

    console.log('Datos actuales del producto:');
    console.log(producto);

    const nombre = await prompt('Nuevo nombre (Enter para mantener el actual): ') || producto.nombre;
    const idproveedor = await prompt('Nuevo ID del proveedor (Enter para mantener el actual): ') || producto.idproveedor;
    const marca = await prompt('Nueva marca (Enter para mantener la actual): ') || producto.marca;
    const modelo = await prompt('Nuevo modelo (Enter para mantener el actual): ') || producto.modelo;
    const color = await prompt('Nuevo color (Enter para mantener el actual): ') || producto.color;
    const costo = parseFloat(await prompt('Nuevo costo (Enter para mantener el actual): ') || producto.costo);
    const precio = parseFloat(await prompt('Nuevo precio (Enter para mantener el actual): ') || producto.precio);
    const stock = parseInt(await prompt('Nuevo stock (Enter para mantener el actual): ') || producto.stock, 10);
    const estado = (await prompt('Nuevo estado (true/false, Enter para mantener el actual): ') || String(producto.estado)) === 'true';
    const descripcion = await prompt('Nueva descripción (Enter para mantener la actual): ') || producto.descripcion;

    // Actualizar el producto
    await Producto.findByIdAndUpdate(idProducto, {
      nombre,
      idproveedor,
      marca,
      modelo,
      color,
      costo,
      precio,
      stock,
      estado,
      descripcion,
    });

    console.log('Producto actualizado correctamente.');
  } catch (error) {
    console.error('Error al editar el producto:', error.message);
  }
}

async function eliminarProducto() {
  try {
    const idProducto = await prompt('ID del producto a eliminar: ');
    const producto = await Producto.findById(idProducto);

    if (!producto) {
      console.log('Producto no encontrado.');
      return;
    }

    console.log('Datos del producto a eliminar:');
    console.log(producto);

    const confirmacion = await prompt('¿Estás seguro de que quieres eliminar este producto? (Sí/No): ');

    if (confirmacion.toLowerCase() === 'si' || confirmacion.toLowerCase() === 'sí') {
      // Realizar la operación de eliminación
      await Producto.findByIdAndDelete(idProducto);
      console.log('Producto eliminado correctamente.');
    } else {
      console.log('Operación de eliminación cancelada.');
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error.message);
  }
}

// Ejecutar la función deseada
async function mostrarMenu() {
  let opcion;

  do {
    console.log('\n=== Menú ===');
    console.log('1. Crear Producto');
    console.log('2. Listar Productos');
    console.log('3. Editar Producto');
    console.log('4. Eliminar Producto');
    console.log('0. Salir');

    opcion = await prompt('Selecciona una opción: ');

    switch (opcion) {
      case '1':
        await crearProducto();
        break;
      case '2':
        await listarProductos();
        break;
      case '3':
        await editarProducto();
        break;
      case '4':
        await eliminarProducto();
        break;
      case '0':
        console.log('Saliendo del programa.');
        break;
      default:
        console.log('Opción no válida. Intenta de nuevo.');
        break;
    }
  } while (opcion !== '0');

  // Cerrar la conexión al salir del programa
  mongoose.connection.close();
}

// Iniciar el menú
mostrarMenu();
