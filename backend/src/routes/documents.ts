import { Hono } from 'hono';

const app = new Hono();

// Mock document controller for now
const documentController = {
  async getAll(c: any) {
    try {
      // Mock documents data
      const documents = [
        {
          id: '1',
          name: 'Lease Agreement Template',
          type: 'application/pdf',
          size: 1024 * 1024 * 2.5, // 2.5 MB
          category: 'legal',
          uploadedBy: 'John Doe',
          uploadedAt: new Date().toISOString(),
          url: 'https://example.com/documents/lease-template.pdf'
        },
        {
          id: '2',
          name: 'Property Photos',
          type: 'image/jpeg',
          size: 1024 * 1024 * 5.2, // 5.2 MB
          category: 'properties',
          uploadedBy: 'Jane Smith',
          uploadedAt: new Date().toISOString(),
          url: 'https://example.com/documents/property-photos.jpg'
        }
      ];

      return c.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Documents fetch error:', error);
      return c.json({ error: 'Failed to fetch documents' }, 500);
    }
  },

  async getStorageUsage(c: any) {
    try {
      // Mock storage usage data
      const storageUsage = {
        totalStorage: 1024 * 1024 * 1024 * 1.5, // 1.5 GB
        storageLimit: 1024 * 1024 * 1024 * 10, // 10 GB
        usageByCategory: {
          legal: 1024 * 1024 * 512, // 512 MB
          properties: 1024 * 1024 * 768, // 768 MB
          tenants: 1024 * 1024 * 128, // 128 MB
          maintenance: 1024 * 1024 * 64, // 64 MB
          financial: 1024 * 1024 * 32, // 32 MB
        },
        fileCounts: {
          total: 150,
          byType: {
            'application/pdf': 50,
            'image/jpeg': 60,
            'image/png': 20,
            'application/msword': 15,
            'text/csv': 5
          }
        }
      };

      return c.json({
        success: true,
        data: storageUsage
      });
    } catch (error) {
      console.error('Storage usage error:', error);
      return c.json({ error: 'Failed to fetch storage usage' }, 500);
    }
  },

  async create(c: any) {
    try {
      const body = await c.req.json();
      
      // Mock document creation
      const newDocument = {
        id: Date.now().toString(),
        name: body.name || 'Untitled Document',
        type: body.type || 'application/octet-stream',
        size: body.size || 0,
        category: body.category || 'general',
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        url: body.url || 'https://example.com/documents/new-document'
      };

      return c.json({
        success: true,
        data: newDocument
      }, 201);
    } catch (error) {
      console.error('Document creation error:', error);
      return c.json({ error: 'Failed to create document' }, 500);
    }
  }
};

// Get all documents
app.get('/', (c) => documentController.getAll(c));

// Get storage usage
app.get('/storage-usage', (c) => documentController.getStorageUsage(c));

// Create new document
app.post('/', (c) => documentController.create(c));

export default app; 