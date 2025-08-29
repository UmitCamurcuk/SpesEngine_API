import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';
import Family from '../models/Family';

// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const filterParams: any = { isActive: req.query.isActive === 'false' ? false : true };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filterParams.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }
    
    if (req.query.family) {
      filterParams.family = req.query.family;
    }
    
    if (req.query.parentCategory) {
      filterParams.parent = req.query.parentCategory;
    }
    
    if (req.query.attributeGroups) {
      filterParams.attributeGroups = { $in: Array.isArray(req.query.attributeGroups) 
        ? req.query.attributeGroups 
        : [req.query.attributeGroups] };  
    }
    
    // Toplam kayıt sayısını al
    const total = await Category.countDocuments(filterParams);
    
    // Sıralama seçeneği
    const sortOption: any = {};
    if (req.query.sortBy) {
      sortOption[req.query.sortBy as string] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOption.name = 1; // Varsayılan olarak isme göre artan sırala
    }
    
    // Kategorileri getir
    const categories = await Category.find(filterParams)
      .populate({
        path: 'family',
        select: 'name code description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'parent',
        select: 'name code description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'attributeGroups',
        select: 'name code description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate('name','key namespace translations')
      .populate('description','key namespace translations')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: categories.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      data: categories
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kategoriler getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir kategoriyi getir
export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Query parametrelerini al
    const includeAttributes = req.query.includeAttributes === 'true';
    const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
    const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
    const includeFamilies = req.query.includeFamilies === 'true';
    
    // Query oluştur
    let query = Category.findById(id)
      .populate({
        path: 'family',
        select: 'name code description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'parent',
        select: 'name code description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate([
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]);
    
    // Attributes'ları include et
    if (includeAttributes) {
      query = query.populate({
        path: 'attributes',
        select: 'name code type description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      });
    }
    
    // AttributeGroups'ları include et
    if (includeAttributeGroups) {
      if (populateAttributeGroupsAttributes) {
        query = query.populate({
          path: 'attributeGroups',
          select: 'name code description attributes',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' },
            {
              path: 'attributes',
              model: 'Attribute',
              select: 'name code type description isRequired options attributeGroup validations',
              populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
              ]
            }
          ]
        });
      } else {
        query = query.populate({
          path: 'attributeGroups',
          select: 'name code description',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' }
          ]
        });
      }
    }
    
    // Sorguyu çalıştır
    const category = await query.exec();
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
    }

    // Family'leri include et
    if (includeFamilies) {
      let families: any[] = [];

      // Eğer bu kategori bir family'ye bağlıysa, o family'yi ve alt family'lerini getir
      if (category.family) {
        const mainFamily = await Family.findById(category.family)
          .populate({
            path: 'name',
            select: 'key namespace translations'
          })
          .populate({
            path: 'description',
            select: 'key namespace translations'
          })
          .populate({
            path: 'parent',
            select: 'name code description isActive'
          })
          .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description validations isRequired isActive',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' }
                ]
              }
            ]
          })
          .lean();

        if (mainFamily) {
          // Ana family'nin alt family'lerini bul
          const subFamilies = await Family.find({ 
            parent: mainFamily._id,
            isActive: true 
          })
          .populate({
            path: 'name',
            select: 'key namespace translations'
          })
          .populate({
            path: 'description',
            select: 'key namespace translations'
          })
          .populate({
            path: 'parent',
            select: 'name code description isActive'
          })
          .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' }
                ]
              }
            ]
          })
          .lean();

          (mainFamily as any).subfamilies = subFamilies;
          families = [mainFamily];
        }
      } else {
        // Bu kategori bir family'ye bağlı değilse, bu kategoriye bağlı family'leri bul
        families = await Family.find({ 
          category: category._id,
          isActive: true 
        })
        .populate({
          path: 'name',
          select: 'key namespace translations'
        })
        .populate({
          path: 'description',
          select: 'key namespace translations'
        })
        .populate({
          path: 'parent',
          select: 'name code description isActive'
        })
        .populate({
          path: 'attributeGroups',
          select: 'name code description attributes isActive',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' },
            {
              path: 'attributes',
              select: 'name code type description isRequired isActive',
              populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
              ]
            }
          ]
        })
        .lean();

        // Her family için alt family'leri bul
        for (const family of families) {
          const subFamilies = await Family.find({ 
            parent: family._id,
            isActive: true 
          })
          .populate({
            path: 'name',
            select: 'key namespace translations'
          })
          .populate({
            path: 'description',
            select: 'key namespace translations'
          })
          .populate({
            path: 'parent',
            select: 'name code description isActive'
          })
          .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' }
                ]
              }
            ]
          })
          .lean();

          (family as any).subfamilies = subFamilies;
        }
      }

      (category as any).families = families;

      // Alt kategorilerin family'lerini de bul (eğer bu kategori alt kategori ise)
      const subcategories = await Category.find({ 
        parent: category._id,
        isActive: true 
      })
      .populate({
        path: 'name',
        select: 'key namespace translations'
      })
      .populate({
        path: 'description',
        select: 'key namespace translations'
      })
      .populate({
        path: 'attributeGroups',
        select: 'name code description attributes isActive',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' },
          {
            path: 'attributes',
            select: 'name code type description isRequired isActive',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' }
            ]
          }
        ]
      })
      .lean();

      // Her alt kategori için family'leri bul
      for (const subcat of subcategories) {
        const subcatFamilies = await Family.find({ 
          category: subcat._id,
          isActive: true 
        })
        .populate({
          path: 'name',
          select: 'key namespace translations'
        })
        .populate({
          path: 'description',
          select: 'key namespace translations'
        })
        .populate({
          path: 'parent',
          select: 'name code description isActive'
        })
        .populate({
          path: 'attributeGroups',
          select: 'name code description attributes isActive',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' },
            {
              path: 'attributes',
              select: 'name code type description isRequired isActive',
              populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
              ]
            }
          ]
        })
        .lean();

        // Her alt kategorinin family'leri için alt family'leri bul
        for (const family of subcatFamilies) {
          const subFamilies = await Family.find({ 
            parent: family._id,
            isActive: true 
          })
          .populate({
            path: 'name',
            select: 'key namespace translations'
          })
          .populate({
            path: 'description',
            select: 'key namespace translations'
          })
          .populate({
            path: 'parent',
            select: 'name code description isActive'
          })
          .populate({
            path: 'attributeGroups',
            select: 'name code description attributes isActive',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' }
                ]
              }
            ]
          })
          .lean();

          (family as any).subfamilies = subFamilies;
        }

        (subcat as any).families = subcatFamilies;
      }

      (category as any).subcategories = subcategories;
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kategori getirilirken bir hata oluştu'
    });
  }
};

// POST yeni kategori oluştur
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    
    // Field isimleri dönüşümü
    const categoryData = { ...req.body };
    
    // Eğer family alanı boş string ise bu alanı kaldır
    if (categoryData.family === '') {
      delete categoryData.family;
    }
    
    // parentCategory -> parent dönüşümü
    if (categoryData.parentCategory) {
      categoryData.parent = categoryData.parentCategory;
      delete categoryData.parentCategory;
    }
    
    // attributeGroups kontrolü
    if (categoryData.attributeGroups) {
      categoryData.attributeGroups = Array.isArray(categoryData.attributeGroups) 
        ? categoryData.attributeGroups 
        : [categoryData.attributeGroups];
    }
    // Eski attributeGroup -> attributeGroups dönüşümü
    else if (categoryData.attributeGroup) {
      categoryData.attributeGroups = Array.isArray(categoryData.attributeGroup) 
        ? categoryData.attributeGroup 
        : [categoryData.attributeGroup];
      delete categoryData.attributeGroup;
    }

    
    const category = await Category.create(categoryData);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.CATEGORY,
          entityId: String(category._id),
          entityName: category.code,
          action: ActionType.CREATE,
          userId: userId,
          newData: {
            name: String(category.name),
            code: category.code,
            description: String(category.description),
            isActive: category.isActive,
            family: String(category.family || ''),
            parent: String(category.parent || ''),
            attributeGroups: (category.attributeGroups || []).map(id => String(id))
          }
        });
      } catch (historyError) {
        console.error('History creation failed for category:', historyError);
        // History hatası kategori oluşturmayı engellemesin
      }
    }
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Kategori oluşturulurken bir hata oluştu'
    });
  }
};

// Bidirectional relationship sync için helper fonksiyon
const syncCategoryFamilyRelationship = async (categoryId: string, newFamilyId?: string, oldFamilyId?: string, comment?: string) => {
  try {
    // Eski family'den bu category'yi kaldır
    if (oldFamilyId && oldFamilyId !== newFamilyId) {
      await Family.findByIdAndUpdate(oldFamilyId, {
        $unset: { category: 1 }
      });
      
      // Eski family'nin history'sine yaz
      await historyService.recordHistory({
        entityType: EntityType.FAMILY,
        entityId: oldFamilyId,
        entityName: 'Family',
        action: ActionType.UPDATE,
        userId: 'system',
        previousData: { category: categoryId },
        newData: { category: null },
        comment: comment || 'Kategori ilişkisi kaldırıldı (otomatik sync)'
      });
    }
    
    // Yeni family'ye bu category'yi ata
    if (newFamilyId) {
      // Önce yeni family'nin eski category'sini temizle
      const existingFamily = await Family.findById(newFamilyId);
      if (existingFamily?.category && existingFamily.category.toString() !== categoryId) {
        await Category.findByIdAndUpdate(existingFamily.category, {
          $unset: { family: 1 }
        });
        
        // Eski category'nin history'sine yaz
        await historyService.recordHistory({
          entityType: EntityType.CATEGORY,
          entityId: existingFamily.category.toString(),
          entityName: 'Category',
          action: ActionType.UPDATE,
          userId: 'system',
          previousData: { family: newFamilyId },
          newData: { family: null },
          comment: 'Aile ilişkisi kaldırıldı (otomatik sync)'
        });
      }
      
      // Yeni family'yi güncelle
      await Family.findByIdAndUpdate(newFamilyId, {
        category: categoryId
      });
      
      // Yeni family'nin history'sine yaz
      await historyService.recordHistory({
        entityType: EntityType.FAMILY,
        entityId: newFamilyId,
        entityName: 'Family',
        action: ActionType.UPDATE,
        userId: 'system',
        previousData: { category: existingFamily?.category || null },
        newData: { category: categoryId },
        comment: comment || 'Kategori ilişkisi eklendi (otomatik sync)'
      });
    }
  } catch (error) {
    console.error('Category-Family sync error:', error);
  }
};

// updateCategory fonksiyonunu güncelle
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Mevcut category'yi getir
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      res.status(404).json({ 
        success: false, 
        message: 'Kategori bulunamadı' 
      });
      return;
    }
    
    // Family değişikliğini kontrol et
    const oldFamilyId = existingCategory.family?.toString();
    const newFamilyId = req.body.family;
    
    // Eğer family alanı boş string, null veya undefined ise bu alanı kaldır
    if (!req.body.family || req.body.family === '' || req.body.family === null) {
      delete req.body.family;
    }
    
    // Eğer parent alanı boş string, null veya undefined ise bu alanı kaldır
    if (!req.body.parent || req.body.parent === '' || req.body.parent === null) {
      delete req.body.parent;
    }
    
    // parentCategory -> parent dönüşümü
    if (req.body.parentCategory) {
      req.body.parent = req.body.parentCategory;
      delete req.body.parentCategory;
    }
    
    // Field isimleri dönüşümü
    const updateData = { ...req.body };
    
    // Kategoriyi güncelle
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        populate: [
          { path: 'name', model: 'Localization' },
          { path: 'description', model: 'Localization' },
          { path: 'parent', populate: { path: 'name', model: 'Localization' } },
          { path: 'family', populate: { path: 'name', model: 'Localization' } },
          { path: 'attributes', populate: { path: 'name', model: 'Localization' } },
          { path: 'attributeGroups', populate: { path: 'name', model: 'Localization' } }
        ]
      }
    );

    if (!updatedCategory) {
      res.status(404).json({ 
        success: false, 
        message: 'Kategori bulunamadı' 
      });
      return;
    }

    // Bidirectional sync - Family değişikliği varsa
    if (oldFamilyId !== newFamilyId) {
      await syncCategoryFamilyRelationship(id, newFamilyId, oldFamilyId, req.body.comment);
    }

    // History kaydı oluştur
    if (req.body.comment || Object.keys(updateData).length > 0) {
      await historyService.recordHistory({
        entityType: EntityType.CATEGORY,
        entityId: id,
        entityName: updatedCategory.code,
        action: ActionType.UPDATE,
        userId: String(req.user?._id),
        previousData: {
          name: String(existingCategory.name),
          code: existingCategory.code,
          description: String(existingCategory.description),
          isActive: existingCategory.isActive,
          family: String(existingCategory.family || ''),
          parent: String(existingCategory.parent || ''),
          attributeGroups: (existingCategory.attributeGroups || []).map(id => String(id))
        },
        newData: updateData,
        comment: req.body.comment
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi',
      data: updatedCategory
    });

  } catch (error: any) {
    console.error('Category update error:', error);
    
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
        message: 'Geçersiz kategori ID formatı'
      });
      return;
    }

    next(error);
  }
};

// DELETE kategoriyi sil
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Silinmeden önce veriyi al
    const category = await Category.findById(id);
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await Category.findByIdAndDelete(id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.CATEGORY,
          entityId: String(category._id),
          entityName: category.code,
          action: ActionType.DELETE,
          userId: userId,
          previousData: {
            name: String(category.name),
            code: category.code,
            description: String(category.description),
            isActive: category.isActive,
            family: String(category.family || ''),
            parent: String(category.parent || ''),
            attributeGroups: (category.attributeGroups || []).map(id => String(id))
          }
        });
      } catch (historyError) {
        console.error('History deletion failed for category:', historyError);
        // History hatası silme işlemini engellemesin
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(id);
    } catch (historyError) {
      console.error('Error deleting category history:', historyError);
      // History silme hatası ana işlemi engellemesin
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Kategori silinirken bir hata oluştu'
    });
  }
};

// GET ItemType'a göre kategorileri getir
export const getCategoriesByItemType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemTypeId } = req.params;
    
    // Önce ItemType'ı bul ve category'sini al
    const ItemType = await import('../models/ItemType');
    const itemType = await ItemType.default.findById(itemTypeId);
    

    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'ItemType bulunamadı'
      });
      return;
    }
    
    // ItemType'ın category'si yoksa boş dön
    if (!itemType.category) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Bu ItemType için kategori tanımlanmamış'
      });
      return;
    }
    
    // ItemType'ın category'sini getir
    const category = await Category.findById(itemType.category)
      .populate('name', 'key namespace translations')
      .populate('description', 'key namespace translations')
      .populate('parent');
    
    if (!category) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'ItemType kategorisi bulunamadı'
      });
      return;
    }
    
    // Bu kategoriye ait tüm Family'leri de getir
    const Family = await import('../models/Family');
    const families = await Family.default.find({ 
      category: itemType.category,
      isActive: true 
    })
    .select('_id name code')
    .populate('name', 'key namespace translations');
    
    // Bu kategorinin alt kategorilerini bul (parent field'ı bu kategori olan kategoriler)
    const subCategories = await Category.find({ 
      parent: itemType.category,
      isActive: true 
    })
    .populate('name', 'key namespace translations')
    .populate('description', 'key namespace translations')
    .populate('parent');
    
    // Her alt kategori için de family'leri getir
    const subCategoriesWithFamilies = await Promise.all(
      subCategories.map(async (subCat) => {
        const subFamilies = await Family.default.find({ 
          category: subCat._id,
          isActive: true 
        })
        .select('_id name code')
        .populate('name', 'key namespace translations');
        

        
        return {
          ...subCat.toObject(),
          families: subFamilies
        };
      })
    );
    
    // Ana kategoriyi response'a ekle
    const categoryWithFamilies = {
      ...category.toObject(),
      families: families,
      subCategories: subCategoriesWithFamilies
    };
    
    res.status(200).json({
      success: true,
      data: [categoryWithFamilies]
    });
  } catch (error: any) {
    console.error('Error fetching categories by ItemType:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ItemType kategorileri getirilirken bir hata oluştu'
    });
  }
}; 