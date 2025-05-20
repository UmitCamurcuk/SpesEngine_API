import { Request, Response, NextFunction } from 'express';
import Family from '../models/Family';

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
          .populate(populateAttributeGroupsAttributes ? 'attributes' : []);
        
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
          .populate('attributes');
          
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
            populate: populateAttributeGroupsAttributes ? {
              path: 'attributes'
            } : undefined
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
    
    // Oluşturulan aileyi itemType ve parent alanlarıyla birlikte getir
    const newFamily = await Family.findById(family._id)
      .populate('itemType')
      .populate('parent')
      .populate('attributeGroups')
      .populate('attributes');
    
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
    .populate('attributeGroups')
    .populate('attributes');
    
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
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
    const family = await Family.findByIdAndDelete(req.params.id);
    
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
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