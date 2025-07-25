import { Request, Response, NextFunction } from 'express';
import Family from '../models/Family';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

// Parent-Child ilişkisini senkronize et
async function syncParentChildRelationship(
  childId: string, 
  parentId: string, 
  action: 'add' | 'remove', 
  userId?: any
): Promise<void> {
  try {
    if (action === 'add') {
      // Parent'ın subFamilies listesine child'ı ekle
      await Family.findByIdAndUpdate(
        parentId,
        { $addToSet: { subFamilies: childId } },
        { new: true }
      );
      
      // History kaydı
      if (userId) {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: parentId,
          action: ActionType.UPDATE,
          userId: String(userId),
          changes: { subFamilies: { action: 'add', value: childId } },
          comment: `Alt aile eklendi: ${childId}`
        });
      }
    } else if (action === 'remove') {
      // Parent'ın subFamilies listesinden child'ı çıkar
      await Family.findByIdAndUpdate(
        parentId,
        { $pull: { subFamilies: childId } },
        { new: true }
      );
      
      // History kaydı
      if (userId) {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: parentId,
          action: ActionType.UPDATE,
          userId: String(userId),
          changes: { subFamilies: { action: 'remove', value: childId } },
          comment: `Alt aile çıkarıldı: ${childId}`
        });
      }
    }
  } catch (error) {
    console.error('Parent-Child relationship sync error:', error);
    // Hata family oluşturmayı engellemsin
  }
}
import Category from '../models/Category';

// GET tüm aileleri getir
export const getFamilies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const filterParams: any = {};
    
    // isActive parametresi
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    // Arama parametresi (name ve code alanlarında)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filterParams.$or = [
        { name: searchRegex },
        { code: searchRegex }
      ];
    }
    
    // Sıralama parametreleri
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder;
    
    // Toplam kayıt sayısını al
    const total = await Family.countDocuments(filterParams);
    
    // Verileri getir
    const families = await Family.find(filterParams)
      .populate('name')
      .populate('description')
      .populate('itemType')
      .populate({
        path: 'parent',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'attributeGroups',
        populate: [
          { path: 'name' },
          { path: 'description' },
          { 
            path: 'attributes', 
            populate: [
              { path: 'name' },
              { path: 'description' }
            ]
          }
        ]
      })
      .populate({
        path: 'attributes',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: families.length,
      total,
      page,
      pages,
      data: families
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Aileler getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir aileyi getir
export const getFamilyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Query parametrelerini al
    const includeAttributes = req.query.includeAttributes === 'true';
    const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
    const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes !== 'false'; // Varsayılan true
    
    // AttributeGroup modelini içe aktar
    const AttributeGroup = await import('../models/AttributeGroup');
    
    // Önce temel Family verisini getir
    const family = await Family.findById(req.params.id)
      .populate('name')
      .populate('description')
      .populate('itemType')
      .populate({
        path: 'parent',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'subFamilies',
        populate: [
          { path: 'name' },
          { path: 'description' },
          {
            path: 'attributeGroups',
            populate: [
              { path: 'name' },
              { path: 'description' },
              {
                path: 'attributes',
                populate: [
                  { path: 'name' },
                  { path: 'description' }
                ]
              }
            ]
          }
        ]
      })
      .populate(includeAttributes ? {
        path: 'attributes',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      } : []);
      
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }
    
    // JSON formatına dönüştür (daha sonra manipüle edebilmek için)
    const response: any = family.toJSON();
    
    // AttributeGroups için özel işlem
    if (includeAttributeGroups) {
      // Grupları manuel olarak doldur
      if (family.attributeGroups && family.attributeGroups.length > 0) {
        const groupIds = family.attributeGroups.map((g: any) => g.toString());
        
        // AttributeGroup'ları ve içindeki öznitelikleri getir
        const groups = await AttributeGroup.default.find({ _id: { $in: groupIds } })
          .populate('name')
          .populate('description')
          .populate({
            path: 'attributes',
            populate: [
              { path: 'name' },
              { path: 'description' }
            ]
          });
        
        // Yanıta ekle
        response.attributeGroups = groups.map(g => g.toJSON());
      }
    }
    
    // Category işleme 
    if (response.category) {
      // Category'nin attributes'larını getir
      if (includeAttributes && response.category) {
        const Category = await import('../models/Category');
        const category = await Category.default.findById(response.category._id)
          .populate({
            path: 'attributes',
            populate: [
              { path: 'name' },
              { path: 'description' }
            ]
          });
          
        if (category && category.attributes) {
          response.category.attributes = category.attributes;
        }
      }
      
      // Category'nin attributeGroups'larını getir
      if (includeAttributeGroups && response.category) {
        const Category = await import('../models/Category');
        const category = await Category.default.findById(response.category._id)
          .populate({
            path: 'attributeGroups',
            populate: [
              { path: 'name' },
              { path: 'description' },
              {
                path: 'attributes',
                populate: [
                  { path: 'name' },
                  { path: 'description' }
                ]
              }
            ]
          });
          
        if (category && category.attributeGroups) {
          response.category.attributeGroups = category.attributeGroups;
        }
      }
    }
    
    // Sonucu gönder
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Aile getirilirken bir hata oluştu'
    });
  }
};

// POST yeni aile oluştur
export const createFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Eğer itemType alanı boş string, null veya undefined ise bu alanı kaldır
    if (!req.body.itemType || req.body.itemType === '' || req.body.itemType === null) {
      delete req.body.itemType;
    }
    
    // Eğer category alanı boş string, null veya undefined ise bu alanı kaldır
    if (!req.body.category || req.body.category === '' || req.body.category === null) {
      delete req.body.category;
    }
    
    // Eğer parent alanı boş string, null veya undefined ise bu alanı kaldır
    if (!req.body.parent || req.body.parent === '' || req.body.parent === null) {
      delete req.body.parent;
    }
    
    const family = await Family.create(req.body);
    
    // Parent-Child ilişkisini senkronize et (YENİ)
    if (family.parent) {
      await syncParentChildRelationship(String(family._id), String(family.parent), 'add', req.user?._id);
    }
    
    // Kategori-Familie ilişkisini senkronize et
    if (family.category) {
      await syncFamilyCategoryRelationship(String(family._id), String(family.category), undefined, 'Aile oluşturuldu');
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: String(family._id),
          entityName: String(family.name),
          action: ActionType.CREATE,
          userId: userId,
          newData: {
            name: String(family.name),
            code: family.code,
            description: String(family.description || ''),
            isActive: family.isActive
          }
        });
      } catch (historyError) {
        console.error('History creation failed for family:', historyError);
        // History hatası aile oluşturmayı engellemesin
      }
    }
    
    // Oluşturulan aileyi itemType ve parent alanlarıyla birlikte getir
    const newFamily = await Family.findById(family._id)
      .populate('name')
      .populate('description')
      .populate('itemType')
      .populate({
        path: 'parent',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      })
      .populate({
        path: 'attributeGroups',
        populate: [
          { path: 'name' },
          { path: 'description' },
          { path: 'attributes', populate: [
            { path: 'name' },
            { path: 'description' }
          ]}
        ]
      })
      .populate({
        path: 'attributes',
        populate: [
          { path: 'name' },
          { path: 'description' }
        ]
      });
    
    res.status(201).json({
      success: true,
      data: newFamily
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Aile oluşturulurken bir hata oluştu'
    });
  }
};

// Bidirectional relationship sync için helper fonksiyon
const syncFamilyCategoryRelationship = async (familyId: string, newCategoryId?: string, oldCategoryId?: string, comment?: string) => {
  try {
    // Eski category'den bu family'yi kaldır
    if (oldCategoryId && oldCategoryId !== newCategoryId) {
      await Category.findByIdAndUpdate(oldCategoryId, {
        $unset: { family: 1 }
      });
      
      // Eski category'nin history'sine yaz
      await historyService.recordHistory({
        entityType: EntityType.CATEGORY,
        entityId: oldCategoryId,
        entityName: 'Category',
        action: ActionType.UPDATE,
        userId: 'system',
        previousData: { family: familyId },
        newData: { family: null },
        comment: comment || 'Aile ilişkisi kaldırıldı (otomatik sync)'
      });
    }
    
    // Yeni category'ye bu family'yi ata
    if (newCategoryId) {
      // Önce yeni category'nin eski family'sini temizle
      const existingCategory = await Category.findById(newCategoryId);
      if (existingCategory?.family && existingCategory.family.toString() !== familyId) {
        await Family.findByIdAndUpdate(existingCategory.family, {
          $unset: { category: 1 }
        });
        
        // Eski family'nin history'sine yaz
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: existingCategory.family.toString(),
          entityName: 'Family',
          action: ActionType.UPDATE,
          userId: 'system',
          previousData: { category: newCategoryId },
          newData: { category: null },
          comment: 'Kategori ilişkisi kaldırıldı (otomatik sync)'
        });
      }
      
      // Yeni category'yi güncelle
      await Category.findByIdAndUpdate(newCategoryId, {
        family: familyId
      });
      
      // Yeni category'nin history'sine yaz
      await historyService.recordHistory({
        entityType: EntityType.CATEGORY,
        entityId: newCategoryId,
        entityName: 'Category',
        action: ActionType.UPDATE,
        userId: 'system',
        previousData: { family: existingCategory?.family || null },
        newData: { family: familyId },
        comment: comment || 'Aile ilişkisi eklendi (otomatik sync)'
      });
    }
  } catch (error) {
    console.error('Family-Category sync error:', error);
  }
};

// updateFamily fonksiyonunu güncelleyelim
export const updateFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Mevcut family'yi getir
    const existingFamily = await Family.findById(id);
    if (!existingFamily) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }

    // Category değişikliğini kontrol et
    const oldCategoryId = existingFamily.category?.toString();
    const newCategoryId = req.body.category;

    // Eğer itemType alanı boş string ise bu alanı kaldır
    if (!req.body.itemType || req.body.itemType === '' || req.body.itemType === null) {
      delete req.body.itemType;
    }
    
    // Eğer category alanı boş string ise bu alanı kaldır
    if (!req.body.category || req.body.category === '' || req.body.category === null) {
      delete req.body.category;
    }
    
    // Eğer parent alanı boş string ise bu alanı kaldır
    if (!req.body.parent || req.body.parent === '' || req.body.parent === null) {
      delete req.body.parent;
    }

    const updateData = { ...req.body };

    // Family'yi güncelle
    const updatedFamily = await Family.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        populate: [
          { path: 'name', model: 'Localization' },
          { path: 'description', model: 'Localization' },
          { path: 'parent', populate: { path: 'name', model: 'Localization' } },
          { path: 'category', populate: { path: 'name', model: 'Localization' } },
          { path: 'itemType', populate: { path: 'name', model: 'Localization' } },
          { path: 'attributes', populate: { path: 'name', model: 'Localization' } },
          { path: 'attributeGroups', populate: { path: 'name', model: 'Localization' } }
        ]
      }
    );

    if (!updatedFamily) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }

    // Bidirectional sync - Category değişikliği varsa
    if (oldCategoryId !== newCategoryId) {
      await syncFamilyCategoryRelationship(id, newCategoryId, oldCategoryId, req.body.comment);
    }

    // History kaydı oluştur
    if (req.body.comment || Object.keys(updateData).length > 0) {
      await historyService.recordHistory({
        entityType: EntityType.FAMILY,
        entityId: id,
        entityName: updatedFamily.code,
        action: ActionType.UPDATE,
        userId: String(req.user?._id || 'system'),
        previousData: {
          name: String(existingFamily.name),
          code: existingFamily.code,
          description: String(existingFamily.description),
          isActive: existingFamily.isActive,
          category: String(existingFamily.category || ''),
          parent: String(existingFamily.parent || ''),
          itemType: String(existingFamily.itemType || ''),
          attributeGroups: (existingFamily.attributeGroups || []).map(id => String(id))
        },
        newData: updateData,
        comment: req.body.comment
      });
    }

    res.status(200).json({
      success: true,
      message: 'Aile başarıyla güncellendi',
      data: updatedFamily
    });

  } catch (error: any) {
    console.error('Family update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Doğrulama hatası',
        errors: validationErrors
      });
      return;
    }

    if (error.name === 'CastError') {
      res.status(400).json({
        success: false,
        message: 'Geçersiz aile ID formatı'
      });
      return;
    }

    next(error);
  }
};

// DELETE aileyi sil
export const deleteFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Silinmeden önce veriyi al
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await Family.findByIdAndDelete(req.params.id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: String(family._id),
          entityName: String(family.name),
          action: ActionType.DELETE,
          userId: userId,
          previousData: {
            name: String(family.name),
            code: family.code,
            description: String(family.description || ''),
            isActive: family.isActive
          }
        });
      } catch (historyError) {
        console.error('History deletion failed for family:', historyError);
        // History hatası silme işlemini engellemesin
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(req.params.id);
    } catch (historyError) {
      console.error('Error deleting family history:', historyError);
      // History silme hatası ana işlemi engellemesin
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Aile silinirken bir hata oluştu'
    });
  }
};

// GET kategoriye göre aileleri getir
export const getFamiliesByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    
    // Bu kategoriye ait tüm aileleri getir
    const families = await Family.find({ 
      category: categoryId,
      isActive: true 
    })
    .populate('name')
    .populate('description')
    .populate('itemType')
    .populate({
      path: 'category',
      populate: [
        { path: 'name' },
        { path: 'description' }
      ]
    })
    .populate({
      path: 'parent',
      populate: [
        { path: 'name' },
        { path: 'description' }
      ]
    })
    .populate({
      path: 'attributeGroups',
      populate: [
        { path: 'name' },
        { path: 'description' },
        { 
          path: 'attributes', 
          populate: [
            { path: 'name' },
            { path: 'description' }
          ]
        }
      ]
    })
    .populate({
      path: 'attributes',
      populate: [
        { path: 'name' },
        { path: 'description' }
      ]
    })
    .sort('name');
    
    res.status(200).json({
      success: true,
      data: families
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Kategori aileleri getirilirken bir hata oluştu'
    });
  }
}; 