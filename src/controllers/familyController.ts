import { Request, Response, NextFunction } from 'express';
import Family from '../models/Family';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';
import { EntityType } from '../models/Entity';

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
      .populate('itemType')
      .populate('parent')
      .populate('attributeGroups')
      .populate('attributes')
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
    const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
    
    console.log(`[getFamilyById] ID: ${req.params.id}, Parametreler:`, {
      includeAttributes,
      includeAttributeGroups,
      populateAttributeGroupsAttributes
    });
    
    // AttributeGroup modelini içe aktar
    const AttributeGroup = await import('../models/AttributeGroup');
    
    // Önce temel Family verisini getir
    const family = await Family.findById(req.params.id)
      .populate('itemType')
      .populate('parent')
      .populate('category')
      .populate(includeAttributes ? 'attributes' : []);
      
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
        console.log(`[getFamilyById] AttributeGroup IDs:`, groupIds);
        
        // AttributeGroup'ları ve içindeki öznitelikleri getir
        const groups = await AttributeGroup.default.find({ _id: { $in: groupIds } })
          .populate('name','key namespace translations')
          .populate('description','key namespace translations')
          .populate(populateAttributeGroupsAttributes ? {
            path: 'attributes',
            populate: [
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' }
            ]
          } : []);
        
        console.log(`[getFamilyById] ${groups.length} AttributeGroup bulundu`);
        
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
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' }
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
              { path: 'name', select: 'key namespace translations' },
              { path: 'description', select: 'key namespace translations' },
              ...(populateAttributeGroupsAttributes ? [{
                path: 'attributes',
                populate: [
                  { path: 'name', select: 'key namespace translations' },
                  { path: 'description', select: 'key namespace translations' }
                ]
              }] : [])
            ]
          });
          
        if (category && category.attributeGroups) {
          response.category.attributeGroups = category.attributeGroups;
        }
      }
    }
    
    console.log(`[getFamilyById] Yanıt hazırlandı. AttributeGroups: ${response.attributeGroups?.length || 'yok'}`);
    
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
    // Eğer itemType alanı boş string ise bu alanı kaldır
    if (req.body.itemType === '') {
      delete req.body.itemType;
    }
    
    // Eğer parent alanı boş string ise bu alanı kaldır
    if (req.body.parent === '') {
      delete req.body.parent;
    }
    
    // AttributeGroups belirlenmişse, içindeki attribute'ları da ekle
    if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
      const attributeGroupIds = req.body.attributeGroups;
      
      // AttributeGroup'lara ait tüm attribute'ları getir
      const allAttributes = await (await import('../models/AttributeGroup')).default
        .find({ _id: { $in: attributeGroupIds } })
        .distinct('attributes');
      
      // Body'ye attributes dizisini ekle veya güncelle
      req.body.attributes = Array.from(new Set([
        ...(req.body.attributes || []),
        ...allAttributes
      ]));
    }
    
    const family = await Family.create(req.body);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: String(family._id),
          entityName: family.name,
          action: ActionType.CREATE,
          userId: userId,
          newData: {
            name: family.name,
            code: family.code,
            description: family.description || '',
            isActive: family.isActive
          }
        });
        console.log('Family creation history saved successfully');
      } catch (historyError) {
        console.error('History creation failed for family:', historyError);
        // History hatası aile oluşturmayı engellemesin
      }
    }
    
    // Oluşturulan aileyi itemType ve parent alanlarıyla birlikte getir
    const newFamily = await Family.findById(family._id)
      .populate('itemType')
      .populate('parent')
      .populate({
        path: 'attributeGroups',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
        ]
      })
      .populate({
        path: 'attributes',
        populate: [
          { path: 'name', select: 'key namespace translations' },
          { path: 'description', select: 'key namespace translations' }
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

// PUT aileyi güncelle
export const updateFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Güncellemeden önce mevcut veriyi al
    const oldFamily = await Family.findById(req.params.id);
    
    if (!oldFamily) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }
    
    // Eğer itemType alanı boş string ise bu alanı kaldır
    if (req.body.itemType === '') {
      delete req.body.itemType;
    }
    
    // Eğer parent alanı boş string ise bu alanı kaldır
    if (req.body.parent === '') {
      delete req.body.parent;
    }
    
    // AttributeGroups belirlenmişse, içindeki attribute'ları da ekle
    if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
      const attributeGroupIds = req.body.attributeGroups;
      
      // AttributeGroup'lara ait tüm attribute'ları getir
      const allAttributes = await (await import('../models/AttributeGroup')).default
        .find({ _id: { $in: attributeGroupIds } })
        .distinct('attributes');
      
      // Body'ye attributes dizisini ekle veya güncelle
      req.body.attributes = Array.from(new Set([
        ...(req.body.attributes || []),
        ...allAttributes
      ]));
    } else {
      // AttributeGroups boşsa, attributes da boş olmalı
      req.body.attributes = [];
    }
    
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('itemType')
    .populate('parent')
    .populate({
      path: 'attributeGroups',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    })
    .populate({
      path: 'attributes',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' }
      ]
    });
    
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      try {
        await historyService.recordHistory({
          entityType: EntityType.FAMILY,
          entityId: String(family._id),
          entityName: family.name,
          action: ActionType.UPDATE,
          userId: userId,
          previousData: {
            name: oldFamily.name,
            code: oldFamily.code,
            description: oldFamily.description || '',
            isActive: oldFamily.isActive
          },
          newData: {
            name: family.name,
            code: family.code,
            description: family.description || '',
            isActive: family.isActive
          }
        });
        console.log('Family update history saved successfully');
      } catch (historyError) {
        console.error('History update failed for family:', historyError);
        // History hatası güncellemeyi engellemesin
      }
    }
    
    res.status(200).json({
      success: true,
      data: family
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Aile güncellenirken bir hata oluştu'
    });
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
          entityName: family.name,
          action: ActionType.DELETE,
          userId: userId,
          previousData: {
            name: family.name,
            code: family.code,
            description: family.description || '',
            isActive: family.isActive
          }
        });
        console.log('Family deletion history saved successfully');
      } catch (historyError) {
        console.error('History deletion failed for family:', historyError);
        // History hatası silme işlemini engellemesin
      }
    }
    
    // Entity'nin tüm history kayıtlarını sil
    try {
      const deletedHistoryCount = await historyService.deleteEntityHistory(req.params.id);
      console.log(`Deleted ${deletedHistoryCount} history records for family ${req.params.id}`);
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
    console.log(`Families by Category request received: ${categoryId}`);
    
    // Bu kategoriye ait tüm aileleri getir
    const families = await Family.find({ 
      category: categoryId,
      isActive: true 
    })
    .populate('itemType')
    .populate('category')
    .populate('parent')
    .sort('name');
    
    console.log(`Found ${families.length} families for Category: ${categoryId}`);
    
    res.status(200).json({
      success: true,
      data: families
    });
  } catch (error: any) {
    console.error('Error fetching families by Category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kategori aileleri getirilirken bir hata oluştu'
    });
  }
}; 