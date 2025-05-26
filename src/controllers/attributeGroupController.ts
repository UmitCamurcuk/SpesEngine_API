import { Request, Response, NextFunction } from 'express';
import AttributeGroup from '../models/AttributeGroup';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';

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
      .populate('attributes')
      .populate('name','key namespace translations.tr translations.en')
      .populate('description','key namespace translations.tr translations.en');
    
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
      .populate('attributes')
      .populate('name','key namespace translations.tr translations.en')
      .populate('description','key namespace translations.tr translations.en');
    
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
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: String(attributeGroup._id),
        entityType: 'attributeGroup',
        entityName: String(attributeGroup.name),
        action: ActionType.CREATE,
        userId: userId,
        newData: attributeGroup.toObject()
      });
    }
    
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
    // Güncelleme öncesi mevcut veriyi al (geçmiş için)
    const previousAttributeGroup = await AttributeGroup.findById(req.params.id);
    
    if (!previousAttributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
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
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: req.params.id,
        entityType: 'attributeGroup',
        entityName: String(attributeGroup.name || previousAttributeGroup.name),
        action: ActionType.UPDATE,
        userId: userId,
        previousData: previousAttributeGroup.toObject(),
        newData: attributeGroup.toObject()
      });
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
    // Silme öncesi veriyi al (geçmiş için)
    const attributeGroup = await AttributeGroup.findById(req.params.id);
    
    if (!attributeGroup) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik grubu bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await AttributeGroup.findByIdAndDelete(req.params.id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: req.params.id,
        entityType: 'attributeGroup',
        entityName: String(attributeGroup.name),
        action: ActionType.DELETE,
        userId: userId,
        previousData: attributeGroup.toObject()
      });
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