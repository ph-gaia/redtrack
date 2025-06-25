import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface SiteStatus {
  [campaignId: string]: {
    [key: string]: 1 | 0;
  };
}

export interface UserData {
  apiKey: string;
  siteStatus: SiteStatus;
}

export class FirebaseService {
  private static getUserId(): string {
    // For now, we'll use a simple user ID. In a real app, you'd use Firebase Auth
    return 'default-user';
  }

  static async getApiKey(): Promise<string | null> {
    try {
      const userId = this.getUserId();
      const apiKeyDoc = await getDoc(doc(db, 'redtrack_api_key', userId));
      
      if (apiKeyDoc.exists()) {
        return apiKeyDoc.data().apiKey || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting API key:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão no Firebase. Verifique as regras de segurança do Firestore.');
      }
      return null;
    }
  }

  static async saveApiKey(apiKey: string): Promise<void> {
    try {
      const userId = this.getUserId();
      await setDoc(doc(db, 'redtrack_api_key', userId), { apiKey }, { merge: true });
    } catch (error) {
      console.error('Error saving API key:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao salvar. Verifique as regras de segurança do Firestore no Firebase Console.');
      }
      throw error;
    }
  }

  static async deleteApiKey(): Promise<void> {
    try {
      const userId = this.getUserId();
      await deleteDoc(doc(db, 'redtrack_api_key', userId));
    } catch (error) {
      console.error('Error deleting API key:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao deletar. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }

  static async getSiteStatus(apiKey?: string): Promise<SiteStatus> {
    try {
      // Se não foi passada uma API key, tenta buscar a atual
      let currentApiKey = apiKey;
      if (!currentApiKey) {
        currentApiKey = await this.getApiKey() || undefined;
      }
      
      if (!currentApiKey) {
        return {};
      }

      const userId = this.getUserId();
      const siteStatusDoc = await getDoc(doc(db, 'siteStatus', `${userId}_${currentApiKey}`));
      
      if (siteStatusDoc.exists()) {
        return siteStatusDoc.data().status || {};
      }
      return {};
    } catch (error) {
      console.error('Error getting site status:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao ler dados. Verifique as regras de segurança do Firestore.');
      }
      return {};
    }
  }

  static async saveSiteStatus(siteStatus: SiteStatus, apiKey?: string): Promise<void> {
    try {
      // Se não foi passada uma API key, tenta buscar a atual
      let currentApiKey = apiKey;
      if (!currentApiKey) {
        currentApiKey = await this.getApiKey() || undefined;
      }
      
      if (!currentApiKey) {
        throw new Error('API key não encontrada para salvar o status dos sites.');
      }

      const userId = this.getUserId();
      await setDoc(doc(db, 'siteStatus', `${userId}_${currentApiKey}`), { status: siteStatus }, { merge: true });
    } catch (error) {
      console.error('Error saving site status:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao salvar status. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }

  static async updateSiteStatus(campaignId: string, key: string, status: 1 | 0, apiKey?: string): Promise<void> {
    try {
      const currentStatus = await this.getSiteStatus(apiKey);
      if (!currentStatus[campaignId]) {
        currentStatus[campaignId] = {};
      }
      currentStatus[campaignId][key] = status;
      await this.saveSiteStatus(currentStatus, apiKey);
    } catch (error) {
      console.error('Error updating site status:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao atualizar status. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }
}
