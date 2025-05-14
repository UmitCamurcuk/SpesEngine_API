import { Request, Response, NextFunction } from 'express';
import AttributeGroup from '../models/AttributeGroup';

// GET tüm öznitelik gruplarını getir
export const getAttributeGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Filtreleme parametrelerini alma
    const filterParams: any = {};
    
    // isActive parametresi
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    const attributeGroups = await AttributeGroup.find(filterParams)
      .populate('attributes');
    
    res.status(200).json({
      success: true,
      count: attributeGroups.length,
      data: attributeGroups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik grupları getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir öznitelik grubunu getir
export const getAttributeGroupById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.findById(req.params.id)
      .populate('attributes');
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik grubu getirilirken bir hata oluştu'
    });
  }
};

// POST yeni öznitelik grubu oluştur
export const createAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.create(req.body);
    
    res.status(201).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grubu oluşturulurken bir hata oluştu'
    });
  }
};

// PUT öznitelik grubunu güncelle
export const updateAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('attributes');
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attributeGroup
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik grubu güncellenirken bir hata oluştu'
    });
  }
};

// DELETE öznitelik grubunu sil
export const deleteAttributeGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const attributeGroup = await AttributeGroup.findByIdAndDelete(req.params.id);
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
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
      message: error.message || 'Öznitelik grubu silinirken bir hata oluştu'
    });
  }
}; 