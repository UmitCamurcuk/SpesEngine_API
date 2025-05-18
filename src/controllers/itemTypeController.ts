import { Request, Response, NextFunction } from 'express';
import ItemType from '../models/ItemType';

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
      .populate('attributes')
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
    // Query parametrelerini al
    const includeAttributes = req.query.includeAttributes === 'true';
    const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
    
    // Temel ItemType sorgusu
    const itemType = await ItemType.findById(req.params.id).lean();
    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
    }
    
    // Attributes'ları include et
    if (includeAttributes) {
      const attributes = await ItemType.findById(req.params.id)
        .populate('attributes')
        .lean()
        .then(result => result?.attributes || []);
        
      itemType.attributes = attributes;
    }
    
    // AttributeGroups'ları include et
    if (includeAttributeGroups) {
      // AttributeGroups'ları getir
      const attributeGroups = await ItemType.findById(req.params.id)
        .populate('attributeGroups')
        .lean()
        .then(result => result?.attributeGroups || []);
      
      // Her bir AttributeGroup için, ilgili attribute'ları bulup ata
      if (attributeGroups.length > 0) {
        // Tüm ilgili attribute'ları tek bir sorguda getir
        const allAttributes = await ItemType.findById(req.params.id)
          .populate('attributes')
          .lean()
          .then(result => result?.attributes || []);
          
        // Her AttributeGroup için, ona ait attribute'ları filtrele ve ata
        for (const group of attributeGroups) {
          // Bu gruba ait attribute'ları filtrele
          const groupAttributes = allAttributes.filter((attr: any) => 
            attr.attributeGroup && attr.attributeGroup.toString() === group._id.toString()
          );
          
          // AttributeGroup'a ait attribute'ları ata
          (group as any).attributes = groupAttributes;
        }
      }
      
      itemType.attributeGroups = attributeGroups;
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
    const itemType = await ItemType.create(req.body);
    
    // Oluşturulan öğe tipini attribute alanlarıyla birlikte getir
    const newItemType = await ItemType.findById(itemType._id)
      .populate('attributes');
    
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
    const itemType = await ItemType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('attributes');
    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
      });
      return;
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
    const itemType = await ItemType.findByIdAndDelete(req.params.id);
    
    if (!itemType) {
      res.status(404).json({
        success: false,
        message: 'Öğe tipi bulunamadı'
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
      message: error.message || 'Öğe tipi silinirken bir hata oluştu'
    });
  }
}; 