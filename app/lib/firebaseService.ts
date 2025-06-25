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
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data().apiKey || null;
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
      await setDoc(doc(db, 'users', userId), { apiKey }, { merge: true });
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
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting API key:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao deletar. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }

  static async getSiteStatus(): Promise<SiteStatus> {
    try {
      const userId = this.getUserId();
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return userDoc.data().siteStatus || {};
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

  static async saveSiteStatus(siteStatus: SiteStatus): Promise<void> {
    try {
      const userId = this.getUserId();
      await setDoc(doc(db, 'users', userId), { siteStatus }, { merge: true });
    } catch (error) {
      console.error('Error saving site status:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao salvar status. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }

  static async updateSiteStatus(campaignId: string, key: string, status: 1 | 0): Promise<void> {
    try {
      const currentStatus = await this.getSiteStatus();
      if (!currentStatus[campaignId]) {
        currentStatus[campaignId] = {};
      }
      currentStatus[campaignId][key] = status;
      await this.saveSiteStatus(currentStatus);
    } catch (error) {
      console.error('Error updating site status:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        throw new Error('Erro de permissão ao atualizar status. Verifique as regras de segurança do Firestore.');
      }
      throw error;
    }
  }
}
