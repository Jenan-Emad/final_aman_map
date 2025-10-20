import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface DeviceInfo {
  visitorId: string;
  ipAddress: string;
}

class FingerprintService {
  private fpPromise: Promise<any> | null = null;
  private cachedVisitorId: string | null = null;

  constructor() {
    this.initFingerprint();
  }

  private async initFingerprint() {
    try {
      this.fpPromise = FingerprintJS.load();
    } catch (error) {
      console.error('Failed to load FingerprintJS:', error);
    }
  }

  async getVisitorId(): Promise<string> {
    if (this.cachedVisitorId) {
      return this.cachedVisitorId;
    }

    try {
      if (!this.fpPromise) {
        await this.initFingerprint();
      }

      const fp = await this.fpPromise;
      const result = await fp.get();
      this.cachedVisitorId = result.visitorId;
      
      // Store in sessionStorage for consistency
      sessionStorage.setItem('amanmap_visitor_id', result.visitorId);
      
      return result.visitorId;
    } catch (error) {
      console.error('Error getting visitor ID:', error);
      // Fallback to a generated ID if fingerprinting fails
      const fallbackId = this.generateFallbackId();
      this.cachedVisitorId = fallbackId;
      return fallbackId;
    }
  }

  async getIpAddress(): Promise<string> {
    try {
      // Get IP from a public service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      // Fallback IP for testing
      return '0.0.0.0';
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const [visitorId, ipAddress] = await Promise.all([
      this.getVisitorId(),
      this.getIpAddress()
    ]);

    return {
      visitorId,
      ipAddress
    };
  }

  private generateFallbackId(): string {
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clearCache() {
    this.cachedVisitorId = null;
    sessionStorage.removeItem('amanmap_visitor_id');
  }
}

// Export singleton instance
export const fingerprintService = new FingerprintService();
export default fingerprintService;