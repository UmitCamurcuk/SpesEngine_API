import { Request, Response, NextFunction } from 'express';
import AttributeGroup from '../models/AttributeGroup';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

// Translation object'inden metin çıkarmak için utility fonksiyon
const getEntityNameFromTranslation = (translationObject: any, fallback: string = 'Unknown'): string => {
  if (!translationObject) return fallback;
  
  // Eğer string ise direkt döndür
  if (typeof translationObject === 'string') {
    return translationObject;
  }
  
  // Translation object ise
  if (translationObject.translations) {
    // Önce Türkçe'yi dene
    if (translationObject.translations.tr) {
      return translationObject.translations.tr;
    }
    // Sonra İngilizce'yi dene
    if (translationObject.translations.en) {
      return translationObject.translations.en;
    }
    // Herhangi bir dili dene
    const firstTranslation = Object.values(translationObject.translations)[0];
    if (firstTranslation && typeof firstTranslation === 'string') {
      return firstTranslation;
    }
  }
  
  // Key varsa onu kullan
  if (translationObject.key) {
    return translationObject.key;
  }
  
  return fallback;
};

// GET tüm öznitelik gruplarını getir
export const getAttributeGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Filtreleme parametrelerini alma
    const filterParams: any = {};
    
    // isActive parametresi
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    const attributeGroups = await AttributeGroup.find(filterParams)
      .populate('attributes')
      .populate('name','key namespace translations.tr translations.en')
      .populate('description','key namespace translations.tr translations.en');
    
    res.status(200).json({
      success: true,
      count: attributeGroups.length,
      data: attributeGroups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik grupları getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir öznitelik grubunu getir
export const getAttributeGroupById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.findById(req.params.id)
      .populate('attributes')
      .populate('name','key namespace translations.tr translations.en')
      .populate('description','key namespace translations.tr translations.en');
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik grubu getirilirken bir hata oluştu'
    });
  }
};

// POST yeni öznitelik grubu oluştur
export const createAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.create(req.body);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: String(attributeGroup._id),
        entityType: EntityType.ATTRIBUTE_GROUP,
        entityName: getEntityNameFromTranslation(attributeGroup.name),
        action: ActionType.CREATE,
        userId: userId,
        newData: attributeGroup.toObject()
      });
    }
    
    res.status(201).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grubu oluşturulurken bir hata oluştu'
    });
  }
};

// PUT öznitelik grubunu güncelle
export const updateAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { nameTranslations, descriptionTranslations, ...otherData } = req.body;
    
    // Güncelleme öncesi mevcut veriyi al (geçmiş için)
    const previousAttributeGroup = await AttributeGroup.findById(id)
      .populate('name','key namespace translations.tr translations.en')
      .populate('description','key namespace translations.tr translations.en');
    
    if (!previousAttributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }

    let updateData = { ...otherData };
    const changedTranslations: any[] = [];

    // Name translations'ını güncelle
    if (nameTranslations && typeof nameTranslations === 'object') {
      const nameTranslationKey = (previousAttributeGroup.name as any)?.key;
      if (nameTranslationKey) {
        const localizationService = require('../services/localizationService').default;
        await localizationService.upsertTranslation({
          key: nameTranslationKey,
          namespace: 'attributes',
          translations: nameTranslations
        });
        
        changedTranslations.push({
          field: 'name',
          translationKey: nameTranslationKey,
          oldValues: (previousAttributeGroup.name as any)?.translations || {},
          newValues: nameTranslations
        });
      }
    }

    // Description translations'ını güncelle
    if (descriptionTranslations && typeof descriptionTranslations === 'object') {
      const descriptionTranslationKey = (previousAttributeGroup.description as any)?.key;
      if (descriptionTranslationKey) {
        const localizationService = require('../services/localizationService').default;
        await localizationService.upsertTranslation({
          key: descriptionTranslationKey,
          namespace: 'attributes',
          translations: descriptionTranslations
        });
        
        changedTranslations.push({
          field: 'description',
          translationKey: descriptionTranslationKey,
          oldValues: (previousAttributeGroup.description as any)?.translations || {},
          newValues: descriptionTranslations
        });
      }
    }
    
    const attributeGroup = await AttributeGroup.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('attributes')
     .populate('name','key namespace translations.tr translations.en')
     .populate('description','key namespace translations.tr translations.en');
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      // Ana attributeGroup güncelleme history'si
      await historyService.recordHistory({
        entityId: id,
        entityType: EntityType.ATTRIBUTE_GROUP,
        entityName: getEntityNameFromTranslation(attributeGroup.name || previousAttributeGroup.name),
        action: ActionType.UPDATE,
        userId: userId,
        previousData: previousAttributeGroup.toObject(),
        newData: attributeGroup.toObject()
      });

      // Translation değişiklikleri için ayrı history kayıtları
      for (const translationChange of changedTranslations) {
        // Translation değişikliği için ayrı history kaydı oluştur
        // await historyService.recordHistory({
        //   entityId: translationChange.translationKey,
        //   entityType: EntityType.TRANSLATION,
        //   entityName: `${translationChange.field}_translation`,
        //   action: ActionType.UPDATE,
        //   userId: userId,
        //   previousData: translationChange.oldValues,
        //   newData: translationChange.newValues,
        //   additionalInfo: {
        //     parentEntityId: id,
        //     parentEntityType: EntityType.ATTRIBUTE_GROUP,
        //     field: translationChange.field
        //   }
        // });
      }
    }
    
    res.status(200).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grubu güncellenirken bir hata oluştu'
    });
  }
};

// DELETE öznitelik grubunu sil
export const deleteAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Silme öncesi veriyi al (geçmiş için)
    const attributeGroup = await AttributeGroup.findById(req.params.id);
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await AttributeGroup.findByIdAndDelete(req.params.id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: req.params.id,
        entityType: EntityType.ATTRIBUTE_GROUP,
        entityName: getEntityNameFromTranslation(attributeGroup.name),
        action: ActionType.DELETE,
        userId: userId,
        previousData: attributeGroup.toObject()
      });
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(req.params.id);
      console.log(`Deleted ${deletedHistoryCount} history records for attribute group ${req.params.id}`);
    } catch (historyError) {
      console.error('Error deleting attribute group history:', historyError);
      // History silme hatası ana işlemi engellemesin
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grubu silinirken bir hata oluştu'
    });
  }
}; 