const express = require("express");
const {
  getMyProfile,
  listUsers,
} = require("../controllers/users.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticate, getMyProfile);
router.get("/", authenticate, authorizeRoles("admin"), listUsers);

module.exports = router;
