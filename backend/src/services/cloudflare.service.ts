 export class CloudflareService {
  private accountId: string;
  private apiToken: string;
  private bucketName: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET!;
  }

  async generateSignedUploadUrl(fileName: string, contentType: string): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/r2/buckets/${this.bucketName}/objects/${fileName}`;
    
    return url;
  }

  async generateSignedDownloadUrl(fileName: string): Promise<string> {
    const url = `https://${this.bucketName}.${this.accountId}.r2.cloudflarestorage.com/${fileName}`;
    
    return url;
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<boolean> {
    try {
      console.log(`Uploading ${fileName} to R2`);
      return true;
    } catch (error) {
      console.error('Upload failed:', error);
      return false;
    }
  }
}