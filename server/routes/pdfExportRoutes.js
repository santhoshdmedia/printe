// routes/pdfExportRoutes.js
const express = require("express");
const router = express.Router();

const {
  createPdfExport,
  getPdfExports,
  getPdfExportById,
  deletePdfExport,
} = require("../controller/pdfExportController");


router
  .route("/")
  .post( createPdfExport)
  .get( getPdfExports);

/**
 * GET    /api/pdf-exports/:id    → single record detail
 * DELETE /api/pdf-exports/:id    → remove record (super-admin only)
 */
router
  .route("/:id")
  .get( getPdfExportById)
  .delete(  deletePdfExport);

module.exports = router;

