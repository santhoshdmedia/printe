const { Schema, model } = require("mongoose");

const subcategorySchema = Schema(
  {
    select_main_category: {
      type: Schema.Types.ObjectId,
      ref: "main category",
      required: true,
    },
    sub_category_name: {
      type: String,
      required: true,
    },
    sub_category_image: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    position: {
      type: Number,
      default: 1,
    },
    sub_category_banner_image: {
      type: String,
      required: true,
    },
    show: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "sub category",
    timestamps: true,
  }
);

// Pre-save middleware to generate unique slug
subcategorySchema.pre("save", async function (next) {
  // Only generate slug if sub_category_name exists and slug is not already set
  if (this.sub_category_name && (!this.slug || this.isModified("sub_category_name"))) {
    
    // Generate base slug from sub_category_name
    let baseSlug = this.sub_category_name
      .toLowerCase()                     // Convert to lowercase
      .trim()                           // Remove whitespace from ends
      .replace(/\s+/g, "-")             // Replace spaces with hyphens
      .replace(/_/g, "-")               // Replace underscores with hyphens
      .replace(/[^a-z0-9-]/g, "")       // Remove special characters (keep only letters, numbers, hyphens)
      .replace(/-+/g, "-")              // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, "");           // Remove leading/trailing hyphens
    
    // If base slug is empty after cleaning, use a default
    if (!baseSlug) {
      baseSlug = "sub-category";
    }
    
    // Check for existing slugs and make it unique
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;
    
    while (!isUnique) {
      try {
        // Check if slug already exists in database (excluding current document if updating)
        const query = { slug };
        if (this._id) {
          query._id = { $ne: this._id }; // Exclude current document during update
        }
        
        const existing = await model("sub category").findOne(query);
        
        if (!existing) {
          isUnique = true;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
        // Fallback: add timestamp to ensure uniqueness
        slug = `${baseSlug}-${Date.now()}`;
        isUnique = true;
      }
    }
    
    this.slug = slug;
  }
  next();
});

// Pre-findOneAndUpdate middleware for update operations
subcategorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  
  // If sub_category_name is being updated, regenerate slug
  if (update.sub_category_name || (update.$set && update.$set.sub_category_name)) {
    const subCategoryName = update.sub_category_name || (update.$set && update.$set.sub_category_name);
    
    if (subCategoryName) {
      // Generate base slug
      let baseSlug = subCategoryName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      if (!baseSlug) {
        baseSlug = "sub-category";
      }
      
      // Get the document being updated
      const docToUpdate = await this.model.findOne(this.getQuery());
      
      // Check for existing slugs
      let slug = baseSlug;
      let counter = 1;
      let isUnique = false;
      
      while (!isUnique) {
        const query = { slug };
        if (docToUpdate && docToUpdate._id) {
          query._id = { $ne: docToUpdate._id };
        }
        
        const existing = await this.model.findOne(query);
        
        if (!existing) {
          isUnique = true;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      
      // Update the slug in the update object
      if (update.$set) {
        update.$set.slug = slug;
      } else {
        update.slug = slug;
      }
    }
  }
  
  next();
});

module.exports = model("sub category", subcategorySchema);