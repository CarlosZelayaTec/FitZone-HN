const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailNormalizado]
    );

    if (usuarioExistente.rowCount > 0) {
      return res.status(409).json({
        message: "El correo ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, created_at`,
      [nombre.trim(), emailNormalizado, passwordHash, "cliente"]
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);

    return res.status(500).json({
      message: "No fue posible registrar el usuario",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const resultado = await pool.query(
      `SELECT id, nombre, email, password_hash, rol
       FROM usuarios
       WHERE email = $1`,
      [emailNormalizado]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
    }

    const usuario = resultado.rows[0];

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      { sub: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Inicio de sesión correcto",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);

    return res.status(500).json({
      message: "No fue posible iniciar sesión",
    });
  }
};

module.exports = {
  register,
  login,
};
