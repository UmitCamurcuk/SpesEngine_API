import { Request, Response, NextFunction } from 'express';
import ItemType from '../models/ItemType';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

// GET tüm öğe tiplerini getir
export const getItemTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const total = await ItemType.countDocuments(filterParams);
    
    // Verileri getir
    const itemTypes = await ItemType.find(filterParams)
      .populate({
        path: 'name',
        select: 'key namespace translations'
      })
      .populate({
        path: 'description',
        select: 'key namespace translations'
      })
      .populate({
        path: 'category',
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
      .populate({
        path: 'attributes',
        select: 'name code type description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: itemTypes.length,
      total,
      page,
      pages,
      data: itemTypes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe tipleri getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir öğe tipini getir
export const getItemTypeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const itemType = await ItemType.findById(req.params.id)
      .populate({
        path: 'name',
        select: 'key namespace translations'
      })
      .populate({
        path: 'description', 
        select: 'key namespace translations'
      })
      .populate({
        path: 'category',
        select: 'name code description isActive',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
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
      .populate({
        path: 'attributes',
        select: 'name code type description isRequired isActive',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .lean();
    
        if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
    }

    // Kategori hiyerarşisini ve family'leri populate et
    if (itemType.category) {
      const Category = require('../models/Category').default;
      const Family = require('../models/Family').default;

      // Alt kategorileri bul ve populate et
      const subcategories = await Category.find({
        parent: (itemType.category as any)._id,
        isActive: true
      })
      .populate({ path: 'name', select: 'key namespace translations' })
      .populate({ path: 'description', select: 'key namespace translations' })
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

      // Ana kategorinin attribute groups'larını da populate et
      const mainCategory = await Category.findById((itemType.category as any)._id)
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

      if (mainCategory) {
        (itemType as any).category = mainCategory;
      }
      (itemType as any).category.subcategories = subcategories;

      // Recursive function to get families for a category, including subfamilies
      const getAllFamiliesForCategory = async (categoryId: string): Promise<any[]> => {
        const families = await Family.find({
          category: categoryId,
          isActive: true
        })
        .populate({ path: 'name', select: 'key namespace translations' })
        .populate({ path: 'description', select: 'key namespace translations' })
        .populate({ path: 'parent', select: 'name code description isActive' })
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
        .populate({
          path: 'subFamilies',
          select: 'name code description attributeGroups isActive',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' },
            {
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
            }
          ]
        })
        .lean();

        return families;
      };

      // Ana kategorinin families'lerini bul ve populate et
      const families = await getAllFamiliesForCategory(String((itemType.category as any)._id));
      console.log(`Ana kategori ${(itemType.category as any)._id} için bulunan families:`, families.length);
      (itemType as any).category.families = families;

      // Alt kategorilerin families'lerini de bul
      for (const subcat of subcategories) {
        const subcatFamilies = await getAllFamiliesForCategory(String(subcat._id));
        console.log(`Alt kategori ${subcat._id} (${subcat.code}) için bulunan families:`, subcatFamilies.length);
        (subcat as any).families = subcatFamilies;
      }
    }

    res.status(200).json({
      success: true,
      data: itemType
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe tipi getirilirken bir hata oluştu'
    });
  }
};

// POST yeni öğe tipi oluştur
export const createItemType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Eğer attributeGroups seçilmişse, bunlara ait attributes'ları otomatik ekle
    if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
      const Attribute = require('../models/Attribute').default;
      
      // Seçilen AttributeGroup'lara ait tüm attribute'ları bul
      const attributes = await Attribute.find({
        attributeGroup: { $in: req.body.attributeGroups }
      }).select('_id').lean();
      
      // Bulunan attribute ID'lerini req.body'ye ekle
      req.body.attributes = attributes.map((attr: any) => attr._id);
    }

    const itemType = await ItemType.create(req.body);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.ITEM_TYPE,
          entityId: String(itemType._id),
          entityName: itemType.code, // name ObjectId olduğu için code kullanıyoruz
          action: ActionType.CREATE,
          userId: userId,
          newData: {
            name: String(itemType.name),
            code: itemType.code,
            description: String(itemType.description),
            category: String(itemType.category),
            attributeGroups: (itemType.attributeGroups || []).map(id => String(id)),
            attributes: (itemType.attributes || []).map(id => String(id)),
            isActive: itemType.isActive
          }
        }); 
      } catch (historyError) {
        console.error('History creation failed for itemType:', historyError);
        // History hatası oluşturma işlemini engellemesin
      }
    }
    
    // Oluşturulan öğe tipini tüm alanlarıyla birlikte getir
    const newItemType = await ItemType.findById(itemType._id)
      .populate({
        path: 'name',
        select: 'key namespace translations'
      })
      .populate({
        path: 'description',
        select: 'key namespace translations'
      })
      .populate({
        path: 'category',
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
      .populate({
        path: 'attributes',
        select: 'name code type description',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      });
    
    res.status(201).json({
      success: true,
      data: newItemType
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öğe tipi oluşturulurken bir hata oluştu'
    });
  }
};

// PUT öğe tipini güncelle
export const updateItemType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Güncellemeden önceki veriyi al
    const oldItemType = await ItemType.findById(req.params.id);
    
    if (!oldItemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
    }
    
    const itemType = await ItemType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'name',
      select: 'key namespace translations'
    }).populate({
      path: 'description',
      select: 'key namespace translations'
    }).populate({
      path: 'category',
      select: 'name code description',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    }).populate({
      path: 'attributeGroups',
      select: 'name code description',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    }).populate({
      path: 'attributes',
      select: 'name code type description',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    });
    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        // Sadece değişen alanları history'e kaydet
        const historyData: any = {
          entityType: EntityType.ITEM_TYPE,
          entityId: String(itemType._id),
          entityName: itemType.code,
          action: ActionType.UPDATE,
          userId: userId
        };

        // Comment varsa ekle
        if (req.body.comment) {
          historyData.comment = req.body.comment;
        }

        // Sadece request body'de gelen (değişen) alanları kaydet
        const previousData: any = {};
        const newData: any = {};

        // req.body'de gelen her alan için eski ve yeni değerleri kaydet
        Object.keys(req.body).forEach(key => {
          if (key !== 'comment') { // comment alanını data'ya dahil etme
            if (key === 'attributeGroups' || key === 'attributes') {
              previousData[key] = ((oldItemType as any)[key] || []).map((id: any) => String(id));
              newData[key] = (req.body[key] || []).map((id: any) => String(id));
            } else if (key === 'name' || key === 'description' || key === 'category') {
              previousData[key] = String((oldItemType as any)[key]);
              newData[key] = String(req.body[key]);
            } else if (key === 'settings') {
              previousData[key] = (oldItemType as any)[key] || {};
              newData[key] = req.body[key];
            } else {
              previousData[key] = (oldItemType as any)[key];
              newData[key] = req.body[key];
            }
          }
        });

        historyData.previousData = previousData;
        historyData.newData = newData;

        await historyService.recordHistory(historyData);
      } catch (historyError) {
        console.error('History update failed for itemType:', historyError);
        // History hatası güncelleme işlemini engellemesin
      }
    }
    
    res.status(200).json({
      success: true,
      data: itemType
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öğe tipi güncellenirken bir hata oluştu'
    });
  }
};

// DELETE öğe tipini sil
export const deleteItemType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Silinmeden önce veriyi al
    const itemType = await ItemType.findById(req.params.id);
    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await ItemType.findByIdAndDelete(req.params.id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.ITEM_TYPE,
          entityId: String(itemType._id),
          entityName: itemType.code,
          action: ActionType.DELETE,
          userId: userId,
          previousData: {
            name: String(itemType.name),
            code: itemType.code,
            description: String(itemType.description),
            category: String(itemType.category),
            attributeGroups: (itemType.attributeGroups || []).map(id => String(id)),
            attributes: (itemType.attributes || []).map(id => String(id)),
            isActive: itemType.isActive
          }
        });
      } catch (historyError) {
        console.error('History deletion failed for itemType:', historyError);
        // History hatası silme işlemini engellemesin
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(req.params.id);
    } catch (historyError) {
      console.error('Error deleting itemType history:', historyError);
      // History silme hatası ana işlemi engellemesin
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öğe tipi silinirken bir hata oluştu'
    });
  }
}; 