# Next.js 13 Upgrade Notes

This project has been upgraded from Next.js 12.2.5 to Next.js 13.5.6. Below are the key changes made and important information for developers.

## Key Changes

1. **Dependencies Updated**:
   - Next.js updated to 13.5.6
   - React and React DOM maintained at 18.2.0
   - ESLint configuration updated

2. **Configuration Updates**:
   - `next.config.js` updated with Next.js 13 compatible options
   - Removed deprecated experimental features
   - Enhanced compression and caching options

3. **Code Changes**:
   - Updated `_document.tsx` with proper TypeScript types
   - Improved image loader implementation with better error handling
   - Replaced uploadcare loader with a custom image loader solution
   - Updated Link components to use Next.js 13 patterns (using legacyBehavior where needed)

4. **TypeScript Improvements**:
   - Added proper typing for components and props
   - Fixed type errors in Document component

## After Deployment

1. **Check for Regressions**:
   - Verify all pages load correctly
   - Test compressed assets are being served properly
   - Confirm image loading works in all scenarios

2. **Performance Improvements to Verify**:
   - Faster page loads due to improved image optimization
   - Better caching of static assets
   - Better compression for reduced network payload

3. **Known Issues**:
   - There are still TypeScript linter errors in some styled components that will need to be addressed in a future update
   - The project still uses the old Pages Router, not the new App Router

## Development Notes

- Use Node.js 18.17.0 (LTS) or later for compatibility (see `.nvmrc`)
- Run `npm install` to update all dependencies
- For development: `npm run dev`
- For production build: `npm run build` followed by `npm start`

## Changes to Image Handling

The previous version used the `@uploadcare/nextjs-loader` package which is no longer needed. We've replaced it with a simpler custom loader that:

1. Handles SVG and WebP images directly without any optimization (preserving vector quality)
2. Adds width and quality parameters to internal images
3. Leaves external URLs untouched 

This approach is compatible with Next.js 13's image optimization while being simpler and requiring fewer dependencies.

## Future Considerations

1. **App Router Migration**:
   - Consider migrating to the App Router in Next.js 13
   - This would require restructuring from `pages/` to `app/` directory

2. **Styled Components**:
   - Fix typing issues in styled components
   - Consider migrating to CSS Modules or other styling solutions with better TypeScript support

3. **Server Components**:
   - Evaluate opportunities to use React Server Components when migrating to App Router 