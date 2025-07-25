import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';
import mongoose from 'mongoose';
import ItemType from '../models/ItemType';
import Category from '../models/Category';
import AttributeGroup from '../models/AttributeGroup';

// GET tüm öğeleri getir
export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    
    // Arama parametresi artık attributes'larda aranabilir
    // TODO: Attributes içinde arama yapılacaksa burada implement edilebilir
    
    // ItemType, Family ve Category filtreleme
    if (req.query.itemType) {
      filterParams.itemType = new mongoose.Types.ObjectId(req.query.itemType as string);
    }
    
    if (req.query.family) {
      filterParams.family = new mongoose.Types.ObjectId(req.query.family as string);
    }
    
    if (req.query.category) {
      filterParams.category = new mongoose.Types.ObjectId(req.query.category as string);
    }
    
    // Sıralama parametreleri
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder;
    
    // Toplam kayıt sayısını al
    const total = await Item.countDocuments(filterParams);
    
    // Verileri getir
    const items = await Item.find(filterParams)
      .populate('itemType')
      .populate('family')
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages,
      data: items
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğeler getirilirken bir hata oluştu'
    });
  }
};

// GET belirli bir öğeyi getir - Modern full hierarchy approach
export const getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const Family = require('../models/Family').default;
    
    console.log('🔍 Fetching item with ID:', req.params.id);
    
    // 1. Temel item bilgilerini al
    const item = await Item.findById(req.params.id)
      .populate({
        path: 'itemType',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' },
          {
            path: 'attributeGroups',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive options',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' },
          { path: 'parent', select: 'name code description' },
          {
            path: 'attributeGroups',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive options',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
      .populate({
        path: 'family',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' },
          { path: 'parent', select: 'name code description' },
          { path: 'category', select: 'name code description' },
          {
            path: 'attributeGroups',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive options',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
      .lean();
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Öğe bulunamadı'
      });
      return;
    }

    // 2. Category hierarchy'sini getir (parent categories)
    if (item.category && (item.category as any)._id) {
      const getCategoryHierarchy = async (categoryId: string): Promise<any[]> => {
        const hierarchy: any[] = [];
        let currentCategory = await Category.findById(categoryId)
          .populate({ path: 'name', select: 'key namespace translations' })
          .populate({ path: 'description', select: 'key namespace translations' })
          .populate({
            path: 'attributeGroups',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive options',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' }
                    ]
                  }
                ]
              }
            ]
          })
          .populate('parent')
          .lean();

        while (currentCategory) {
          hierarchy.unshift(currentCategory); // Beginning'e ekle
          
          if (currentCategory.parent) {
            const parentId = typeof currentCategory.parent === 'string' 
              ? currentCategory.parent 
              : currentCategory.parent._id;
            
            currentCategory = await Category.findById(parentId)
              .populate({ path: 'name', select: 'key namespace translations' })
              .populate({ path: 'description', select: 'key namespace translations' })
              .populate({
                path: 'attributeGroups',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'attributes',
                    select: 'name code type description isRequired isActive options',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' },
                      {
                        path: 'options',
                        select: 'name code type description isActive',
                        populate: [
                          { path: 'name', select: 'key namespace translations' },
                          { path: 'description', select: 'key namespace translations' }
                        ]
                      }
                    ]
                  }
                ]
              })
              .populate('parent')
              .lean();
          } else {
            break;
          }
        }
        
        return hierarchy;
      };

      const categoryHierarchy = await getCategoryHierarchy(String((item.category as any)._id));
      (item as any).categoryHierarchy = categoryHierarchy;
    }

    // 3. Family hierarchy'sini getir (parent families)
    if (item.family && (item.family as any)._id) {
      const getFamilyHierarchy = async (familyId: string): Promise<any[]> => {
        const hierarchy: any[] = [];
        let currentFamily = await Family.findById(familyId)
          .populate({ path: 'name', select: 'key namespace translations' })
          .populate({ path: 'description', select: 'key namespace translations' })
          .populate({
            path: 'attributeGroups',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              {
                path: 'attributes',
                select: 'name code type description isRequired isActive options',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'options',
                    select: 'name code type description isActive',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' }
                    ]
                  }
                ]
              }
            ]
          })
          .populate('parent')
          .lean();

        while (currentFamily) {
          hierarchy.unshift(currentFamily); // Beginning'e ekle
          
          if (currentFamily.parent) {
            const parentId = typeof currentFamily.parent === 'string' 
              ? currentFamily.parent 
              : currentFamily.parent._id;
            
            currentFamily = await Family.findById(parentId)
              .populate({ path: 'name', select: 'key namespace translations' })
              .populate({ path: 'description', select: 'key namespace translations' })
              .populate({
                path: 'attributeGroups',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' },
                  {
                    path: 'attributes',
                    select: 'name code type description isRequired isActive options',
                    populate: [
                      { path: 'name', select: 'key namespace translations' },
                      { path: 'description', select: 'key namespace translations' },
                      {
                        path: 'options',
                        select: 'name code type description isActive',
                        populate: [
                          { path: 'name', select: 'key namespace translations' },
                          { path: 'description', select: 'key namespace translations' }
                        ]
                      }
                    ]
                  }
                ]
              })
              .populate('parent')
              .lean();
          } else {
            break;
          }
        }
        
        return hierarchy;
      };

      const familyHierarchy = await getFamilyHierarchy(String((item.family as any)._id));
      (item as any).familyHierarchy = familyHierarchy;
    }

    console.log('✅ Item fetched successfully with full hierarchy');
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    console.error('Item fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe getirilirken bir hata oluştu'
    });
  }
};

// Modern yardımcı fonksiyon: Full hierarchy'den zorunlu attribute'ları getir
async function getRequiredAttributesFromHierarchy(itemTypeId: string, categoryId: string, familyId: string) {
  const Family = require('../models/Family').default;
  let requiredAttributes: any[] = [];

  // 1. ItemType'dan zorunlu attribute'ları al
  const itemTypeIdStr = typeof itemTypeId === 'string' ? itemTypeId : String(itemTypeId);
  
  console.log('🔍 Looking for itemType with ID:', itemTypeIdStr);
  
  const itemType = await ItemType.findById(itemTypeIdStr).populate({
    path: 'attributeGroups',
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
  });

  if (itemType && itemType.attributeGroups) {
    for (const group of (itemType.attributeGroups as any[])) {
      if (group.attributes) {
        requiredAttributes = requiredAttributes.concat(
          (group.attributes as any[]).filter(attr => attr.isRequired)
        );
      }
    }
  }

  // 2. Category hierarchy'sinden zorunlu attribute'ları al
  const getCategoryHierarchy = async (catId: string): Promise<any[]> => {
    // catId'nin string olduğundan emin ol
    const categoryId = typeof catId === 'string' ? catId : String(catId);
    
    console.log('🔍 Looking for category with ID:', categoryId);
    
    const category = await Category.findById(categoryId).populate({
      path: 'attributeGroups',
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
    }).populate('parent');

    const hierarchy = [category];
    
    // Parent kategoriyi de ekle (recursive)
    if (category && category.parent) {
      let parentId: string;
      
      if (typeof category.parent === 'string') {
        parentId = category.parent;
      } else if (category.parent && typeof category.parent === 'object' && category.parent._id) {
        parentId = String(category.parent._id);
      } else {
        parentId = String(category.parent);
      }
      
      console.log('🔍 Looking for parent category with ID:', parentId);
      const parentHierarchy = await getCategoryHierarchy(parentId);
      hierarchy.push(...parentHierarchy);
    }
    
    return hierarchy.filter(cat => cat); // null/undefined'ları filtrele
  };

  if (categoryId) {
    const categoryHierarchy = await getCategoryHierarchy(categoryId);
    for (const category of categoryHierarchy) {
      if (category.attributeGroups) {
        for (const group of (category.attributeGroups as any[])) {
          if (group.attributes) {
            requiredAttributes = requiredAttributes.concat(
              (group.attributes as any[]).filter(attr => attr.isRequired)
            );
          }
        }
      }
    }
  }

  // 3. Family hierarchy'sinden zorunlu attribute'ları al
  const getFamilyHierarchy = async (famId: string): Promise<any[]> => {
    // famId'nin string olduğundan emin ol
    const familyId = typeof famId === 'string' ? famId : String(famId);
    
    console.log('🔍 Looking for family with ID:', familyId);
    
    const family = await Family.findById(familyId).populate({
      path: 'attributeGroups',
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
    }).populate('parent');

    const hierarchy = [family];
    
    // Parent family'i de ekle (recursive)
    if (family && family.parent) {
      let parentId: string;
      
      if (typeof family.parent === 'string') {
        parentId = family.parent;
      } else if (family.parent && typeof family.parent === 'object' && family.parent._id) {
        parentId = String(family.parent._id);
      } else {
        parentId = String(family.parent);
      }
      
      console.log('🔍 Looking for parent family with ID:', parentId);
      const parentHierarchy = await getFamilyHierarchy(parentId);
      hierarchy.push(...parentHierarchy);
    }
    
    return hierarchy.filter(fam => fam); // null/undefined'ları filtrele
  };

  if (familyId) {
    const familyHierarchy = await getFamilyHierarchy(familyId);
    for (const family of familyHierarchy) {
      if (family.attributeGroups) {
        for (const group of (family.attributeGroups as any[])) {
          if (group.attributes) {
            requiredAttributes = requiredAttributes.concat(
              (group.attributes as any[]).filter(attr => attr.isRequired)
            );
          }
        }
      }
    }
  }

  // Duplicate'ları kaldır
  const uniq = (arr: any[]) => Array.from(new Map(arr.map(a => [a._id.toString(), a])).values());
  return uniq(requiredAttributes);
}

// POST yeni öğe oluştur - Modern hierarchical approach
export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemType, family, category, attributes, isActive } = req.body;

    // Debug: Gelen payload'ı kontrol et
    console.log('🔍 Received payload:', {
      itemType,
      family,
      category,
      attributes,
      isActive
    });

    // Payload validation - ObjectId format kontrolü
    if (!itemType || !family || !category) {
      res.status(400).json({
        success: false,
        message: 'itemType, family ve category zorunludur'
      });
      return;
    }

    // String ID'leri kontrol et ve temizle
    const cleanItemType = typeof itemType === 'string' ? itemType : itemType._id || itemType;
    const cleanFamily = typeof family === 'string' ? family : family._id || family;
    const cleanCategory = typeof category === 'string' ? category : category._id || category;

    console.log('🔍 Cleaned IDs:', {
      itemType: cleanItemType,
      family: cleanFamily,
      category: cleanCategory
    });

    // Zorunlu attribute kontrolü - Full hierarchy (ItemType + Category + Family)
    const requiredAttributes = await getRequiredAttributesFromHierarchy(cleanItemType, cleanCategory, cleanFamily);
    
    // Frontend'den gelen attributes objesini al (modern format)
    const itemAttributes: Record<string, any> = attributes || {};
    
    // Zorunlu attribute'lar için kontrol
    const missing = requiredAttributes.filter((attr: any) => {
      const value = itemAttributes[attr._id.toString()];
      return value == null || value === '' || value === undefined;
    });
    
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Zorunlu öznitelikler eksik',
        missing: missing.map((a: any) => a.name)
      });
      return;
    }

    // Öğe oluştur
    const item = await Item.create({
      itemType: cleanItemType,
      family: cleanFamily,
      category: cleanCategory,
      attributes: itemAttributes,
      isActive: isActive !== undefined ? isActive : true
    });

    // Başarılı response
    res.status(201).json({
      success: true,
      data: item,
      message: 'Öğe başarıyla oluşturuldu'
    });
  } catch (error: any) {
    console.error('Item creation error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Tekrarlayan veri hatası'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe oluşturulurken bir hata oluştu'
    });
  }
};

// PUT öğeyi güncelle
export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Güncellenecek alanları al
    const updates = { ...req.body };
    // Zorunlu attribute kontrolü - Full hierarchy
    const requiredAttributes = await getRequiredAttributesFromHierarchy(
      updates.itemType, 
      updates.category, 
      updates.family
    );
    const attrs = updates.attributes || {};
    const missing = requiredAttributes.filter((attr: any) => {
      const value = attrs[attr._id.toString()];
      return value == null || value === '' || value === undefined;
    });
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Zorunlu öznitelikler eksik',
        missing: missing.map((a: any) => a.name)
      });
      return;
    }
    // Attributes kontrolü
    if (updates.attributes && typeof updates.attributes === 'object') {
      // Attributes alanı zaten bir nesne, işleme gerek yok
    } else if (updates.attributes !== undefined) {
      // Geçersiz bir attributes değeri, boş bir nesne ile değiştir
      updates.attributes = {};
    }
    // Öğeyi bul ve güncelle
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('itemType family category');
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Güncellenmek istenen öğe bulunamadı'
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        success: false,
        message: 'Tekrarlayan veri hatası'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe güncellenirken bir hata oluştu'
    });
  }
};

// DELETE öğeyi sil
export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Silinmek istenen öğe bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Öğe başarıyla silindi',
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe silinirken bir hata oluştu'
    });
  }
}; 