import "server-only"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Produce a signature for a direct (unsigned-body) browser upload to Cloudinary.
 * The browser POSTs the file + these params straight to Cloudinary, so large
 * image bodies never pass through our server.
 */
export function signUpload(params: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000)
  const toSign = { timestamp, ...params }
  const signature = cloudinary.utils.api_sign_request(
    toSign,
    process.env.CLOUDINARY_API_SECRET as string
  )
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  }
}

export { cloudinary }
