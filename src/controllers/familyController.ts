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
    
    // Query oluştur
    let query = Family.findById(req.params.id)
      .populate('itemType')
      .populate('parent');
      
    // Category'i her zaman populate et (bu alanın zorunlu olduğu gözüküyor)
    query = query.populate('category');
      
    // Attributes'ları include et
    if (includeAttributes) {
      query = query.populate('attributes');
      
      // Category içindeki attributes'ları da populate et
      query = query.populate({
        path: 'category',
        populate: {
          path: 'attributes'
        }
      });
    }
    
    // AttributeGroups'ları include et ve içindeki attributes'ları da getir
    if (includeAttributeGroups) {
      if (populateAttributeGroupsAttributes) {
        // Family'nin attributeGroups'larını ve içindeki attributes'ları populate et
        query = query.populate({
          path: 'attributeGroups',
          model: 'AttributeGroup',
          populate: {
            path: 'attributes',
            model: 'Attribute'
          }
        });
        
        // Category'nin attributeGroups'larını ve içindeki attributes'ları populate et
        query = query.populate({
          path: 'category',
          populate: {
            path: 'attributeGroups',
            model: 'AttributeGroup',
            populate: {
              path: 'attributes',
              model: 'Attribute'
            }
          }
        });
      } else {
        // Sadece attributeGroups'ları populate et
        query = query.populate('attributeGroups');
        
        // Category'nin attributeGroups'larını da populate et
        query = query.populate({
          path: 'category',
          populate: {
            path: 'attributeGroups'
          }
        });
      }
    }
    
    // Sorguyu çalıştır
    const family = await query.exec();
    
    if (!family) {
      res.status(404).json({
        success: false,
        message: 'Aile bulunamadı'
      });
      return;
    }
    
    console.log(`[getFamilyById] Aile bulundu. Attributes: ${family.attributes?.length || 'yok'}, AttributeGroups: ${family.attributeGroups?.length || 'yok'}`);
    
    res.status(200).json({
      success: true,
      data: family
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