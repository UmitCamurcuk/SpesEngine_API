import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Categories fetch request received', req.query);
    
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
    
    console.log(`Found ${categories.length} categories out of ${total}`);
    
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
    console.log(`Category fetch by ID request received: ${id}`);
    
    // Query parametrelerini al
    const includeAttributes = req.query.includeAttributes === 'true';
    const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
    const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
    
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
      console.log(`Category not found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
    }
    
    console.log(`Found category: ${category.name}`);
    
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
    console.log('Create category request received:', req.body);
    
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

    console.log('Processed category data:', categoryData);
    
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
        console.log('Category creation history saved successfully');
      } catch (historyError) {
        console.error('History creation failed for category:', historyError);
        // History hatası kategori oluşturmayı engellemesin
      }
    }
    
    console.log(`Created category: ${category.name} with ID: ${category._id}`);
    
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

// PUT kategoriyi güncelle
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Update category request received for ID: ${id}`, req.body);
    
    // Güncellemeden önce mevcut veriyi al
    const oldCategory = await Category.findById(id);
    
    if (!oldCategory) {
      console.log(`Category not found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
    }
    
    // Field isimleri dönüşümü
    const updateData = { ...req.body };
    
    // parentCategory -> parent dönüşümü
    if (updateData.parentCategory) {
      updateData.parent = updateData.parentCategory;
      delete updateData.parentCategory;
    }
    
    // attributeGroups kontrolü
    if (updateData.attributeGroups) {
      updateData.attributeGroups = Array.isArray(updateData.attributeGroups) 
        ? updateData.attributeGroups 
        : [updateData.attributeGroups];
    }
    // Eski attributeGroup -> attributeGroups dönüşümü
    else if (updateData.attributeGroup) {
      updateData.attributeGroups = Array.isArray(updateData.attributeGroup) 
        ? updateData.attributeGroup 
        : [updateData.attributeGroup];
      delete updateData.attributeGroup;
    }

    console.log('Processed update data:', updateData);
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'family',
      select: 'name code description'
    })
    .populate({
      path: 'parent',
      select: 'name code description'
    })
    .populate({
      path: 'attributeGroups',
      select: 'name code description'
    })
    .populate({
      path: 'attributes',
      select: 'name code type description'
    });
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        // Sadece temel alanları karşılaştır
        const previousData = {
          name: String(oldCategory.name),
          code: oldCategory.code,
          description: String(oldCategory.description),
          isActive: oldCategory.isActive,
          family: String(oldCategory.family || ''),
          parent: String(oldCategory.parent || ''),
          attributeGroups: (oldCategory.attributeGroups || []).map(id => String(id))
        };
        
        const newData = {
          name: String(category.name),
          code: category.code,
          description: String(category.description),
          isActive: category.isActive,
          family: String(category.family || ''),
          parent: String(category.parent || ''),
          attributeGroups: (category.attributeGroups || []).map(id => String(id))
        };
        
        await historyService.recordHistory({
          entityType: EntityType.CATEGORY,
          entityId: String(category._id),
          entityName: category.code,
          action: ActionType.UPDATE,
          userId: userId,
          previousData,
          newData
        });
        console.log('Category update history saved successfully');
      } catch (historyError) {
        console.error('History update failed for category:', historyError);
        // History hatası güncellemeyi engellemesin
      }
    }
    
    console.log(`Updated category: ${category.name}`);
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Kategori güncellenirken bir hata oluştu'
    });
  }
};

// DELETE kategoriyi sil
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Delete category request received for ID: ${id}`);
    
    // Silinmeden önce veriyi al
    const category = await Category.findById(id);
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
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
        console.log('Category deletion history saved successfully');
      } catch (historyError) {
        console.error('History deletion failed for category:', historyError);
        // History hatası silme işlemini engellemesin
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(id);
      console.log(`Deleted ${deletedHistoryCount} history records for category ${id}`);
    } catch (historyError) {
      console.error('Error deleting category history:', historyError);
      // History silme hatası ana işlemi engellemesin
    }
    
    console.log(`Deleted category with ID: ${id}`);
    
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
    console.log(`Categories by ItemType request received: ${itemTypeId}`);
    
    // Family modeli üzerinden ItemType'ın kategorilerini bul
    const Family = await import('../models/Family');
    
    // Bu ItemType'a ait tüm aileleri getir
    const families = await Family.default.find({ 
      itemType: itemTypeId,
      isActive: true 
    }).select('category').populate('category');
    
    if (!families || families.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Bu öğe tipi için kategori bulunamadı'
      });
      return;
    }
    
    // Kategorileri unique yap ve tree format'a çevir
    const categoryIds = [...new Set(families.map(f => f.category?._id?.toString()).filter(Boolean))];
    
    const categories = await Category.find({ 
      _id: { $in: categoryIds },
      isActive: true 
    })
    .populate('name', 'key namespace translations')
    .populate('description', 'key namespace translations')
    .populate('parent')
    .sort('name');
    
    console.log(`Found ${categories.length} categories for ItemType: ${itemTypeId}`);
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    console.error('Error fetching categories by ItemType:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ItemType kategorileri getirilirken bir hata oluştu'
    });
  }
}; 