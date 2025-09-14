import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const config = {
  basePath: publicRuntimeConfig.basePath as string,
  apiPath: publicRuntimeConfig.apiPath as string,
  cmcImageUrl: publicRuntimeConfig.cmcImageUrl as string,
} as const;
// Helper functions to generate URLs
export const getApiUrl = (path: string) => {
  // `${config.apiPath}${path}`;
  let uri = path;
  if (path.startsWith('/')) {
    uri = path.slice(1);
  }
  let finalUri = `${config.apiPath}/${uri}`;
  if (finalUri.includes("/undefined")) {
    finalUri = finalUri.replace("/undefined", "");
    finalUri = finalUri.replace("undefined", "");
  }
  // get the host url from the NEXT_PUBLIC_API_URL env
  let host = new URL(process.env.NEXT_PUBLIC_API_URL!)
  // it should be host/config.apiPath/uri
  return `${host.protocol}//${host.host}${config.apiPath}/${uri}`;
}
export const getCmcImageUrl = (cmcId: string | number) => `${config.cmcImageUrl}/${cmcId}.png`;
export const getPageUrl = (path: string) => path == "" || path == undefined ? `${config.basePath}` : `${config.basePath}${path}`;
export const getHostPageUrl = (path: string) => {
  // Check if NEXT_PUBLIC_URL is defined
  if (!process.env.NEXT_PUBLIC_URL) {
    // Fallback to a default URL or relative path during build
    path = path.startsWith('/') ? path : `/${path}`;
    return path;
  }
  
  try {
    // Sanitize and validate the URL before creating URL object
    let baseUrl = process.env.NEXT_PUBLIC_URL.trim();
    
    // Ensure proper URL format
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    // Use url module to get the host
    const url = new URL(baseUrl);
    path = path.startsWith('/') ? path : `/${path}`;
    
    // If port is not 80, then add it to the url
    return `${url.protocol}//${url.host}${path}`;
  } catch (error) {
    // If URL construction fails during prerendering, fallback to relative path
    console.warn('Invalid NEXT_PUBLIC_URL during prerendering, falling back to relative path:', error);
    path = path.startsWith('/') ? path : `/${path}`;
    return path;
  }
}