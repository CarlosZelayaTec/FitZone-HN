const pool = require("../config/db");

const getMyProfile = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, email, rol, fecha_registro
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al consultar perfil:", error.message);

    return res.status(500).json({
      message: "No fue posible consultar el perfil",
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, email, rol, fecha_registro
       FROM usuarios
       ORDER BY fecha_registro DESC`
    );

    return res.status(200).json({
      usuarios: resultado.rows,
    });
  } catch (error) {
    console.error("Error al listar usuarios:", error.message);

    return res.status(500).json({
      message: "No fue posible consultar los usuarios",
    });
  }
};

module.exports = {
  getMyProfile,
  listUsers,
};
