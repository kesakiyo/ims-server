/* External dependencies */
import * as aws from 'aws-sdk';
import * as multer from 'multer';

/* Internal dependencies */
import secret from '../config/secret';
import { UserModel } from '../models/User';

aws.config.region = 'ap-northeast-2';
aws.config.update({
  accessKeyId: secret.AwsAccessKey,
  secretAccessKey: secret.AwsSecretKey,
});

export default (files: any, user: UserModel) => {
  const file = files[0];

  const s3 = new aws.S3({
    params: {
      Bucket: 'ims-server',
      Key: `${file.originalname}+${Date.now().toString()}`,
      ACL: 'public-read',
      ContentType: file.mimetype,
    }
  });

  return new Promise((resolve, reject) => {
    const params = { Body: file.buffer } as any;
    s3.upload(params)
      .on('httpUploadProgress', (event: any) => console.log(event))
      .send((err: any, data: any) => {
        if (err) {
          return reject(err);
        }
        resolve({
          name: decodeURIComponent(file.originalname),
          url: decodeURIComponent(data.Location),
          size: file.size,
          mimeType: file.mimetype,
        });
      })
  })
}