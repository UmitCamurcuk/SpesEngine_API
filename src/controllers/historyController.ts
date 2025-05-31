import { Request, Response, NextFunction } from 'express';
import historyService from '../services/historyService';
import { EntityType } from '../models/Entity';

// GET tüm history kayıtlarını getir
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const entityType = req.query.entityType as EntityType;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // History service'den genel history'yi getir
    const result = await historyService.getAllHistory(entityType, limit, skip, startDate, endDate);
    
    const pages = Math.ceil(result.total / limit);
    
    res.status(200).json({
      success: true,
      count: result.histories.length,
      total: result.total,
      page,
      limit,
      pages,
      data: result.histories
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'History kayıtları getirilirken bir hata oluştu'
    });
  }
};

// GET belirli entity'nin history kayıtlarını getir
export const getEntityHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityId } = req.params;
    
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const entityType = req.query.entityType as EntityType;
    
    const result = await historyService.getEntityHistory(entityId, entityType, limit, skip);
    
    const pages = Math.ceil(result.total / limit);
    
    res.status(200).json({
      success: true,
      count: result.histories.length,
      total: result.total,
      page,
      limit,
      pages,
      data: result.histories
    });
  } catch (error: any) {
    console.error('Error fetching entity history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Entity history kayıtları getirilirken bir hata oluştu'
    });
  }
}; 