import History, { ActionType, IHistory } from '../models/History';
import mongoose from 'mongoose';

interface RecordHistoryParams {
  entityId: mongoose.Types.ObjectId | string;
  entityType: string;
  entityName: string;
  action: ActionType;
  userId: mongoose.Types.ObjectId | string;
  previousData?: any;
  newData?: any;
}

class HistoryService {
  /**
   * Değişiklik geçmişini kaydeder
   */
  async recordHistory({
    entityId,
    entityType,
    entityName,
    action,
    userId,
    previousData = {},
    newData = {}
  }: RecordHistoryParams): Promise<IHistory> {
    
    // Değişiklikleri hesapla
    const changes = this.calculateChanges(previousData, newData);
    
    // Yeni geçmiş kaydı oluştur
    const history = new History({
      entityId: typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId,
      entityType,
      entityName,
      action,
      changes,
      previousData,
      newData,
      createdBy: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
      createdAt: new Date()
    });
    
    // Kaydet ve dön
    return await history.save();
  }
  
  /**
   * Belirli bir entity için geçmiş kayıtlarını getirir
   */
  async getHistoryByEntity(
    entityId: mongoose.Types.ObjectId | string,
    options: {
      limit?: number;
      page?: number;
      sort?: string;
      direction?: 'asc' | 'desc';
    } = {}
  ): Promise<{ history: IHistory[]; total: number; page: number; limit: number }> {
    const { limit = 10, page = 1, sort = 'createdAt', direction = 'desc' } = options;
    
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sort] = direction === 'desc' ? -1 : 1;
    
    const query = { 
      entityId: typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId 
    };
    
    const [history, total] = await Promise.all([
      History.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      
      History.countDocuments(query)
    ]);
    
    return {
      history,
      total,
      page,
      limit
    };
  }
  
  /**
   * İki obje arasındaki değişiklikleri hesaplar
   * @private
   */
  private calculateChanges(oldData: any, newData: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    
    // Yeni objede bulunan ve eski objeden farklı olan tüm alanları bul
    if (newData && typeof newData === 'object') {
      Object.keys(newData).forEach(key => {
        // Eski objede alan yoksa veya değer farklıysa
        if (
          !oldData || 
          typeof oldData !== 'object' || 
          !Object.prototype.hasOwnProperty.call(oldData, key) || 
          !this.isEqual(oldData[key], newData[key])
        ) {
          changes[key] = {
            old: oldData?.[key],
            new: newData[key]
          };
        }
      });
    }
    
    // Eski objede olup yeni objede olmayan alanları bul
    if (oldData && typeof oldData === 'object') {
      Object.keys(oldData).forEach(key => {
        if (
          !newData || 
          typeof newData !== 'object' || 
          !Object.prototype.hasOwnProperty.call(newData, key)
        ) {
          changes[key] = {
            old: oldData[key],
            new: undefined
          };
        }
      });
    }
    
    return changes;
  }
  
  /**
   * İki değerin eşit olup olmadığını kontrol eder
   * @private
   */
  private isEqual(val1: any, val2: any): boolean {
    // İki değer de null veya undefined ise eşittir
    if (val1 == null && val2 == null) {
      return true;
    }
    
    // Değerlerden sadece biri null veya undefined ise eşit değildir
    if (val1 == null || val2 == null) {
      return false;
    }
    
    // İki değer de tarih ise
    if (val1 instanceof Date && val2 instanceof Date) {
      return val1.getTime() === val2.getTime();
    }
    
    // İki değer de ObjectId ise
    if (
      (val1 instanceof mongoose.Types.ObjectId || typeof val1 === 'string') &&
      (val2 instanceof mongoose.Types.ObjectId || typeof val2 === 'string')
    ) {
      const id1 = val1.toString();
      const id2 = val2.toString();
      return id1 === id2;
    }
    
    // İki değer de array ise
    if (Array.isArray(val1) && Array.isArray(val2)) {
      // Uzunluklar farklıysa eşit değildir
      if (val1.length !== val2.length) {
        return false;
      }
      
      // Her elemanı karşılaştır
      for (let i = 0; i < val1.length; i++) {
        if (!this.isEqual(val1[i], val2[i])) {
          return false;
        }
      }
      
      return true;
    }
    
    // İki değer de obje ise
    if (
      typeof val1 === 'object' && 
      typeof val2 === 'object' && 
      !Array.isArray(val1) && 
      !Array.isArray(val2)
    ) {
      const keys1 = Object.keys(val1);
      const keys2 = Object.keys(val2);
      
      // Anahtar sayıları farklıysa eşit değildir
      if (keys1.length !== keys2.length) {
        return false;
      }
      
      // Her anahtarı karşılaştır
      for (const key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(val2, key) || !this.isEqual(val1[key], val2[key])) {
          return false;
        }
      }
      
      return true;
    }
    
    // Diğer durumlarda basit karşılaştırma yap
    return val1 === val2;
  }
}

export default new HistoryService(); 