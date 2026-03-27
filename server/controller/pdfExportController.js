// controllers/pdfExportController.js
const PdfExport = require("../modals/pdfExportModel");


/**
 * POST /api/pdf-exports
 * Save a new PDF export record with the list of products that were exported.
 */
const createPdfExport = async (req, res) => {
  try {
    const {
      products = [],
      export_type = "selected",
      min_price = "",
      max_price = "",
      filename = "",
      notes = "",
      status = "success",
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required to log a PDF export.",
      });
    }

    // Normalise each product to match the schema
    const normalisedProducts = products.map((p) => ({
      product_id: p._id || p.product_id || "",
      name: p.name || "N/A",
      product_code: p.product_code || "N/A",
      product_codeS_NO: p.product_codeS_NO || "N/A",
      category:
        p.category_details?.main_category_name || p.category || "N/A",
      sub_category:
        p.sub_category_details?.sub_category_name || p.sub_category || "N/A",
      mrp_price: String(p.MRP_price || p.mrp_price || "N/A"),
      customer_price: String(
        p.prices?.customerPrice || p.customer_price || "N/A"
      ),
      dealer_price: String(
        p.prices?.dealerPrice || p.dealer_price || "N/A"
      ),
      stock: Number(p.totalStock ?? p.stock ?? 0),
      is_visible: Boolean(p.is_visible),
      image_url: p.image_url || [],
      type: p.type || "N/A",  
      gst: String(p.gst || "18"),
      hsn_code: String(p.HSNcode_time || p.HSN_code || p.hsn_code || "N/A"),
      stocks_status: p.stocks_status || "N/A",
      DaysNeeded: p.DaysNeeded || "N/A",
      product_url: p.product_url || "",
    }));

    // Support any auth middleware shape:
    // req.user, req.admin, req.userId, or no auth at all
    const authUser = req.user || req.admin || null;
    const exportedById   = authUser?._id   || authUser?.id   || null;
    const exportedByName = authUser?.name  || authUser?.email || authUser?.username || "Unknown";

    const record = await PdfExport.create({
      exported_by:      exportedById,
      exported_by_name: exportedByName,
      export_type,
      product_count: normalisedProducts.length,
      min_price,
      max_price,
      filename,
      notes,
      status,
      products: normalisedProducts,
    });

    return res.status(201).json({
      success: true,
      message: "PDF export logged successfully.",
      data: record,
    });
  } catch (error) {
    console.error("[pdfExportController] createPdfExport error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log PDF export.",
      error: error.message,
    });
  }
};

/**
 * GET /api/pdf-exports
 * List export history with optional filters:
 *   ?page=1&limit=20&export_type=selected&start=YYYY-MM-DD&end=YYYY-MM-DD
 */
const getPdfExports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      export_type,
      start,
      end,
      exported_by,
    } = req.query;

    const filter = {};
    if (export_type) filter.export_type = export_type;
    if (exported_by) filter.exported_by = exported_by;
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const [records, total] = await Promise.all([
      PdfExport.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      PdfExport.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("[pdfExportController] getPdfExports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch PDF export history.",
      error: error.message,
    });
  }
};

/**
 * GET /api/pdf-exports/:id
 * Fetch a single export record including its product list.
 */
const getPdfExportById = async (req, res) => {
  try {
    const record = await PdfExport.findById(req.params.id).lean();
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Export record not found." });
    }
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("[pdfExportController] getPdfExportById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch export record.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/pdf-exports/:id
 * Remove an export record (super-admin only, enforced in routes).
 */
const deletePdfExport = async (req, res) => {
  try {
    const record = await PdfExport.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Export record not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Export record deleted successfully.",
    });
  } catch (error) {
    console.error("[pdfExportController] deletePdfExport error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete export record.",
      error: error.message,
    });
  }
};

module.exports = {
  createPdfExport,
  getPdfExports,
  getPdfExportById,
  deletePdfExport,
};