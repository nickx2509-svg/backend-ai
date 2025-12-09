import {v2 as cloundinary} from 'cloudinary'
import fs from 'fs'

cloundinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloundinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    // upload the file on cloundinary
    const response = await cloundinary.uploader.upload(localFilePath, {
      resource_type:'auto'
    })
    // file has been uploaded successfully 
    console.log("File is uploaded on Cloundinary",response.url)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)// remove the locally saved temp files as the uploaded operation got failed
    return null;
  }
}

export {uploadOnCloundinary}