const express = require("express");
const multer = require('multer');
const AWS = require('aws-sdk');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         presignedUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Uploads a file to Amazon S3 and returns a presigned URL
 *     tags: [Integrate]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       '400':
 *         description: No file uploaded
 *       '500':
 *         description: Error uploading file to S3
 */
router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const bucketName = process.env.S3_BUCKET;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: bucketName,
    Key: `${Date.now().toString()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.upload(params).promise();

    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: params.Key,
      Expires: 3600
    });

    res.status(200).send({ 
      message: 'File uploaded to S3 successfully!',
      presignedUrl: presignedUrl
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).send('Error uploading file to S3.');
  }
});

module.exports = router;
