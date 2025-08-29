import { Request, Response } from 'express';
import AssociationRule from '../models/AssociationRule';
import ItemType from '../models/ItemType';
import Association from '../models/Association';
import EnhancedAssociationService from '../services/enhancedAssociationService';
import { ValidationError } from '../utils/errors';
import mongoose from 'mongoose';

/**
 * Association Rule Controller
 * Association kurallarını yönetmek için API endpoints
 */

/**
 * Yeni association kuralı oluştur
 */
export const createAssociationRule = async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      associationId,
      sourceItemTypeCode,
      targetItemTypeCode,
      relationshipType,
      filterCriteria,
      validationRules,
      uiConfig,
      priority,
      isRequired,
      cascadeDelete
    } = req.body;

    // ItemType'ları bul
    const sourceItemType = await ItemType.findOne({ code: sourceItemTypeCode });
    const targetItemType = await ItemType.findOne({ code: targetItemTypeCode });

    if (!sourceItemType) {
      return res.status(400).json({
        success: false,
        message: `Kaynak ItemType bulunamadı: ${sourceItemTypeCode}`
      });
    }

    if (!targetItemType) {
      return res.status(400).json({
        success: false,
        message: `Hedef ItemType bulunamadı: ${targetItemTypeCode}`
      });
    }

    // Association kontrolü
    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(400).json({
        success: false,
        message: 'Association bulunamadı'
      });
    }

    // Yeni kural oluştur
    const associationRule = new AssociationRule({
      code: code.toUpperCase(),
      name,
      description,
      associationId,
      sourceItemTypeId: sourceItemType._id,
      targetItemTypeId: targetItemType._id,
      relationshipType,
      filterCriteria,
      validationRules: validationRules || [],
      uiConfig: {
        displayMode: 'dropdown',
        allowMultiSelect: true,
        showInList: true,
        showInDetail: true,
        showSearchBox: true,
        showFilters: true,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        ...uiConfig
      },
      priority: priority || 0,
      isRequired: isRequired || false,
      cascadeDelete: cascadeDelete || false,
      createdBy: (req as any).user?.id || '507f1f77bcf86cd799439011',
      updatedBy: (req as any).user?.id || '507f1f77bcf86cd799439011'
    });

    await associationRule.save();

    // Populate ederek dön
    const populatedRule = await AssociationRule.findById(associationRule._id)
      .populate('associationId')
      .populate('sourceItemTypeId')
      .populate('targetItemTypeId')
      .populate('name')
      .populate('description');

    res.status(201).json({
      success: true,
      message: 'Association kuralı başarıyla oluşturuldu',
      data: populatedRule
    });

  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu kural kodu zaten mevcut'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Association kuralı oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Association kurallarını listele
 */
export const getAssociationRules = async (req: Request, res: Response) => {
  try {
    const {
      sourceItemTypeCode,
      targetItemTypeCode,
      associationId,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    // Query builder
    const query: any = {};

    if (sourceItemTypeCode) {
      const sourceItemType = await ItemType.findOne({ code: sourceItemTypeCode });
      if (sourceItemType) {
        query.sourceItemTypeId = sourceItemType._id;
      }
    }

    if (targetItemTypeCode) {
      const targetItemType = await ItemType.findOne({ code: targetItemTypeCode });
      if (targetItemType) {
        query.targetItemTypeId = targetItemType._id;
      }
    }

    if (associationId) {
      query.associationId = associationId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [rules, total] = await Promise.all([
      AssociationRule.find(query)
        .populate('associationId')
        .populate('sourceItemTypeId')
        .populate('targetItemTypeId')
        .populate('name')
        .populate('description')
        .populate('filterCriteria.categories')
        .populate('filterCriteria.families')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      AssociationRule.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        rules,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Association kuralları alınırken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Belirli bir association kuralını getir
 */
export const getAssociationRule = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const rule = await AssociationRule.findOne({ code, isActive: true })
      .populate('associationId')
      .populate('sourceItemTypeId')
      .populate('targetItemTypeId')
      .populate('name')
      .populate('description')
      .populate('filterCriteria.categories')
      .populate('filterCriteria.families');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Association kuralı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: rule
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Association kuralı alınırken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Association kuralını güncelle
 */
export const updateAssociationRule = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const updateData = { ...req.body };

    // Güncelleyen kullanıcı bilgisi
    updateData.updatedBy = (req as any).user?.id || '507f1f77bcf86cd799439011';

    // ItemType code'ları varsa ID'lere çevir
    if (updateData.sourceItemTypeCode) {
      const sourceItemType = await ItemType.findOne({ code: updateData.sourceItemTypeCode });
      if (sourceItemType) {
        updateData.sourceItemTypeId = sourceItemType._id;
      }
      delete updateData.sourceItemTypeCode;
    }

    if (updateData.targetItemTypeCode) {
      const targetItemType = await ItemType.findOne({ code: updateData.targetItemTypeCode });
      if (targetItemType) {
        updateData.targetItemTypeId = targetItemType._id;
      }
      delete updateData.targetItemTypeCode;
    }

    const rule = await AssociationRule.findOneAndUpdate(
      { code, isActive: true },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('associationId')
      .populate('sourceItemTypeId')
      .populate('targetItemTypeId')
      .populate('name')
      .populate('description');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Association kuralı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Association kuralı başarıyla güncellendi',
      data: rule
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Association kuralı güncellenirken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Association kuralını sil (soft delete)
 */
export const deleteAssociationRule = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const rule = await AssociationRule.findOneAndUpdate(
      { code, isActive: true },
      { 
        isActive: false,
        updatedBy: (req as any).user?.id || '507f1f77bcf86cd799439011'
      },
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Association kuralı bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Association kuralı başarıyla silindi'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Association kuralı silinirken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kural tabanlı filtrelenmiş item'ları getir
 */
export const getFilteredItems = async (req: Request, res: Response) => {
  try {
    const { sourceItemId, ruleCode } = req.params;
    const {
      page = 1,
      limit = 10,
      searchQuery,
      additionalFilters,
      populate = true
    } = req.query;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Options
    const options = {
      skip,
      limit: limitNum,
      searchQuery: searchQuery as string,
      additionalFilters: additionalFilters ? JSON.parse(additionalFilters as string) : undefined,
      populate: populate === 'true'
    };

    const items = await EnhancedAssociationService.getFilteredItems(
      sourceItemId,
      ruleCode,
      options
    );

    // Total count için ayrı sorgu (pagination için)
    const totalItems = await EnhancedAssociationService.getFilteredItems(
      sourceItemId,
      ruleCode,
      { ...options, limit: undefined, skip: undefined }
    );

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total: totalItems.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalItems.length / limitNum)
        }
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Filtrelenmiş item\'lar alınırken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Association metadata bilgisi
 */
export const getAssociationMetadata = async (req: Request, res: Response) => {
  try {
    const { sourceItemId, ruleCode } = req.params;

    const metadata = await EnhancedAssociationService.getAssociationMetadata(
      sourceItemId,
      ruleCode
    );

    res.json({
      success: true,
      data: metadata
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Association metadata alınırken hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kural tabanlı association oluştur
 */
export const createAssociationWithRule = async (req: Request, res: Response) => {
  try {
    const { sourceItemId, ruleCode } = req.params;
    const { targetItemIds } = req.body;

    if (!Array.isArray(targetItemIds) || targetItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Target item ID\'leri gerekli'
      });
    }

    await EnhancedAssociationService.createAssociationWithRules(
      sourceItemId,
      targetItemIds,
      ruleCode
    );

    res.json({
      success: true,
      message: 'Association başarıyla oluşturuldu'
    });

  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Association oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

/**
 * ItemType için mevcut association kurallarını getir
 */
export const getItemTypeAssociationRules = async (req: Request, res: Response) => {
  try {
    const { itemTypeCode } = req.params;
    const { includeInactive = false } = req.query;

    const rules = await EnhancedAssociationService.getAssociationRules(
      itemTypeCode,
      includeInactive === 'true'
    );

    res.json({
      success: true,
      data: rules
    });

  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'ItemType association kuralları alınırken hata oluştu',
      error: error.message
    });
  }
};
