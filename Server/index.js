const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/login_node_jwt", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.error("Unable to connect to MongoDB:", err));

// Esquemas de Mongoose
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const categorySchema = new mongoose.Schema({
  categoria: String
});

const brandSchema = new mongoose.Schema({
  marca: String
});

const productSchema = new mongoose.Schema({
  idcategoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
  idmarca: { type: mongoose.Schema.Types.ObjectId, ref: 'Marca' },
  descripcion: String,
  precio: Number
});

const Usuario = mongoose.model("Usuario", userSchema);
const Categoria = mongoose.model("Categoria", categorySchema);
const Marca = mongoose.model("Marca", brandSchema);
const Producto = mongoose.model("Producto", productSchema);

app.use(express.json());
app.use(cors());

// Registro de usuarios
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const userExists = await Usuario.findOne({ email });

  if (userExists) {
    return res.send({ msg: "Correo electrónico ya registrado" });
  }

  const hash = await bcrypt.hash(password, saltRounds);
  const newUser = new Usuario({ email, password: hash });

  await newUser.save();
  res.send({ msg: "Usuario registrado correctamente" });
});

// Verificación de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Usuario.findOne({ email });

  if (!user) {
    return res.send({ msg: "Usuario no registrado" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.send({ msg: "Correo o contraseña incorrecta" });
  }

  res.send({ msg: "Inicio de sesión exitoso" });
});

// CRUD de Productos, Categorías y Marcas
app.get('/productos', async (req, res) => {
  const productos = await Producto.find().populate('idcategoria').populate('idmarca');
  res.send(productos);
});

app.post('/productos', async (req, res) => {
  const producto = new Producto(req.body);
  await producto.save();
  res.send(producto);
});

app.put('/productos/:idprod', async (req, res) => {
  const producto = await Producto.findById(req.params.idprod);
  Object.assign(producto, req.body);
  await producto.save();
  res.send(producto);
});

app.delete('/productos/:idprod', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.idprod);
  res.send({ message: 'Producto eliminado' });
});

app.get('/categoria', async (req, res) => {
  const categorias = await Categoria.find();
  res.send(categorias);
});

app.post('/categoria', async (req, res) => {
  const categoria = new Categoria(req.body);
  await categoria.save();
  res.send(categoria);
});

app.put('/categoria/:idcateg', async (req, res) => {
  const categoria = await Categoria.findById(req.params.idcateg);
  Object.assign(categoria, req.body);
  await categoria.save();
  res.send(categoria);
});

app.delete('/categoria/:idcateg', async (req, res) => {
  await Categoria.findByIdAndDelete(req.params.idcateg);
  res.send({ message: 'Categoría eliminada' });
});

app.get('/marcas', async (req, res) => {
  const marcas = await Marca.find();
  res.send(marcas);
});

app.post('/marcas', async (req, res) => {
  const marca = new Marca(req.body);
  await marca.save();
  res.send(marca);
});

app.put('/marcas/:idmarca', async (req, res) => {
  const marca = await Marca.findById(req.params.idmarca);
  Object.assign(marca, req.body);
  await marca.save();
  res.send(marca);
});

app.delete('/marcas/:idmarca', async (req, res) => {
  await Marca.findByIdAndDelete(req.params.idmarca);
  res.send({ message: 'Marca eliminada' });
});

// Inicia el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor funcionando en el puerto 3001");
});
