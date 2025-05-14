import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Attribute from '../models/Attribute';
import historyService from '../services/historyService';
import { ActionType } from '../models/History';

// GET tüm öznitelikleri getir
export const getAttributes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Attributes fetch request received', req.query);
    
    // Sayfalama parametreleri
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filtreleme parametreleri
    const filterParams: any = { isActive: true };
    
    // isActive parametresi özellikle belirtilmişse
    if (req.query.isActive !== undefined) {
      filterParams.isActive = req.query.isActive === 'true';
    }
    
    // Arama parametresi (name, code ve description alanlarında)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filterParams.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Tip filtrelemesi
    if (req.query.type) {
      filterParams.type = req.query.type;
    }
    
    // Gerekli/Zorunlu filtrelemesi
    if (req.query.isRequired !== undefined) {
      filterParams.isRequired = req.query.isRequired === 'true';
    }
    
    // Öznitelik grubu filtrelemesi
    if (req.query.attributeGroup) {
      filterParams.attributeGroup = req.query.attributeGroup;
    }
    
    // Toplam kayıt sayısını al
    const total = await Attribute.countDocuments(filterParams);
    
    // Sıralama parametreleri
    const sort = req.query.sort || 'name';
    const direction = req.query.direction === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sort as string] = direction;
    
    console.log('Sorting with:', { sort, direction, sortOptions });
    
    // Verileri getir
    const attributes = await Attribute.find(filterParams)
      .populate('attributeGroup', 'name code')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: attributes.length,
      total,
      page,
      limit,
      pages,
      data: attributes
    });
  } catch (error: any) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelikler getirilirken bir hata oluştu'
    });
  }
};

// GET tek bir özniteliği getir
export const getAttributeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const attribute = await Attribute.findById(id)
      .populate('attributeGroup', 'name code description');
    
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attribute
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öznitelik getirilirken bir hata oluştu'
    });
  }
};

// POST yeni öznitelik oluştur
export const createAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('[AttributeController:DEBUG] Gelen veri:', JSON.stringify(req.body, null, 2));
    
    // Validasyon verilerini kontrol et
    if (req.body.validations) {
      console.log('[AttributeController:DEBUG] Validasyon içeriği:', JSON.stringify(req.body.validations, null, 2));
      console.log('[AttributeController:DEBUG] Validasyon tipi:', typeof req.body.validations);
      
      // Validasyon objesi boş ise undefined yap
      if (Object.keys(req.body.validations).length === 0) {
        console.log('[AttributeController:DEBUG] Validasyon objesi boş, undefined yapılıyor');
        req.body.validations = undefined;
      } else {
        // TCKNO gibi validasyon verilerinin sayısal değerlerini kontrol et
        if (req.body.type === 'number' && typeof req.body.validations === 'object') {
          console.log('[AttributeController:DEBUG] Sayısal validasyonlar işleniyor...');
          
          // min değeri için özel kontrol
          if ('min' in req.body.validations) {
            const minVal = Number(req.body.validations.min);
            console.log(`[AttributeController:DEBUG] min değeri: ${req.body.validations.min}, dönüştürülen: ${minVal}`);
            req.body.validations.min = minVal;
          }
          
          // max değeri için özel kontrol
          if ('max' in req.body.validations) {
            const maxVal = Number(req.body.validations.max);
            console.log(`[AttributeController:DEBUG] max değeri: ${req.body.validations.max}, dönüştürülen: ${maxVal}`);
            req.body.validations.max = maxVal;
          }
          
          // Boolean değerleri kontrol et
          ['isInteger', 'isPositive', 'isNegative', 'isZero'].forEach(prop => {
            if (prop in req.body.validations) {
              const boolVal = Boolean(req.body.validations[prop]);
              console.log(`[AttributeController:DEBUG] ${prop} değeri: ${req.body.validations[prop]}, dönüştürülen: ${boolVal}`);
              req.body.validations[prop] = boolVal;
            }
          });
        }
        
        // Diğer tip validasyonları için de kontrol et
        if (req.body.type === 'text' && typeof req.body.validations === 'object') {
          // Text validasyonları için özel kontroller
          if ('minLength' in req.body.validations) {
            req.body.validations.minLength = Number(req.body.validations.minLength);
          }
          if ('maxLength' in req.body.validations) {
            req.body.validations.maxLength = Number(req.body.validations.maxLength);
          }
        }
        
        // Tarih validasyonları için özel kontroller
        if (req.body.type === 'date' && typeof req.body.validations === 'object') {
          // Tarih validasyonları için işlemler
          // (minDate ve maxDate zaten string olarak geliyor)
        }
        
        // Select/MultiSelect validasyonları için özel kontroller
        if ((req.body.type === 'select' || req.body.type === 'multiselect') && 
            typeof req.body.validations === 'object') {
          if ('minSelections' in req.body.validations) {
            req.body.validations.minSelections = Number(req.body.validations.minSelections);
          }
          if ('maxSelections' in req.body.validations) {
            req.body.validations.maxSelections = Number(req.body.validations.maxSelections);
          }
        }
      }
    } else {
      console.log('[AttributeController:DEBUG] Validasyon verisi yok!');
    }
    
    console.log('[AttributeController:DEBUG] Attribute oluşturma öncesi son veri:', JSON.stringify(req.body, null, 2));
    
    const newAttribute = await Attribute.create(req.body);
    
    // Kayıt sonrası doğrula
    console.log('[AttributeController:DEBUG] Oluşturulan kayıt:', JSON.stringify(newAttribute, null, 2));
    console.log('[AttributeController:DEBUG] Validasyon alanı kaydedildi mi:', newAttribute.validations !== undefined);
    if (newAttribute.validations) {
      console.log('[AttributeController:DEBUG] Kaydedilen validasyon:', JSON.stringify(newAttribute.validations, null, 2));
    }
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      console.log(`[AttributeController:DEBUG] History kaydı oluşturuluyor, userId: ${userId}`);
      
      await historyService.recordHistory({
        entityId: String(newAttribute._id),
        entityType: 'attribute',
        entityName: newAttribute.name,
        action: ActionType.CREATE,
        userId: userId,
        newData: newAttribute.toObject()
      });
    }
    
    res.status(201).json({
      success: true,
      data: newAttribute
    });
  } catch (error: any) {
    console.error('[AttributeController:DEBUG] Hata:', error.message);
    console.error('[AttributeController:DEBUG] Stack:', error.stack);
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik oluşturulurken bir hata oluştu'
    });
  }
};

// PUT özniteliği güncelle
export const updateAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Güncelleme öncesi mevcut veriyi al (geçmiş için)
    const previousAttribute = await Attribute.findById(id);
    
    if (!previousAttribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    // Güncelleme işlemi
    const updatedAttribute = await Attribute.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: id,
        entityType: 'attribute',
        entityName: updatedAttribute?.name || previousAttribute.name,
        action: ActionType.UPDATE,
        userId: userId,
        previousData: previousAttribute.toObject(),
        newData: updatedAttribute?.toObject()
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedAttribute
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik güncellenirken bir hata oluştu'
    });
  }
};

// DELETE özniteliği sil
export const deleteAttribute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Silme öncesi veriyi al (geçmiş için)
    const attribute = await Attribute.findById(id);
    
    if (!attribute) {
      res.status(404).json({
        success: false,
        message: 'Öznitelik bulunamadı'
      });
      return;
    }
    
    // Veriyi sil
    await Attribute.findByIdAndDelete(id);
    
    // History kaydı oluştur
    if (req.user && typeof req.user === 'object' && '_id' in req.user) {
      const userId = String(req.user._id);
      
      await historyService.recordHistory({
        entityId: id,
        entityType: 'attribute',
        entityName: attribute.name,
        action: ActionType.DELETE,
        userId: userId,
        previousData: attribute.toObject()
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Öznitelik silinirken bir hata oluştu'
    });
  }
}; 