const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autenticación requerido",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.sub,
      rol: decoded.rol,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o vencido",
    });
  }
};

const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        message: "No tienes permiso para realizar esta acción",
      });
    }

    return next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
