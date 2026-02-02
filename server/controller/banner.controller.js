const { PRODUCT_GET_SUCCESS } = require("../helper/message.helper");
const { errorResponse, successResponse } = require("../helper/response.helper");
const { ProductSchema, BannerSchemas } = require("./models_import");

const addBanners = async (req, res) => {
  try {
    // Get the current highest position
    const maxPositionBanner = await BannerSchemas.findOne().sort({ position: -1 }).limit(1);
    const nextPosition = maxPositionBanner ? maxPositionBanner.position + 1 : 0;
    
    // Add position to the new banner
    const bannerData = {
      ...req.body,
      position: nextPosition,
      is_visible: req.body.is_visible !== undefined ? req.body.is_visible : true,
      expiry_date: req.body.expiry_date || null
    };
    
    const result = await BannerSchemas.create(bannerData);
    successResponse(res, "Banner Created Successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, "Something went wrong while creating the banner");
  }
};

const getAllBannerProducts = async (req, res) => {
  try {
    const result = await ProductSchema.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          images: 1,
          is_visible: 1,
          is_cloned: 1,
          seo_url: 1,
          MRP_price: 1,
          customer_product_price: 1,
          type: 1,
          product_code: 1
        },
      },
    ]);
    successResponse(res, "get success ", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "Failed to get products");
  }
};

const editBanner = async (req, res) => {
  try {
    // If visibility is being changed and banner was auto-hidden, reset auto_hidden flag
    const updateData = { ...req.body };
    if (updateData.is_visible === true) {
      updateData.auto_hidden = false;
    }
    
    const result = await BannerSchemas.findByIdAndUpdate(
      { _id: req.params.id }, 
      updateData,
      { new: true }
    );
    successResponse(res, "Banner Successfully Updated");
  } catch (err) {
    console.log(err);
    errorResponse(res, "Something went wrong while updating the banner");
  }
};

// Get all banners for admin (shows all, including hidden)
const getAllBanners = async (req, res) => {
  try {
    // Check and auto-hide expired banners first
    await checkAndHideExpiredBanners();
    
    // Get all banners for admin panel
    const result = await BannerSchemas.find({})
      .sort({ position: 1, createdAt: 1 })
      .lean();
    
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "Failed to get banners");
  }
};

// Get visible banners only (for public/frontend)
const getVisibleBanners = async (req, res) => {
  try {
    // Check and auto-hide expired banners first
    await checkAndHideExpiredBanners();
    
    // Get only visible banners for public display
    const result = await BannerSchemas.find({ is_visible: true })
      .sort({ position: 1, createdAt: 1 })
      .lean();
    
    successResponse(res, "", result);
  } catch (err) {
    console.log(err);
    errorResponse(res, "Failed to get visible banners");
  }
};

const deleteBanner = async (req, res) => {
  try {
    const result = await BannerSchemas.findByIdAndDelete({ _id: req.params.id });
    
    // Reorder remaining banners to fill the gap
    if (result) {
      const remainingBanners = await BannerSchemas.find().sort({ position: 1 });
      const updatePromises = remainingBanners.map((banner, index) => {
        return BannerSchemas.findByIdAndUpdate(
          banner._id,
          { position: index },
          { new: true }
        );
      });
      await Promise.all(updatePromises);
    }
    
    successResponse(res, "Banner Successfully Deleted");
  } catch (err) {
    console.log(err);
    errorResponse(res, "Something went wrong while deleting the banner");
  }
};

// Reorder banners
const reorderBanners = async (req, res) => {
  try {
    const { order } = req.body; // Array of banner IDs in new order

    if (!Array.isArray(order) || order.length === 0) {
      return errorResponse(res, "Invalid order array");
    }

    // Update position for each banner
    const updatePromises = order.map((bannerId, index) => {
      return BannerSchemas.findByIdAndUpdate(
        bannerId,
        { position: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    successResponse(res, "Banner order updated successfully");
  } catch (error) {
    console.error('Error reordering banners:', error);
    errorResponse(res, "Failed to reorder banners");
  }
};

// Toggle banner visibility
const toggleBannerVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerSchemas.findById(id);
    
    if (!banner) {
      return errorResponse(res, "Banner not found");
    }
    
    const newVisibility = !banner.is_visible;
    const updateData = {
      is_visible: newVisibility,
      auto_hidden: false // Reset auto_hidden when manually toggling
    };
    
    await BannerSchemas.findByIdAndUpdate(id, updateData, { new: true });
    
    successResponse(res, `Banner ${newVisibility ? 'shown' : 'hidden'} successfully`);
  } catch (err) {
    console.error('Error toggling banner visibility:', err);
    errorResponse(res, "Failed to toggle banner visibility");
  }
};

// Helper function to check and auto-hide expired banners
const checkAndHideExpiredBanners = async () => {
  try {
    const now = new Date();
    
    // Find and auto-hide expired banners
    await BannerSchemas.updateMany(
      {
        expiry_date: { $lte: now, $ne: null },
        is_visible: true
      },
      {
        $set: {
          is_visible: false,
          auto_hidden: true
        }
      }
    );
  } catch (err) {
    console.error('Error checking expired banners:', err);
  }
};

// Get banner statistics
const getBannerStats = async (req, res) => {
  try {
    await checkAndHideExpiredBanners();
    
    const totalBanners = await BannerSchemas.countDocuments();
    const visibleBanners = await BannerSchemas.countDocuments({ is_visible: true });
    const hiddenBanners = await BannerSchemas.countDocuments({ is_visible: false });
    const autoHiddenBanners = await BannerSchemas.countDocuments({ auto_hidden: true });
    
    const now = new Date();
    const expiringSoon = await BannerSchemas.countDocuments({
      expiry_date: { 
        $gte: now, 
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      is_visible: true
    });
    
    successResponse(res, "Banner statistics", {
      total: totalBanners,
      visible: visibleBanners,
      hidden: hiddenBanners,
      autoHidden: autoHiddenBanners,
      expiringSoon: expiringSoon
    });
  } catch (err) {
    console.error('Error getting banner stats:', err);
    errorResponse(res, "Failed to get banner statistics");
  }
};

module.exports = { 
  getAllBannerProducts, 
  addBanners, 
  editBanner, 
  getAllBanners,
  getVisibleBanners,
  deleteBanner,
  reorderBanners,
  toggleBannerVisibility,
  getBannerStats
};