import { makeAutoObservable, runInAction } from 'mobx';
import { resourceApi } from '../api/client';
import type { AssetResponse, CreateAssetRequest, ApiError } from '../types';

/**
 * MobX store for asset management.
 * Handles fetching and creating assets.
 */
class AssetStore {
  assets: AssetResponse[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Fetch all assets from the API
   * Available to any authenticated user
   */
  async fetchAssets(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await resourceApi.get<AssetResponse[]>('/assets');
      
      runInAction(() => {
        this.assets = response.data;
        this.isLoading = false;
      });
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message;
        this.isLoading = false;
      });
    }
  }

  /**
   * Create a new asset
   * Admin only - backend enforces this
   */
  async addAsset(request: CreateAssetRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await resourceApi.post<AssetResponse>('/assets', request);
      
      runInAction(() => {
        // Add new asset to the beginning of the list
        this.assets = [response.data, ...this.assets];
        this.isLoading = false;
      });

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message;
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Clear all assets (e.g., on logout)
   */
  clearAssets(): void {
    this.assets = [];
    this.error = null;
  }

  /**
   * Clear any error message
   */
  clearError(): void {
    this.error = null;
  }
}

// Export singleton instance
export const assetStore = new AssetStore();
