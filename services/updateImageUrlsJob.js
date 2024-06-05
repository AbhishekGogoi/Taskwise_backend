const cron = require('node-cron');
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
  try {
    await updateCollection(User);
    await updateCollection(Workspace);
    await updateCollection(Project);
    console.log("Image URLs updated successfully.");
  } catch (error) {
    console.error("Error updating image URLs:", error);
  }
}

async function updateCollection(Model) {
  const documents = await Model.find();
  await Promise.all(documents.map(async (document) => {
    const updatedUrl = await getPresignedUrl(document.imgUrl);
    document.imgUrl = updatedUrl;
    await document.save();
  }));
}

function getPresignedUrl(objectKey) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: 3600 // URL expires in 1 hour, adjust as needed
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

// Schedule the updateImageUrls function to run at midnight every day
cron.schedule('0 0 * * *', () => {
  updateImageUrls();
}, {
  timezone: "Asia/Kolkata" // Specify your timezone here
});

// Call updateImageUrls once after starting the app
updateImageUrls();
