import { Request, Response, NextFunction } from 'express';
import associationTypeService from '../services/associationTypeService';
import associationFilterService from '../services/associationFilterService';
import { ValidationError } from '../utils/errors';

// Association oluştur
export const createAssociation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id;
    const association = await associationTypeService.create(req.body, userId);
    res.status(201).json({
      success: true,
      data: association,
      message: 'Association başarıyla oluşturuldu'
    });
  } catch (error) {
    next(error);
  }
};

// Tüm association'ları getir
export const getAllAssociations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const associations = await associationTypeService.getAll();
    res.status(200).json({
      success: true,
      data: associations,
      message: 'Association\'lar başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// ID'ye göre association'ı getir
export const getAssociationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const association = await associationTypeService.getById(id);
    res.status(200).json({
      success: true,
      data: association,
      message: 'Association başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Association'ı güncelle
export const updateAssociation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    
    // Boş veri kontrolü
    if (Object.keys(req.body).length === 0) {
      throw new ValidationError('Güncelleme için en az bir alan gereklidir');
    }
    
    const association = await associationTypeService.update(id, req.body, userId);
    res.status(200).json({
      success: true,
      data: association,
      message: 'Association başarıyla güncellendi'
    });
  } catch (error) {
    next(error);
  }
};

// Association'ı sil
export const deleteAssociation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await associationTypeService.delete(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Association filter criteria'ya göre filtrelenmiş target item'ları getir
export const getFilteredTargetItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourceItemId, associationId } = req.params;
    const {
      page = 1,
      limit = 10,
      searchQuery,
      additionalFilters,
      populate = true
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      searchQuery: searchQuery as string,
      additionalFilters: additionalFilters ? JSON.parse(additionalFilters as string) : undefined,
      populate: populate === 'true'
    };

    const result = await associationFilterService.getFilteredTargetItems(
      sourceItemId,
      associationId,
      options
    );

    res.status(200).json({
      success: true,
      data: {
        items: result.items,
        totalCount: result.totalCount,
        appliedFilters: result.appliedFilters,
        pagination: {
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(result.totalCount / options.limit)
        }
      },
      message: 'Filtrelenmiş item\'lar başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Association filter bilgilerini getir
export const getAssociationFilterInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { associationId } = req.params;

    const filterInfo = await associationFilterService.getAssociationFilterInfo(associationId);

    res.status(200).json({
      success: true,
      data: filterInfo,
      message: 'Association filter bilgileri başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
};

// Item için kullanılabilir association'ları getir
export const getAvailableAssociationsForItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;

    const associations = await associationFilterService.getAvailableAssociationsForItem(itemId);

    res.status(200).json({
      success: true,
      data: associations,
      message: 'Kullanılabilir association\'lar başarıyla getirildi'
    });
  } catch (error) {
    next(error);
  }
}; 