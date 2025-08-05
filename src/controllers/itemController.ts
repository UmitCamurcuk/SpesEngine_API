import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';
import mongoose from 'mongoose';
import ItemType from '../models/ItemType';
import Category from '../models/Category';
import AttributeGroup from '../models/AttributeGroup';
import Attribute from '../models/Attribute';
import associationService from '../services/associationService';

// GET tüm öğeleri getir (test için authentication olmadan)
export const getItemsTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      .populate({
        path: 'family',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate('createdBy', 'name email firstName lastName')
      .populate('updatedBy', 'name email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Translations alanlarını düzelt
    const fixTranslations = (obj: any) => {
      if (obj && typeof obj === 'object') {
        if (obj.translations && obj.translations instanceof Map) {
          const translationsObj: Record<string, string> = {};
          obj.translations.forEach((value: string, key: string) => {
            translationsObj[key] = value;
          });
          obj.translations = translationsObj;
        }
      }
    };
    
    // Her item için translations alanlarını düzelt ve attribute'ları populate et
    for (const item of items) {
      if (item.family) {
        if ((item.family as any).name) fixTranslations((item.family as any).name);
        if ((item.family as any).description) fixTranslations((item.family as any).description);
      }
      if (item.category) {
        if ((item.category as any).name) fixTranslations((item.category as any).name);
        if ((item.category as any).description) fixTranslations((item.category as any).description);
      }
      
      // Attribute'ları populate et
      if (item.attributes && typeof item.attributes === 'object') {
        item.attributes = await populateAttributeValues(item.attributes);
      }
    }
    
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
      .populate({
        path: 'family',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'category',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate('createdBy', 'name email firstName lastName')
      .populate('updatedBy', 'name email firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Translations alanlarını düzelt
    const fixTranslations = (obj: any) => {
      if (obj && typeof obj === 'object') {
        if (obj.translations && obj.translations instanceof Map) {
          const translationsObj: Record<string, string> = {};
          obj.translations.forEach((value: string, key: string) => {
            translationsObj[key] = value;
          });
          obj.translations = translationsObj;
        }
      }
    };
    
    // Her item için translations alanlarını düzelt ve attribute'ları populate et
    for (const item of items) {
      if (item.family) {
        if ((item.family as any).name) fixTranslations((item.family as any).name);
        if ((item.family as any).description) fixTranslations((item.family as any).description);
      }
      if (item.category) {
        if ((item.category as any).name) fixTranslations((item.category as any).name);
        if ((item.category as any).description) fixTranslations((item.category as any).description);
      }
      
      // Attribute'ları populate et
      if (item.attributes && typeof item.attributes === 'object') {
        item.attributes = await populateAttributeValues(item.attributes);
      }
    }
    
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

// GET belirli ItemType'a ait öğeleri getir - Enhanced for Association Display
export const getItemsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemTypeCode } = req.params;
    
    // ItemType'ı bul ve attribute definitions'ları al
    const itemType = await ItemType.findOne({ code: itemTypeCode })
      .populate({
        path: 'attributeGroups',
        populate: {
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
      })
      .lean();
      
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: `${itemTypeCode} kodlu öğe tipi bulunamadı`
      });
      return;
    }

    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Association için daha yüksek default
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const filterParams: any = {
      itemType: itemType._id,
      isActive: true // Association items genelde aktif olanlar
    };
    
    // Additional filters from query params
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.family) {
      filterParams.family = new mongoose.Types.ObjectId(req.query.family as string);
    }
    
    if (req.query.category) {
      filterParams.category = new mongoose.Types.ObjectId(req.query.category as string);
    }

    // Apply custom filters passed in the request body
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        filterParams[key] = req.body[key];
      });
    }
    
    // Sıralama parametreleri
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder;
    
    // Toplam kayıt sayısını al
    const total = await Item.countDocuments(filterParams);
    
    // Verileri getir - Association için sadece gerekli alanları populate et
    const items = await Item.find(filterParams)
      .populate({
        path: 'family',
        select: 'name code',
        populate: {
          path: 'name',
          select: 'key namespace translations'
        }
      })
      .populate({
        path: 'category', 
        select: 'name code',
        populate: {
          path: 'name',
          select: 'key namespace translations'
        }
      })
      .select('_id attributes isActive createdAt updatedAt family category') // Sadece gerekli alanlar
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Translations alanlarını düzelt
    const fixTranslations = (obj: any) => {
      if (obj && typeof obj === 'object') {
        if (obj.translations && obj.translations instanceof Map) {
          const translationsObj: Record<string, string> = {};
          obj.translations.forEach((value: string, key: string) => {
            translationsObj[key] = value;
          });
          obj.translations = translationsObj;
        }
      }
    };
    
    // Attribute definitions'ları topla
    const attributeDefinitions: Record<string, any> = {};
    if (itemType.attributeGroups) {
      itemType.attributeGroups.forEach((group: any) => {
        if (group.attributes) {
          group.attributes.forEach((attr: any) => {
            attributeDefinitions[attr._id] = {
              ...attr,
              groupName: group.name
            };
          });
        }
      });
    }
    
    // Her item için translations alanlarını düzelt ve attributes'ları parse et
    for (const item of items) {
      if (item.family && (item.family as any).name) {
        fixTranslations((item.family as any).name);
      }
      if (item.category && (item.category as any).name) {
        fixTranslations((item.category as any).name);
      }
      
      // Attributes'ları parse et ve anlamlı hale getir
      if (item.attributes && typeof item.attributes === 'object') {
        const parsedAttributes: Record<string, any> = {};
        
        Object.keys(item.attributes).forEach(attrId => {
          const attrDef = attributeDefinitions[attrId];
          const attrValue = item.attributes[attrId];
          
          if (attrDef) {
            let displayValue = attrValue;
            
            // Select type için option name'ini bul
            if (attrDef.type === 'select' && attrDef.options && Array.isArray(attrValue)) {
              const selectedOption = attrDef.options.find((opt: any) => opt._id === attrValue);
              displayValue = selectedOption ? selectedOption.name : attrValue;
            }
            
            // Table type için formatla
            if (attrDef.type === 'table' && Array.isArray(attrValue)) {
              displayValue = attrValue.map((row: any[]) => row.join(' x ')).join(', ');
            }
            
            // Date type için formatla
            if (attrDef.type === 'date' && attrValue) {
              displayValue = new Date(attrValue).toLocaleDateString('tr-TR');
            }
            
            parsedAttributes[attrId] = {
              value: attrValue,
              displayValue: displayValue,
              definition: {
                name: attrDef.name,
                code: attrDef.code,
                type: attrDef.type,
                groupName: attrDef.groupName
              }
            };
          } else {
            // Definition bulunamadıysa raw value'yu kullan
            parsedAttributes[attrId] = {
              value: attrValue,
              displayValue: attrValue,
              definition: null
            };
          }
        });
        
        item.attributes = parsedAttributes;
      }
    }
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages,
      data: items,
      // Association display için ek bilgiler
      meta: {
        itemType: {
          code: itemType.code,
          name: itemType.name,
          attributeDefinitions: Object.keys(attributeDefinitions).length
        }
      }
    });
  } catch (error: any) {
    console.error(`${req.params.itemTypeCode} tipindeki öğeler getirilirken hata:`, error);
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
      .populate('createdBy', 'name email firstName lastName')
      .populate('updatedBy', 'name email firstName lastName')
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

    // 4. Association'ları getir ve populate et
    try {
      const associations = await associationService.getItemAssociations(item._id.toString(), {
        populate: true,
        populateFields: ['itemType', 'family', 'category'],
        includeInactive: false
      });
      (item as any).populatedAssociations = associations;
    } catch (associationError) {
      console.warn('Association fetch error:', associationError);
      (item as any).populatedAssociations = [];
    }

    console.log('✅ Item fetched successfully with full hierarchy and associations');
    
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

// Attribute değerlerini populate eden yardımcı fonksiyon
async function populateAttributeValues(attributes: Record<string, any>): Promise<any[]> {
  const populatedAttributes: any[] = [];
  
  for (const [attributeId, value] of Object.entries(attributes)) {
    try {
      // Attribute'u bul
      const attribute = await Attribute.findById(attributeId)
        .populate({
          path: 'name',
          select: 'key namespace translations'
        })
        .populate({
          path: 'description',
          select: 'key namespace translations'
        })
        .populate({
          path: 'options',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' }
          ]
        })
        .lean();

      if (attribute) {
        // Temel attribute bilgilerini ekle
        const populatedAttribute: any = {
          _id: attribute._id,
          code: attribute.code,
          type: attribute.type,
          name: attribute.name,
          description: attribute.description,
          isRequired: attribute.isRequired,
          options: attribute.options,
          validations: attribute.validations,
          notificationSettings: attribute.notificationSettings,
          isActive: attribute.isActive,
          createdAt: attribute.createdAt,
          updatedAt: attribute.updatedAt,
          __v: attribute.__v,
          value: value
        };

        // Eğer değer başka bir attribute'un ID'si ise, referencedValue ekle
        if (typeof value === 'string' && value.length === 24) {
          try {
            const referencedAttribute = await Attribute.findById(value)
              .populate({
                path: 'name',
                select: 'key namespace translations'
              })
              .populate({
                path: 'description',
                select: 'key namespace translations'
              })
              .lean();

            if (referencedAttribute) {
              populatedAttribute.referencedValue = referencedAttribute;
            }
          } catch (refError) {
            console.log('Referenced attribute not found:', value);
          }
        }

        populatedAttributes.push(populatedAttribute);
      } else {
        // Attribute bulunamadıysa sadece değeri ekle
        populatedAttributes.push({
          _id: attributeId,
          value: value,
          error: 'Attribute not found'
        });
      }
    } catch (error) {
      console.error('Error populating attribute:', attributeId, error);
      // Hata durumunda sadece değeri ekle
      populatedAttributes.push({
        _id: attributeId,
        value: value,
        error: 'Population error'
      });
    }
  }
  
  return populatedAttributes;
}

// Modern yardımcı fonksiyon: Full hierarchy'den zorunlu attribute'ları getir
async function getRequiredAttributesFromHierarchy(itemTypeId: string, categoryId: string, familyId: string) {
  const Family = require('../models/Family').default;
  let requiredAttributes: any[] = [];

  // 1. ItemType'dan zorunlu attribute'ları al
  const itemTypeIdStr = typeof itemTypeId === 'string' ? itemTypeId : String(itemTypeId);
  
  
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

// POST yeni öğe oluştur - Modern hierarchical approach with associations
export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemType, family, category, attributes, associations, isActive } = req.body;

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
      associations: associations || {},
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    });

    // Association validation (oluşturulduktan sonra)
    if (associations && Object.keys(associations).length > 0) {
      try {
        const validationResult = await associationService.validateAssociations(String(item._id), associations);
        if (!validationResult.isValid) {
          // Item'ı sil çünkü association'lar geçersiz
          await Item.findByIdAndDelete(String(item._id));
          res.status(400).json({
            success: false,
            message: 'Association validation başarısız',
            errors: validationResult.errors,
            warnings: validationResult.warnings
          });
          return;
        }
      } catch (validationError: any) {
        // Item'ı sil çünkü validation hatası
        await Item.findByIdAndDelete(String(item._id));
        res.status(400).json({
          success: false,
          message: 'Association validation hatası',
          error: validationError.message
        });
        return;
      }
    }

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
    const updates = { 
      ...req.body,
      updatedBy: req.user?._id
    };
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
    ).populate('itemType family category').populate('createdBy', 'name email firstName lastName').populate('updatedBy', 'name email firstName lastName');
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

// ============================================================================
// ASSOCIATION MANAGEMENT ENDPOINTS
// ============================================================================

// GET item'ın association'larını getir
export const getItemAssociations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { populate = 'true', includeInactive = 'false' } = req.query;

    const associations = await associationService.getItemAssociations(id, {
      populate: populate === 'true',
      populateFields: ['itemType', 'family', 'category'],
      includeInactive: includeInactive === 'true'
    });

    res.status(200).json({
      success: true,
      data: associations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Association\'lar getirilirken hata oluştu'
    });
  }
};

// POST yeni association oluştur
export const createAssociation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sourceItemId } = req.params;
    const { targetItemId, associationType } = req.body;

    if (!targetItemId || !associationType) {
      res.status(400).json({
        success: false,
        message: 'targetItemId ve associationType gerekli'
      });
      return;
    }

    await associationService.createAssociation(sourceItemId, targetItemId, associationType);

    res.status(201).json({
      success: true,
      message: 'Association başarıyla oluşturuldu'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Association oluşturulurken hata oluştu'
    });
  }
};

// DELETE association sil
export const removeAssociation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sourceItemId } = req.params;
    const { targetItemId, associationType } = req.body;

    if (!targetItemId || !associationType) {
      res.status(400).json({
        success: false,
        message: 'targetItemId ve associationType gerekli'
      });
      return;
    }

    await associationService.removeAssociation(sourceItemId, targetItemId, associationType);

    res.status(200).json({
      success: true,
      message: 'Association başarıyla silindi'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Association silinirken hata oluştu'
    });
  }
};

// GET association için uygun item'ları ara
export const searchItemsForAssociation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sourceItemId, targetItemTypeCode } = req.params;
    const { 
      search, 
      page = '1', 
      limit = '20',
      includeInactive = 'false'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const items = await associationService.searchItemsForAssociation(
      sourceItemId,
      targetItemTypeCode,
      search as string,
      {
        populate: true,
        populateFields: ['itemType', 'family', 'category'],
        includeInactive: includeInactive === 'true',
        skip,
        limit: limitNum,
        sort: { createdAt: -1 }
      }
    );

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: items.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Item arama işleminde hata oluştu'
    });
  }
};

// GET ItemType'ın association rules'ları
export const getItemTypeAssociationRules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemTypeCode } = req.params;

    const rules = await associationService.getAssociationRules(itemTypeCode);

    res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Association rules getirilirken hata oluştu'
    });
  }
};

// POST association validation
export const validateItemAssociations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { associations } = req.body;

    if (!associations) {
      res.status(400).json({
        success: false,
        message: 'associations verisi gerekli'
      });
      return;
    }

    const validationResult = await associationService.validateAssociations(id, associations);

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Association validation işleminde hata oluştu'
    });
  }
}; 