import { Request, Response, NextFunction } from 'express';
import localizationService from '../services/localizationService';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

// Tüm çevirileri belirli bir dil için getir
export const getTranslations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = req.params.lang || 'tr';
    
    const translations = await localizationService.getAllTranslationsForLanguage(lang);
    
    res.status(200).json({
      success: true,
      data: translations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Çeviriler getirilirken bir hata oluştu'
    });
  }
};

// Çeviri ekle veya güncelle
export const upsertTranslation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key, namespace, translations } = req.body;
    
    // Mevcut çeviriyi kontrol et
    const existingTranslation = await localizationService.getTranslation(key, namespace);
    const isUpdate = !!existingTranslation;
    
    const result = await localizationService.upsertTranslation({
      key,
      namespace,
      translations
    });
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        const localizationId = `${namespace}:${key}`;
        
        await historyService.recordHistory({
          entityId: localizationId,
          entityType: EntityType.LOCALIZATION,
          action: isUpdate ? ActionType.UPDATE : ActionType.CREATE,
          userId: userId,
          previousData: isUpdate ? existingTranslation : undefined,
          newData: {
            key,
            namespace,
            translations
          }
        });
        
        
        // İlişkili entity'lere history kaydı yap
        await recordRelatedEntityHistory(namespace, key, userId, isUpdate);
        
      } catch (historyError) {
        console.error('History creation failed for localization:', historyError);
        // History hatası localization işlemini engellemesin
      }
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Çeviri eklenirken/güncellenirken bir hata oluştu'
    });
  }
};

// ID'ye göre çeviri getir (hem MongoDB ID hem de namespace:key formatını destekler)
export const getTranslationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const Localization = (await import('../models/Localization')).default;
    let localization;
    
    // ID MongoDB ObjectId formatında mı kontrol et
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId ile ara
      localization = await Localization.findById(id);
    } else if (id.includes(':')) {
      // namespace:key formatında ise parse et
      const [namespace, key] = id.split(':');
      if (namespace && key) {
        localization = await localizationService.getTranslation(key, namespace);
      }
    }
    
    if (!localization) {
      res.status(404).json({
        success: false,
        message: 'Çeviri bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: localization
    });
  } catch (error: any) {
    console.error('Get translation by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Çeviri getirilirken bir hata oluştu'
    });
  }
};

// ID'ye göre çeviri güncelle (hem MongoDB ID hem de namespace:key formatını destekler)
export const updateTranslationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { key, namespace, translations } = req.body;
    
    const Localization = (await import('../models/Localization')).default;
    let existingTranslation;
    let updateMethod: 'mongodb' | 'composite' = 'mongodb';
    
    // ID MongoDB ObjectId formatında mı kontrol et
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId ile ara
      existingTranslation = await Localization.findById(id);
      updateMethod = 'mongodb';
    } else if (id.includes(':')) {
      // namespace:key formatında ise parse et
      const [currentNamespace, currentKey] = id.split(':');
      if (currentNamespace && currentKey) {
        existingTranslation = await localizationService.getTranslation(currentKey, currentNamespace);
        updateMethod = 'composite';
      }
    }
    
    if (!existingTranslation) {
      res.status(404).json({
        success: false,
        message: 'Çeviri bulunamadı'
      });
      return;
    }
    
    let updatedTranslation;
    
    if (updateMethod === 'mongodb') {
      // MongoDB ID ile güncelleme
      const updateData: any = {};
      if (key !== undefined) updateData.key = key;
      if (namespace !== undefined) updateData.namespace = namespace;
      if (translations !== undefined) updateData.translations = translations;
      
      updatedTranslation = await Localization.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // namespace:key ile güncelleme - localizationService kullan
      const [currentNamespace, currentKey] = id.split(':');
      
      const result = await localizationService.upsertTranslation({
        key: key || currentKey,
        namespace: namespace || currentNamespace,
        translations: translations || existingTranslation.translations
      });
      
      updatedTranslation = result;
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityId: id,
          entityType: EntityType.LOCALIZATION,
          action: ActionType.UPDATE,
          userId: userId,
          previousData: existingTranslation.toObject(),
          newData: updatedTranslation?.toObject()
        });
        
        
        // İlişkili entity'lere history kaydı yap
        await recordRelatedEntityHistory(
          updatedTranslation?.namespace || existingTranslation.namespace,
          updatedTranslation?.key || existingTranslation.key,
          userId,
          true
        );
        
      } catch (historyError) {
        console.error('History creation failed for localization update:', historyError);
        // History hatası localization işlemini engellemesin
      }
    }
    
    res.status(200).json({
      success: true,
      data: updatedTranslation
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Çeviri güncellenirken bir hata oluştu'
    });
  }
};

// İlişkili entity'lere history kaydı yap
const recordRelatedEntityHistory = async (namespace: string, key: string, userId: string, isUpdate: boolean) => {
  try {
    // Attribute ve AttributeGroup namespace'leri için ilişkili entity'leri bul
    if (namespace === 'attributes') {
      // Attribute veya AttributeGroup'lara ait name/description translation'ı olabilir
      const AttributeGroup = (await import('../models/AttributeGroup')).default;
      const Attribute = (await import('../models/Attribute')).default;
      
      // AttributeGroup'larda bu translation'ı kullananları bul
      const relatedAttributeGroups = await AttributeGroup.find({
        $or: [
          { 'name.key': key },
          { 'description.key': key }
        ]
      }).populate('name description');
      
      for (const group of relatedAttributeGroups) {
        const isNameTranslation = (group.name as any)?.key === key;
        const fieldName = isNameTranslation ? 'name' : 'description';
        
        await historyService.recordHistory({
          entityId: String(group._id),
          entityType: EntityType.ATTRIBUTE_GROUP,
          entityName: (group.name as any)?.translations?.tr || group.code || 'Unknown',
          action: ActionType.UPDATE,
          userId: userId,
          additionalInfo: {
            localizationChange: {
              key,
              namespace,
              field: fieldName,
              action: isUpdate ? 'updated' : 'created'
            }
          }
        });
      }
      
      // Attribute'larda bu translation'ı kullananları bul
      const relatedAttributes = await Attribute.find({
        $or: [
          { 'name.key': key },
          { 'description.key': key }
        ]
      }).populate('name description');
      
      for (const attribute of relatedAttributes) {
        const isNameTranslation = (attribute.name as any)?.key === key;
        const fieldName = isNameTranslation ? 'name' : 'description';
        
        await historyService.recordHistory({
          entityId: String(attribute._id),
          entityType: EntityType.ATTRIBUTE,
          entityName: (attribute.name as any)?.translations?.tr || attribute.code || 'Unknown',
          action: ActionType.UPDATE,
          userId: userId,
          additionalInfo: {
            localizationChange: {
              key,
              namespace,
              field: fieldName,
              action: isUpdate ? 'updated' : 'created'
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error recording related entity history:', error);
  }
};

// Desteklenen dilleri getir
export const getSupportedLanguages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const languages = await localizationService.getSupportedLanguages();
    
    res.status(200).json({
      success: true,
      data: languages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Desteklenen diller getirilirken bir hata oluştu'
    });
  }
}; 