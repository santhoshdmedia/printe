const { BlogSchema } = require("../controller/models_import");


const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w\-]+/g, "") // remove all non-word chars
    .replace(/\-\-+/g, "-") // replace multiple - with single -
    .replace(/^-+/, "") // trim - from start
    .replace(/-+$/, ""); // trim - from end
};

const generateUniqueSlug = async (baseSlug, currentId = null) => {
  let slug = baseSlug;
  let counter = 1;
  while (
    await BlogSchema.findOne({ blog_slug: slug, _id: { $ne: currentId } })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

module.exports = { slugify, generateUniqueSlug };