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
    const family = await Family.findById(req.params.id)
      .populate('itemType');
    
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
    res.status(500).json({
      success: false,
      message: error.message || 'Aile getirilirken bir hata oluştu'
    });
  }
};

// POST yeni aile oluştur
export const createFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const family = await Family.create(req.body);
    
    // Oluşturulan aileyi itemType alanıyla birlikte getir
    const newFamily = await Family.findById(family._id)
      .populate('itemType');
    
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
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('itemType');
    
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