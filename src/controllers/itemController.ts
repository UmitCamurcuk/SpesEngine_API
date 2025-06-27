import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item';
import mongoose from 'mongoose';
import ItemType from '../models/ItemType';
import Category from '../models/Category';
import AttributeGroup from '../models/AttributeGroup';

// GET tüm öğeleri getir
export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    
    // Arama parametresi artık attributes'larda aranabilir
    // TODO: Attributes içinde arama yapılacaksa burada implement edilebilir
    
    // ItemType, Family ve Category filtreleme
    if (req.query.itemType) {
      filterParams.itemType = new mongoose.Types.ObjectId(req.query.itemType as string);
    }
    
    if (req.query.family) {
      filterParams.family = new mongoose.Types.ObjectId(req.query.family as string);
    }
    
    if (req.query.category) {
      filterParams.category = new mongoose.Types.ObjectId(req.query.category as string);
    }
    
    // Sıralama parametreleri
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder;
    
    // Toplam kayıt sayısını al
    const total = await Item.countDocuments(filterParams);
    
    // Verileri getir
    const items = await Item.find(filterParams)
      .populate('itemType')
      .populate('family')
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Sayfa sayısını hesapla
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages,
      data: items
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğeler getirilirken bir hata oluştu'
    });
  }
};

// GET belirli bir öğeyi getir
export const getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('itemType')
      .populate('family')
      .populate('category');
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Öğe bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe getirilirken bir hata oluştu'
    });
  }
};

// Yardımcı fonksiyon: itemType ve category'den zorunlu attribute'ları getir
async function getRequiredAttributes(itemTypeId: string, categoryId: string) {
  const itemType = await ItemType.findById(itemTypeId).populate({
    path: 'attributes',
    populate: [
      { path: 'name', select: 'key namespace translations' },
      { path: 'description', select: 'key namespace translations' }
    ]
  });
  let requiredAttributes: any[] = [];
  if (itemType && itemType.attributes) {
    requiredAttributes = requiredAttributes.concat(
      (itemType.attributes as any[]).filter(attr => attr.isRequired)
    );
  }
  if (categoryId) {
    const category = await Category.findById(categoryId).populate({
      path: 'attributeGroups',
      populate: [
        { path: 'name', select: 'key namespace translations' },
        { path: 'description', select: 'key namespace translations' },
        {
          path: 'attributes',
          populate: [
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' }
          ]
        }
      ]
    });
    if (category && category.attributeGroups && (category.attributeGroups as any).length > 0) {
      // Her bir attributeGroup için
      for (const group of (category.attributeGroups as any)) {
        if (group.attributes) {
          requiredAttributes = requiredAttributes.concat(
            (group.attributes as any[]).filter(attr => attr.isRequired)
          );
        }
      }
    }
  }
  // Aynı attribute birden fazla gelirse uniq yap
  const uniq = (arr: any[]) => Array.from(new Map(arr.map(a => [a._id.toString(), a])).values());
  return uniq(requiredAttributes);
}

// POST yeni öğe oluştur
export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemType, family, category, attributeValues, isActive } = req.body;

    // Zorunlu attribute kontrolü
    const requiredAttributes = await getRequiredAttributes(itemType, category);
    
    // AttributeValues array'i varsa bir nesneye çevirelim
    let attributes: Record<string, any> = {};
    if (attributeValues && Array.isArray(attributeValues)) {
      attributeValues.forEach(attr => {
        if (attr.attributeId && attr.value !== undefined) {
          attributes[attr.attributeId] = attr.value;
        }
      });
    }
    
    // Zorunlu attributelar için kontrol
    const missing = requiredAttributes.filter(attr => !attributes || attributes[attr._id.toString()] == null || attributes[attr._id.toString()] === '');
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Zorunlu öznitelikler eksik',
        missing: missing.map(a => a.name)
      });
      return;
    }

    // Öğe oluştur
    const item = await Item.create({
      itemType,
      family,
      category,
      attributes: attributes,
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        success: false,
        message: 'Tekrarlayan veri hatası'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe oluşturulurken bir hata oluştu'
    });
  }
};

// PUT öğeyi güncelle
export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Güncellenecek alanları al
    const updates = { ...req.body };
    // Zorunlu attribute kontrolü
    const requiredAttributes = await getRequiredAttributes(updates.itemType, updates.category);
    const attrs = updates.attributes || {};
    const missing = requiredAttributes.filter(attr => !attrs || attrs[attr._id.toString()] == null || attrs[attr._id.toString()] === '');
    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Zorunlu öznitelikler eksik',
        missing: missing.map(a => a.name)
      });
      return;
    }
    // Attributes kontrolü
    if (updates.attributes && typeof updates.attributes === 'object') {
      // Attributes alanı zaten bir nesne, işleme gerek yok
    } else if (updates.attributes !== undefined) {
      // Geçersiz bir attributes değeri, boş bir nesne ile değiştir
      updates.attributes = {};
    }
    // Öğeyi bul ve güncelle
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('itemType family category');
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Güncellenmek istenen öğe bulunamadı'
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        success: false,
        message: 'Tekrarlayan veri hatası'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe güncellenirken bir hata oluştu'
    });
  }
};

// DELETE öğeyi sil
export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Silinmek istenen öğe bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Öğe başarıyla silindi',
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Öğe silinirken bir hata oluştu'
    });
  }
}; 