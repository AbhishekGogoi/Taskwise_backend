const db = require("../models");
const AWS = require('aws-sdk');
require('dotenv').config();

// Models
const Project = db.project;
const Workspace = db.workspace;
const User = db.user;

// Initialize AWS SDK with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
  signatureVersion: 'v4'
});

const bucketName = process.env.S3_BUCKET;

async function updateImageUrls() {
  console.log('updateImageUrls...');
  try {
    // await updateCollection(User);
    await updateCollection(Workspace);
    // await updateCollection(Project);
    console.log("Image URLs updated successfully.");
  } catch (error) {
    console.error("Error updating image URLs:", error);
  }
}

async function updateCollection(Model) {
  const documents = await Model.find();
  await Promise.all(documents.map(async (document) => {
    const updatedUrl = await getPresignedUrl(document.imgKey);
    document.imgUrl = updatedUrl;
    await document.save();
  }));
}

function getPresignedUrl(objectKey) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: 172800 // Expiry duration in seconds (48 hours)
    };
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}

module.exports = {
  updateImageUrls
};