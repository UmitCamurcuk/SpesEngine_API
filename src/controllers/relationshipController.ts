import { Request, Response, NextFunction } from 'express';
import relationshipService from '../services/relationshipService';
import { ValidationError } from '../utils/errors';
import { IUser } from '../models/User';

// Kullanıcı tipini genişlet
interface RequestWithUser extends Request {
  user?: IUser;
}

// İlişki oluştur
export const createRelationship = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    // Kullanıcı ID'sini ekle
    if (!req.user || !req.user._id) {
      throw new ValidationError('Kullanıcı kimliği bulunamadı');
    }
    
    const data = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };
    
    const relationship = await relationshipService.create(data);
    res.status(201).json(relationship);
  } catch (error) {
    next(error);
  }
};

// ID'ye göre ilişkiyi getir
export const getRelationshipById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const relationship = await relationshipService.getById(id);
    res.status(200).json(relationship);
  } catch (error) {
    next(error);
  }
};

// Varlığa göre ilişkileri getir
export const getRelationshipsByEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, entityId } = req.params;
    const { role = 'any' } = req.query;
    
    if (!['source', 'target', 'any'].includes(role as string)) {
      throw new ValidationError('Geçersiz rol değeri. Rol "source", "target" veya "any" olmalıdır.');
    }
    
    const relationships = await relationshipService.getByEntity(
      entityId, 
      entityType, 
      role as 'source' | 'target' | 'any'
    );
    
    res.status(200).json(relationships);
  } catch (error) {
    next(error);
  }
};

// İlişki tipine göre ilişkileri getir
export const getRelationshipsByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { typeId } = req.params;
    const relationships = await relationshipService.getByAssociation(typeId);
    res.status(200).json(relationships);
  } catch (error) {
    next(error);
  }
};

// İlişkiyi güncelle
export const updateRelationship = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Boş veri kontrolü
    if (Object.keys(req.body).length === 0) {
      throw new ValidationError('Güncelleme için en az bir alan gereklidir');
    }
    
    // Kullanıcı ID'sini ekle
    if (!req.user || !req.user._id) {
      throw new ValidationError('Kullanıcı kimliği bulunamadı');
    }
    
    const data = {
      ...req.body,
      updatedBy: req.user._id
    };
    
    const relationship = await relationshipService.update(id, data);
    res.status(200).json(relationship);
  } catch (error) {
    next(error);
  }
};

// İlişkiyi sil
export const deleteRelationship = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await relationshipService.delete(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// İlişki durumunu değiştir
export const changeRelationshipStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'pending', 'archived'].includes(status)) {
      throw new ValidationError('Geçersiz durum değeri. Durum "active", "inactive", "pending" veya "archived" olmalıdır.');
    }
    
    if (!req.user || !req.user._id) {
      throw new ValidationError('Kullanıcı kimliği bulunamadı');
    }
    
    const relationship = await relationshipService.changeStatus(
      id, 
      status as 'active' | 'inactive' | 'pending' | 'archived',
      req.user._id.toString()
    );
    
    res.status(200).json(relationship);
  } catch (error) {
    next(error);
  }
}; 