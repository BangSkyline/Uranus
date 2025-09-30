// Utiliser le client simulé en développement local
if (process.env.NODE_ENV === 'development' && !process.env.MINIO_ENDPOINT?.includes('minio')) {
  const { minioClient: devClient } = require('./minio-client.dev');
  module.exports = { minioClient: devClient };
} else {
  // Client MinIO réel pour la production
  const Minio = require('minio');
  
  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  });

  module.exports = { minioClient };
}

