import * as fs from 'fs';
import * as path from 'path';

// Simulateur MinIO pour le développement local
class MockMinioClient {
  private basePath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Créer le répertoire uploads s'il n'existe pas
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    const bucketPath = path.join(this.basePath, bucketName);
    return fs.existsSync(bucketPath);
  }

  async makeBucket(bucketName: string, region?: string): Promise<void> {
    const bucketPath = path.join(this.basePath, bucketName);
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }
  }

  async putObject(
    bucketName: string,
    objectName: string,
    stream: Buffer,
    size: number,
    metaData?: any
  ): Promise<void> {
    const bucketPath = path.join(this.basePath, bucketName);
    if (!fs.existsSync(bucketPath)) {
      fs.mkdirSync(bucketPath, { recursive: true });
    }
    
    const filePath = path.join(bucketPath, objectName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, stream);
  }

  async getObject(bucketName: string, objectName: string): Promise<any> {
    const filePath = path.join(this.basePath, bucketName, objectName);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    const buffer = fs.readFileSync(filePath);
    // Simuler un stream async iterable
    return {
      async *[Symbol.asyncIterator]() {
        yield buffer;
      }
    };
  }

  async removeObject(bucketName: string, objectName: string): Promise<void> {
    const filePath = path.join(this.basePath, bucketName, objectName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async statObject(bucketName: string, objectName: string): Promise<any> {
    const filePath = path.join(this.basePath, bucketName, objectName);
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found');
      (error as any).code = 'NotFound';
      throw error;
    }
    
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      metaData: {
        'content-type': 'application/octet-stream'
      }
    };
  }
}

// Utiliser le client simulé en développement
const minioClient = new MockMinioClient() as any;

export { minioClient };

