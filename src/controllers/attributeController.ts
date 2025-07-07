import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Attribute from '../models/Attribute';
import AttributeGroup from '../models/AttributeGroup';
import historyService from '../services/historyService';
import entityService from '../services/entityService';
import notificationService from '../services/notificationService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';
import localizationService from '../services/localizationService';

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

// GET tüm öznitelikleri getir
export const getAttributes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const filterParams: any = {};
    
    // isActive parametresi özellikle belirtilmişse
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    // Arama parametresi (name, code ve description alanlarında)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filterParams.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Tip filtrelemesi
    if (req.query.type) {
      filterParams.type = req.query.type;
    }
    
    // Gerekli/Zorunlu filtrelemesi
    if (req.query.isRequired !== undefined) {
      filterParams.isRequired = req.query.isRequired === 'true';
    }
    
    // Öznitelik grubu filtrelemesi
    if (req.query.attributeGroup) {
      filterParams.attributeGroup = req.query.attributeGroup;
    }
    
    // Toplam kayıt sayısını al
    const total = await Attribute.countDocuments(filterParams);
    
    // Sıralama parametreleri
    const sort = req.query.sort || 'name';
    const direction = req.query.direction === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sort as string] = direction;
    
    
    // Verileri getir
    const attributes = await Attribute.find(filterParams)
      .populate('name','key namespace translations')
      .populate('description','key namespace translations')   
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: attributes.length,
      total,
      page,
      limit,
      pages,
      data: attributes
    });
  } catch (error: any) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelikler getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir özniteliği getir
export const getAttributeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const attribute = await Attribute.findById(id)
      .populate('name','key namespace translations')
      .populate('description','key namespace translations')
      .populate({
        path: 'options',
        select: 'name code type',
        populate: {
          path: 'name',
          select: 'key namespace translations'
        }
      })
      .populate({
        path: 'optionType',
        select: 'name code type',
        populate: {
          path: 'name',
          select: 'key namespace translations'
        }
      });
    
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attribute
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik getirilirken bir hata oluştu'
    });
  }
};

// POST yeni öznitelik oluştur
export const createAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // AttributeGroup bilgisini ayır
    const { attributeGroup, options, optionType, ...attributeData } = req.body;

    // SELECT veya MULTISELECT için options ve optionType kontrolü
    if (attributeData.type === 'select' || attributeData.type === 'multiselect') {
      if (!optionType) {
        res.status(400).json({
          success: false,
          message: 'SELECT veya MULTISELECT için optionType zorunludur'
        });
        return;
      }

      // optionType'ın geçerli bir attribute olduğunu kontrol et
      const optionTypeAttribute = await Attribute.findById(optionType);
      if (!optionTypeAttribute) {
        res.status(400).json({
          success: false,
          message: 'Geçersiz optionType'
        });
        return;
      }

      // options dizisindeki her bir ID'nin geçerli bir attribute olduğunu kontrol et
      if (options && options.length > 0) {
        const optionAttributes = await Attribute.find({ 
          _id: { $in: options },
          type: optionTypeAttribute.type // Seçeneklerin tipi optionType ile aynı olmalı
        });

        if (optionAttributes.length !== options.length) {
          res.status(400).json({
            success: false,
            message: 'Bazı seçenekler bulunamadı veya yanlış tipte'
          });
          return;
        }

        attributeData.options = options;
      } else {
        attributeData.options = [];
      }

      attributeData.optionType = optionType;
    }

    // Validasyon verilerini kontrol et
    if (attributeData.validations) {
      
      // Validasyon objesi boş ise undefined yap
      if (Object.keys(attributeData.validations).length === 0) {
        attributeData.validations = undefined;
      } else {
        // TCKNO gibi validasyon verilerinin sayısal değerlerini kontrol et
        if (attributeData.type === 'number' && typeof attributeData.validations === 'object') {
          
          // min değeri için özel kontrol
          if ('min' in attributeData.validations) {
            const minVal = Number(attributeData.validations.min);
            attributeData.validations.min = minVal;
          }
          
          // max değeri için özel kontrol
          if ('max' in attributeData.validations) {
            const maxVal = Number(attributeData.validations.max);
            attributeData.validations.max = maxVal;
          }
          
          // Boolean değerleri kontrol et
          ['isInteger', 'isPositive', 'isNegative', 'isZero'].forEach(prop => {
            if (prop in attributeData.validations) {
              const boolVal = Boolean(attributeData.validations[prop]);
              attributeData.validations[prop] = boolVal;
            }
          });
        }
        
        // Diğer tip validasyonları için de kontrol et
        if (attributeData.type === 'text' && typeof attributeData.validations === 'object') {
          // Text validasyonları için özel kontroller
          if ('minLength' in attributeData.validations) {
            attributeData.validations.minLength = Number(attributeData.validations.minLength);
          }
          if ('maxLength' in attributeData.validations) {
            attributeData.validations.maxLength = Number(attributeData.validations.maxLength);
          }
        }
        
        // Tarih validasyonları için özel kontroller
        if (attributeData.type === 'date' && typeof attributeData.validations === 'object') {
          // Tarih validasyonları için işlemler
          // (minDate ve maxDate zaten string olarak geliyor)
        }
        
        // Select/MultiSelect validasyonları için özel kontroller
        if ((attributeData.type === 'select' || attributeData.type === 'multiselect') && 
            typeof attributeData.validations === 'object') {
          if ('minSelections' in attributeData.validations) {
            attributeData.validations.minSelections = Number(attributeData.validations.minSelections);
          }
          if ('maxSelections' in attributeData.validations) {
            attributeData.validations.maxSelections = Number(attributeData.validations.maxSelections);
          }
        }
      }
    } else {
    }
    
    const newAttribute = await Attribute.create(attributeData);
    
    // Oluşturulan attribute'u populate et
    const populatedAttribute = await Attribute.findById(newAttribute._id)
      .populate('name','key namespace translations')
      .populate('description','key namespace translations');
    
    // Kayıt sonrası doğrula
    
    // AttributeGroup'a attribute'u ekle
    let affectedAttributeGroup = null;
    if (attributeGroup) {
      try {
        
        const updatedGroup = await AttributeGroup.findByIdAndUpdate(
          attributeGroup,
          { $addToSet: { attributes: newAttribute._id } },
          { new: true }
        ).populate('name','key namespace translations');
        
        if (updatedGroup) {
          affectedAttributeGroup = updatedGroup;
        } else {
        }
      } catch (groupError) {          
        // AttributeGroup hatası attribute oluşturmayı engellemez
      }
    } else {
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      // Etkilenen entity'ler listesi
      const affectedEntities = [];
      if (affectedAttributeGroup) {
        affectedEntities.push({
          entityId: affectedAttributeGroup._id as mongoose.Types.ObjectId,
          entityType: EntityType.ATTRIBUTE_GROUP,
          entityName: getEntityNameFromTranslation(affectedAttributeGroup.name),
          role: 'secondary' as const
        });
      }
      
      await historyService.recordHistory({
        entityId: String(newAttribute._id),
        entityType: EntityType.ATTRIBUTE,
        action: ActionType.CREATE,
        userId: userId,
        newData: {
          name: (populatedAttribute?.name as any)?.translations?.tr || populatedAttribute?.code || 'Unknown',
          code: populatedAttribute?.code,
          type: populatedAttribute?.type,
          description: (populatedAttribute?.description as any)?.translations?.tr || '',
          isRequired: populatedAttribute?.isRequired,
          isActive: populatedAttribute?.isActive,
          options: populatedAttribute?.options,
          validations: populatedAttribute?.validations,
          _id: String(populatedAttribute?._id),
          createdAt: populatedAttribute?.createdAt,
          updatedAt: populatedAttribute?.updatedAt
        },
        affectedEntities
      });
    }
    
    res.status(201).json({
      success: true,
      data: populatedAttribute
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik oluşturulurken bir hata oluştu'
    });
  }
};

// PUT mevcut özniteliği güncelle
export const updateAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { options, comment, attributeGroups, ...updateData } = req.body;

    // Mevcut attribute'u bul
    const existingAttribute = await Attribute.findById(id);
    if (!existingAttribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }

    // Sadece değişen alanları tespit et
    const changedFields: any = {};
    
    // Basit alanları kontrol et
    Object.keys(updateData).forEach(key => {
      if ((existingAttribute as any)[key] !== updateData[key]) {
        changedFields[key] = updateData[key];
      }
    });

    // SELECT/MULTISELECT için options kontrolü
    if (options && (existingAttribute.type === 'select' || existingAttribute.type === 'multiselect')) {
      // Options ID'lerini kontrol et - hem string array hem de object array destekle
      let optionIds: string[];
      
      if (Array.isArray(options)) {
        optionIds = options.map((opt: any) => {
          // Eğer string ise direkt kullan, obje ise _id field'ını al
          return typeof opt === 'string' ? opt : opt._id;
        }).filter(Boolean); // undefined/null değerleri filtrele
      } else {
        optionIds = [];
      }

      // Mevcut options ile karşılaştır
      const currentOptionIds = (existingAttribute.options || []).map(opt => opt.toString()).sort();
      const newOptionIds = optionIds.sort();
      
      if (JSON.stringify(currentOptionIds) !== JSON.stringify(newOptionIds)) {
        if (optionIds.length > 0) {
          const foundOptions = await Attribute.find({
            _id: { $in: optionIds },
            type: 'readonly'
          });

          if (foundOptions.length !== optionIds.length) {
            res.status(400).json({
              success: false,
              message: 'Bazı seçenekler bulunamadı veya yanlış tipte'
            });
            return;
          }
        }

        changedFields.options = optionIds;
      }
    }

    // Attribute Groups kontrolü
    if (attributeGroups && Array.isArray(attributeGroups)) {
      // Mevcut grupları al
      const currentGroups = await AttributeGroup.find({ attributes: id }).select('_id');
      const currentGroupIds = currentGroups.map(g => String(g._id)).sort();
      const newGroupIds = [...attributeGroups].sort();
      
      if (JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds)) {
        changedFields.attributeGroups = attributeGroups;
      }
    }

    // Eğer hiçbir alan değişmemişse güncelleme yapma
    if (Object.keys(changedFields).length === 0 && !changedFields.attributeGroups) {
      res.status(200).json({
        success: true,
        message: 'Değişiklik bulunamadı',
        data: existingAttribute
      });
      return;
    }

    // Attribute'u güncelle
    const updatedAttribute = await Attribute.findByIdAndUpdate(
      id,
      changedFields,
      { new: true }
    ).populate('name', 'key namespace translations')
     .populate('description', 'key namespace translations')
     .populate({
       path: 'options',
       select: 'name code type',
       populate: {
         path: 'name',
         select: 'key namespace translations'
       }
     });

    // Attribute Groups güncelleme
    if (changedFields.attributeGroups) {
      // Önce tüm gruplardan bu attribute'ı kaldır
      await AttributeGroup.updateMany(
        { attributes: id },
        { $pull: { attributes: id } }
      );

      // Sonra yeni gruplara ekle
      if (attributeGroups.length > 0) {
        await AttributeGroup.updateMany(
          { _id: { $in: attributeGroups } },
          { $addToSet: { attributes: id } }
        );
      }
    }

    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      await historyService.recordHistory({
        entityType: EntityType.ATTRIBUTE,
        entityId: id,
        action: ActionType.UPDATE,
        changes: changedFields, // Sadece değişen alanları kaydet
        comment: comment || undefined,
        userId,
        entityName: getEntityNameFromTranslation(existingAttribute.name),
        entityCode: existingAttribute.code
      });
    }

    res.status(200).json({
      success: true,
      data: updatedAttribute
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik güncellenirken bir hata oluştu'
    });
  }
};

// DELETE özniteliği sil
export const deleteAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Silme öncesi veriyi al (geçmiş için)
    const attribute = await Attribute.findById(id);
    
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    // İlişkili AttributeGroup'ları bul
    const relatedGroups = await AttributeGroup.find({ attributes: id })
      .populate('name','key namespace translations');
    
    // Veriyi sil
    await Attribute.findByIdAndDelete(id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      // Etkilenen AttributeGroup'lar
      const affectedEntities = relatedGroups.map(group => ({
        entityId: group._id as mongoose.Types.ObjectId,
        entityType: EntityType.ATTRIBUTE_GROUP,
        entityName: getEntityNameFromTranslation(group.name),
        role: 'secondary' as const
      }));
      
      await historyService.recordHistory({
        entityId: id,
        entityType: EntityType.ATTRIBUTE,
        entityName: getEntityNameFromTranslation(attribute.name),
        entityCode: attribute.code,
        action: ActionType.DELETE,
        userId: userId,
        previousData: {
          name: attribute.name,
          code: attribute.code,
          type: attribute.type,
          description: attribute.description,
          isRequired: attribute.isRequired,
          isActive: attribute.isActive,
          options: attribute.options
        },
        affectedEntities
      });

      // Bildirim sistemi - onDelete true ise bildirim gönder
      if (attribute.notificationSettings?.onDelete) {
        try {
          const userName = (req.user as any)?.name || (req.user as any)?.username || 'Bilinmeyen Kullanıcı';
          
          await notificationService.sendEntityDeleteNotification(
            'attribute',
            id,
            getEntityNameFromTranslation(attribute.name),
            userId,
            userName
          );
        } catch (notificationError) {
          console.error('Notification error:', notificationError);
          // Bildirim hatası ana işlemi engellemez
        }
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(id);
          } catch (historyError) {
      // History silme hatası ana işlemi engellemesin
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik silinirken bir hata oluştu'
    });
  }
};

// GET özniteliğin bağlı olduğu grupları getir
export const getAttributeGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Attribute'ın var olup olmadığını kontrol et
    const attribute = await Attribute.findById(id);
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    // Bu attribute'ı içeren AttributeGroup'ları bul
    const attributeGroups = await AttributeGroup.find({ 
      attributes: id,
      isActive: true 
    })
    .populate({
      path: 'attributes',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    })
    .populate('name','key namespace translations')
    .populate('description','key namespace translations');
    
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

// PUT özniteliğin bağlı olduğu grupları güncelle
export const updateAttributeGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { attributeGroups } = req.body; // Yeni grup ID'leri dizisi
    
    // Attribute'ın var olup olmadığını kontrol et
    const attribute = await Attribute.findById(id);
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    // Önceki grupları bul
    const previousGroups = await AttributeGroup.find({ attributes: id })
      .populate('name','key namespace translations');
    
    // Önce bu attribute'ı tüm gruplardan kaldır
    await AttributeGroup.updateMany(
      { attributes: id },
      { $pull: { attributes: id } }
    );
    
    // Sonra seçilen gruplara ekle
    let newGroups: any[] = [];
    if (attributeGroups && attributeGroups.length > 0) {
      await AttributeGroup.updateMany(
        { _id: { $in: attributeGroups } },
        { $addToSet: { attributes: id } }
      );
      
      // Yeni grupları getir
      newGroups = await AttributeGroup.find({ _id: { $in: attributeGroups } })
        .populate('name','key namespace translations');
    }
    
    // Güncellenmiş grupları getir
    const updatedGroups = await AttributeGroup.find({ 
      attributes: id,
      isActive: true 
    })
    .populate({
      path: 'attributes',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    })
    .populate('name','key namespace translations')
    .populate('description','key namespace translations');
    
    // History kaydı oluştur - ilişki değişiklikleri için
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      // Kaldırılan gruplar için history
      for (const removedGroup of previousGroups) {
        if (!attributeGroups || !attributeGroups.includes((removedGroup._id as mongoose.Types.ObjectId).toString())) {
          await historyService.recordRelationshipChange({
            primaryEntityId: id,
            primaryEntityType: EntityType.ATTRIBUTE,
            primaryEntityName: getEntityNameFromTranslation(attribute.name),
            secondaryEntityId: removedGroup._id as mongoose.Types.ObjectId,
            secondaryEntityType: EntityType.ATTRIBUTE_GROUP,
            secondaryEntityName: getEntityNameFromTranslation(removedGroup.name),
            action: 'remove',
            relationshipType: 'attribute_group_membership',
            userId
          });
        }
      }
      
      // Eklenen gruplar için history
      for (const addedGroup of newGroups) {
        const wasAlreadyMember = previousGroups.some(pg => (pg._id as mongoose.Types.ObjectId).toString() === (addedGroup._id as mongoose.Types.ObjectId).toString());
        if (!wasAlreadyMember) {
          await historyService.recordRelationshipChange({
            primaryEntityId: id,
            primaryEntityType: EntityType.ATTRIBUTE,
            primaryEntityName: getEntityNameFromTranslation(attribute.name),
            secondaryEntityId: addedGroup._id as mongoose.Types.ObjectId,
            secondaryEntityType: EntityType.ATTRIBUTE_GROUP,
            secondaryEntityName: getEntityNameFromTranslation(addedGroup.name),
            action: 'add',
            relationshipType: 'attribute_group_membership',
            userId
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      count: updatedGroups.length,
      data: updatedGroups
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grupları güncellenirken bir hata oluştu'
    });
  }
}; 