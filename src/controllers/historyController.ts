import { Request, Response, NextFunction } from 'express';
import History from '../models/History';
import mongoose from 'mongoose';

// Bir varlığın geçmişini getir
export const getEntityHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { entityId } = req.params;
    
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Sıralama seçeneği
    const sortOption: any = {};
    if (req.query.sortBy) {
      sortOption[req.query.sortBy as string] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOption.createdAt = -1; // Varsayılan olarak en yeni kayıtları başta göster
    }
    
    // History kayıtlarını getir
    const history = await History.find({ 
      entityId: new mongoose.Types.ObjectId(entityId) 
    })
    .populate('createdBy', 'name email')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);
    
    // Toplam kayıt sayısını al
    const total = await History.countDocuments({ 
      entityId: new mongoose.Types.ObjectId(entityId) 
    });
    
    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Geçmiş kayıtları getirilirken bir hata oluştu'
    });
  }
};

// Genel geçmişi getir (entityType'a göre filtrelenebilir)
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme
    const query: any = {};
    
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }
    
    if (req.query.action) {
      query.action = req.query.action;
    }
    
    if (req.query.createdBy) {
      query.createdBy = new mongoose.Types.ObjectId(req.query.createdBy as string);
    }
    
    // Tarih aralığı filtreleme
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }
    
    // Sıralama seçeneği
    const sortOption: any = {};
    if (req.query.sortBy) {
      sortOption[req.query.sortBy as string] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOption.createdAt = -1; // Varsayılan olarak en yeni kayıtları başta göster
    }
    
    // History kayıtlarını getir
    const history = await History.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    // Toplam kayıt sayısını al
    const total = await History.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Geçmiş kayıtları getirilirken bir hata oluştu'
    });
  }
}; 