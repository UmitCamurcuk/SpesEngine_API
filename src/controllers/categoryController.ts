import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';

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
    
    const category = await Category.findById(id)
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
    
    // attributeGroup -> attributeGroups dönüşümü
    if (categoryData.attributeGroup) {
      categoryData.attributeGroups = Array.isArray(categoryData.attributeGroup) 
        ? categoryData.attributeGroup 
        : [categoryData.attributeGroup];
      delete categoryData.attributeGroup;
    }
    
    const category = await Category.create(categoryData);
    
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
    
    // Field isimleri dönüşümü
    const updateData = { ...req.body };
    
    // parentCategory -> parent dönüşümü
    if (updateData.parentCategory) {
      updateData.parent = updateData.parentCategory;
      delete updateData.parentCategory;
    }
    
    // attributeGroup -> attributeGroups dönüşümü
    if (updateData.attributeGroup) {
      updateData.attributeGroups = Array.isArray(updateData.attributeGroup) 
        ? updateData.attributeGroup 
        : [updateData.attributeGroup];
      delete updateData.attributeGroup;
    }
    
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
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      console.log(`Category not found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
      return;
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