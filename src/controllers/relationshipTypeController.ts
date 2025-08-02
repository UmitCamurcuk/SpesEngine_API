import { Request, Response, NextFunction } from 'express';
import relationshipTypeService from '../services/relationshipTypeService';
import { ValidationError } from '../utils/errors';

// İlişki tipi oluştur
export const createRelationshipType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const relationshipType = await relationshipTypeService.create(req.body, userId);
    res.status(201).json({
      success: true,
      data: relationshipType,
      message: 'İlişki tipi başarıyla oluşturuldu'
    });
  } catch (error) {
    next(error);
  }
};

// Tüm ilişki tiplerini getir
export const getAllRelationshipTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const relationshipTypes = await relationshipTypeService.getAll();
    res.status(200).json({
      success: true,
      data: relationshipTypes,
      message: 'İlişki tipleri başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// ID'ye göre ilişki tipini getir
export const getRelationshipTypeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const relationshipType = await relationshipTypeService.getById(id);
    res.status(200).json({
      success: true,
      data: relationshipType,
      message: 'İlişki tipi başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// İlişki tipini güncelle
export const updateRelationshipType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    
    // Boş veri kontrolü
    if (Object.keys(req.body).length === 0) {
      throw new ValidationError('Güncelleme için en az bir alan gereklidir');
    }
    
    const relationshipType = await relationshipTypeService.update(id, req.body, userId);
    res.status(200).json({
      success: true,
      data: relationshipType,
      message: 'İlişki tipi başarıyla güncellendi'
    });
  } catch (error) {
    next(error);
  }
};

// İlişki tipini sil
export const deleteRelationshipType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await relationshipTypeService.delete(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}; 