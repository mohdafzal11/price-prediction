import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { quality } from "@cloudinary/url-gen/actions/delivery";
import { format } from "@cloudinary/url-gen/actions/delivery";
import { auto } from "@cloudinary/url-gen/qualifiers/quality";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";

// Initialize the Cloudinary instance
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'droomdroom'
  }
});

/**
 * Generate a Cloudinary URL for the DroomDroom logo
 * @param theme - The current theme ('light' or 'dark')
 * @param width - The desired width of the logo
 * @param height - The desired height of the logo
 * @returns A fully optimized Cloudinary URL
 */
export function getLogoCloudinaryUrl(theme: string, width: number = 248, height: number = 35): string {
  // Determine which logo to use based on theme
  const logoPublicId = `DroomDroom_${theme === 'light' ? 'Black' : 'White'}.webp`;
  
  // Generate the optimized image URL
  const logo = cloudinary.image(logoPublicId)
    .resize(scale().width(width).height(height))
    .delivery(quality(auto()))
    .delivery(format(autoFormat()));
  
  return logo.toURL();
}
