import mongoose from 'mongoose';
import Item from '../models/Item';
import ItemType from '../models/ItemType';
import Association from '../models/Association';
import AssociationRule from '../models/AssociationRule';
import Category from '../models/Category';
import Family from '../models/Family';
import { IItem } from '../models/Item';
import { IItemType } from '../models/ItemType';
import { IAssociationRule, IFilterCriteria, IValidationRule } from '../models/AssociationRule';
import { ValidationError } from '../utils/errors';

export interface IFilteredItem extends IItem {
  matchScore?: number; // Filtreleme puanı
  matchReasons?: string[]; // Neden eşleştiği
}

export interface IAssociationQueryOptions {
  populate?: boolean;
  populateFields?: string[];
  includeInactive?: boolean;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  searchQuery?: string;
  additionalFilters?: Record<string, any>;
}

export interface IAssociationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface IAssociationMetadata {
  rule: IAssociationRule;
  availableCount: number;
  selectedCount: number;
  canAddMore: boolean;
  validationStatus: IAssociationValidationResult;
}

/**
 * Enhanced Association Management Service
 * Kural tabanlı association yönetimi ve gelişmiş filtreleme
 */
class EnhancedAssociationService {

  /**
   * Belirli bir ItemType için tanımlı association kurallarını getir
   */
  async getAssociationRules(
    sourceItemTypeCode: string, 
    includeInactive: boolean = false
  ): Promise<IAssociationRule[]> {
    const sourceItemType = await ItemType.findOne({ 
      code: sourceItemTypeCode, 
      isActive: true 
    });
    
    if (!sourceItemType) {
      throw new ValidationError(`ItemType bulunamadı: ${sourceItemTypeCode}`);
    }

    const query: any = {
      sourceItemTypeId: sourceItemType._id,
      isActive: includeInactive ? undefined : true
    };

    const rules = await AssociationRule.find(query)
      .populate('associationId')
      .populate('sourceItemTypeId')
      .populate('targetItemTypeId')
      .populate('name')
      .populate('description')
      .populate('filterCriteria.categories')
      .populate('filterCriteria.families')
      .sort({ priority: -1, createdAt: 1 });

    return rules;
  }

  /**
   * Kural tabanlı item filtreleme
   */
  async getFilteredItems(
    sourceItemId: string,
    ruleCode: string,
    options: IAssociationQueryOptions = {}
  ): Promise<IFilteredItem[]> {
    // Kural bilgisini al
    const rule = await AssociationRule.findOne({ 
      code: ruleCode, 
      isActive: true 
    })
      .populate('targetItemTypeId')
      .populate('filterCriteria.categories')
      .populate('filterCriteria.families');

    if (!rule) {
      throw new ValidationError(`Association kuralı bulunamadı: ${ruleCode}`);
    }

    // Target ItemType'ı al
    // ItemType'ı popüle et
    await rule.populate('targetItemTypeId');
    const targetItemType = rule.targetItemTypeId as unknown as IItemType;

    // Base query oluştur
    let query = Item.find({
      itemType: targetItemType._id,
      isActive: options.includeInactive ? undefined : true
    });

    // Filtreleme kriterlerini uygula
    if (rule.filterCriteria) {
      query = this.applyFilterCriteria(query, rule.filterCriteria);
    }

    // Arama sorgusu
    if (options.searchQuery) {
      query = this.applySearchQuery(query, options.searchQuery, rule);
    }

    // Ek filtreler
    if (options.additionalFilters) {
      query.where(options.additionalFilters);
    }

    // Populate
    if (options.populate) {
      const populateFields = options.populateFields || [
        'itemType', 'family', 'category', 'createdBy', 'updatedBy'
      ];
      populateFields.forEach(field => query.populate(field));
    }

    // Sıralama
    if (options.sort) {
      query.sort(options.sort);
    } else if (rule.uiConfig.sortBy) {
      const sortObj: any = {};
      sortObj[rule.uiConfig.sortBy] = rule.uiConfig.sortOrder === 'desc' ? -1 : 1;
      query.sort(sortObj);
    }

    // Pagination
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);

    const items = await query.exec() as IFilteredItem[];

    // Puanlama ve match nedenleri ekle
    return items.map(item => this.calculateMatchScore(item, rule));
  }

  /**
   * Association oluşturma (kural doğrulaması ile)
   */
  async createAssociationWithRules(
    sourceItemId: string,
    targetItemIds: string[],
    ruleCode: string
  ): Promise<void> {
    // Kural doğrulama
    const rule = await AssociationRule.findOne({ 
      code: ruleCode, 
      isActive: true 
    });

    if (!rule) {
      throw new ValidationError(`Association kuralı bulunamadı: ${ruleCode}`);
    }

    // Source item kontrol
    const sourceItem = await Item.findById(sourceItemId).populate('itemType');
    if (!sourceItem) {
      throw new ValidationError('Source item bulunamadı');
    }

    // Target item'ları kontrol et
    const targetItems = await Item.find({
      _id: { $in: targetItemIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).populate('itemType family category');

    if (targetItems.length !== targetItemIds.length) {
      throw new ValidationError('Bazı target item\'lar bulunamadı');
    }

    // Her target item için kural validasyonu
    for (const targetItem of targetItems) {
      const isValid = await this.validateItemAgainstRule(targetItem, rule);
      if (!isValid.isValid) {
        throw new ValidationError(`Item ${targetItem._id} kural kriterlerini karşılamıyor: ${isValid.errors.join(', ')}`);
      }
    }

    // Validation kurallarını kontrol et
    const validationResult = await this.validateAssociationRules(
      sourceItem,
      targetItems,
      rule
    );

    if (!validationResult.isValid) {
      throw new ValidationError(`Validation hatası: ${validationResult.errors.join(', ')}`);
    }

    // Association'ı oluştur
    await this.updateItemAssociations(sourceItem, targetItemIds, rule);
  }

  /**
   * Association metadata bilgisi
   */
  async getAssociationMetadata(
    sourceItemId: string,
    ruleCode: string
  ): Promise<IAssociationMetadata> {
    const rule = await AssociationRule.findOne({ 
      code: ruleCode, 
      isActive: true 
    });

    if (!rule) {
      throw new ValidationError(`Association kuralı bulunamadı: ${ruleCode}`);
    }

    const sourceItem = await Item.findById(sourceItemId);
    if (!sourceItem) {
      throw new ValidationError('Source item bulunamadı');
    }

    // Mevcut association sayısı
    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);
    const currentIds = currentAssociations[associationKey] || [];
    const selectedCount = Array.isArray(currentIds) ? currentIds.length : (currentIds ? 1 : 0);

    // Kullanılabilir item sayısı
    const availableItems = await this.getFilteredItems(sourceItemId, ruleCode, { limit: 1000 });
    const availableCount = availableItems.length;

    // Daha fazla eklenebilir mi?
    const maxRule = rule.validationRules.find(r => r.type === 'maxCount');
    const maxCount = maxRule ? maxRule.value as number : Infinity;
    const canAddMore = selectedCount < maxCount;

    // Validation durumu
    const validationStatus = await this.validateCurrentAssociations(sourceItem, rule);

    return {
      rule,
      availableCount,
      selectedCount,
      canAddMore,
      validationStatus
    };
  }

  // Private Methods

  /**
   * Filtreleme kriterlerini query'ye uygula
   */
  private applyFilterCriteria(
    query: mongoose.Query<any[], any>,
    criteria: IFilterCriteria
  ): mongoose.Query<any[], any> {
    // Kategori filtresi
    if (criteria.categories && criteria.categories.length > 0) {
      query.where({ category: { $in: criteria.categories } });
    }

    // Aile filtresi
    if (criteria.families && criteria.families.length > 0) {
      query.where({ family: { $in: criteria.families } });
    }

    // Attribute filtreleri
    if (criteria.attributeFilters && criteria.attributeFilters.length > 0) {
      for (const filter of criteria.attributeFilters) {
        const attributePath = `attributes.${filter.attributeCode}`;
        
        switch (filter.operator) {
          case 'equals':
            query.where({ [attributePath]: filter.value });
            break;
          case 'contains':
            query.where({ [attributePath]: { $regex: filter.value, $options: 'i' } });
            break;
          case 'in':
            query.where({ [attributePath]: { $in: filter.value } });
            break;
          case 'range':
            if (filter.value.min !== undefined) {
              query.where({ [attributePath]: { $gte: filter.value.min } });
            }
            if (filter.value.max !== undefined) {
              query.where({ [attributePath]: { $lte: filter.value.max } });
            }
            break;
          case 'exists':
            query.where({ [attributePath]: { $exists: filter.value } });
            break;
        }
      }
    }

    // Custom query
    if (criteria.customQuery) {
      query.where(criteria.customQuery);
    }

    return query;
  }

  /**
   * Arama sorgusunu uygula
   */
  private applySearchQuery(
    query: mongoose.Query<any[], any>,
    searchQuery: string,
    rule: IAssociationRule
  ): mongoose.Query<any[], any> {
    const searchFields = rule.uiConfig.displayColumns?.map(col => `attributes.${col.attributeCode}`) || 
                        ['attributes.name', 'attributes.code'];

    const searchConditions = searchFields.map(field => ({
      [field]: { $regex: searchQuery, $options: 'i' }
    }));

    return query.or(searchConditions);
  }

  /**
   * Item'ın kurala uygunluğunu kontrol et
   */
  private async validateItemAgainstRule(
    item: IItem,
    rule: IAssociationRule
  ): Promise<IAssociationValidationResult> {
    const result: IAssociationValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!rule.filterCriteria) {
      return result;
    }

    const criteria = rule.filterCriteria;

    // Kategori kontrolü
    if (criteria.categories && criteria.categories.length > 0) {
      const itemCategory = item.category as any;
      const categoryId = itemCategory._id || itemCategory;
      
      const allowedCategories = criteria.categories.map(cat => cat.toString());
      if (!allowedCategories.includes(categoryId.toString())) {
        result.errors.push('Item kategorisi izin verilen kategoriler arasında değil');
        result.isValid = false;
      }
    }

    // Aile kontrolü
    if (criteria.families && criteria.families.length > 0) {
      const itemFamily = item.family as any;
      const familyId = itemFamily._id || itemFamily;
      
      const allowedFamilies = criteria.families.map(fam => fam.toString());
      if (!allowedFamilies.includes(familyId.toString())) {
        result.errors.push('Item ailesi izin verilen aileler arasında değil');
        result.isValid = false;
      }
    }

    // Attribute filtreleri kontrolü
    if (criteria.attributeFilters) {
      for (const filter of criteria.attributeFilters) {
        const itemAttributes = item.attributes instanceof Map 
          ? Object.fromEntries(item.attributes) 
          : item.attributes;
        
        const attributeValue = itemAttributes[filter.attributeCode];
        
        switch (filter.operator) {
          case 'equals':
            if (attributeValue !== filter.value) {
              result.errors.push(`${filter.attributeCode} değeri ${filter.value} olmalı`);
              result.isValid = false;
            }
            break;
          case 'contains':
            if (!attributeValue || !attributeValue.toString().toLowerCase().includes(filter.value.toLowerCase())) {
              result.errors.push(`${filter.attributeCode} "${filter.value}" içermeli`);
              result.isValid = false;
            }
            break;
          case 'in':
            if (!filter.value.includes(attributeValue)) {
              result.errors.push(`${filter.attributeCode} değeri geçerli değerler arasında değil`);
              result.isValid = false;
            }
            break;
          case 'exists':
            const exists = attributeValue !== undefined && attributeValue !== null;
            if (exists !== filter.value) {
              result.errors.push(`${filter.attributeCode} ${filter.value ? 'olmalı' : 'olmamalı'}`);
              result.isValid = false;
            }
            break;
        }
      }
    }

    return result;
  }

  /**
   * Validation kurallarını kontrol et
   */
  private async validateAssociationRules(
    sourceItem: IItem,
    targetItems: IItem[],
    rule: IAssociationRule
  ): Promise<IAssociationValidationResult> {
    const result: IAssociationValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);
    const currentIds = currentAssociations[associationKey] || [];
    const currentCount = Array.isArray(currentIds) ? currentIds.length : (currentIds ? 1 : 0);
    const newCount = currentCount + targetItems.length;

    for (const validationRule of rule.validationRules) {
      switch (validationRule.type) {
        case 'required':
          if (validationRule.value && newCount === 0) {
            result.errors.push(validationRule.message || 'Bu association zorunludur');
            result.isValid = false;
          }
          break;
        case 'minCount':
          if (newCount < validationRule.value) {
            result.errors.push(validationRule.message || `Minimum ${validationRule.value} item gerekli`);
            result.isValid = false;
          }
          break;
        case 'maxCount':
          if (newCount > validationRule.value) {
            result.errors.push(validationRule.message || `Maximum ${validationRule.value} item izinli`);
            result.isValid = false;
          }
          break;
        case 'unique':
          const duplicates = targetItems.filter(item => 
            Array.isArray(currentIds) ? currentIds.includes((item._id as any)?.toString()) : currentIds === (item._id as any)?.toString()
          );
          if (duplicates.length > 0) {
            result.errors.push(validationRule.message || 'Duplicate item\'lar eklenemez');
            result.isValid = false;
          }
          break;
      }
    }

    return result;
  }

  /**
   * Mevcut association'ların validation durumu
   */
  private async validateCurrentAssociations(
    sourceItem: IItem,
    rule: IAssociationRule
  ): Promise<IAssociationValidationResult> {
    const result: IAssociationValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);
    const currentIds = currentAssociations[associationKey] || [];
    const currentCount = Array.isArray(currentIds) ? currentIds.length : (currentIds ? 1 : 0);

    for (const validationRule of rule.validationRules) {
      switch (validationRule.type) {
        case 'required':
          if (validationRule.value && currentCount === 0) {
            result.errors.push(validationRule.message || 'Bu association zorunludur');
            result.isValid = false;
          }
          break;
        case 'minCount':
          if (currentCount < validationRule.value) {
            result.warnings.push(validationRule.message || `Minimum ${validationRule.value} item gerekli`);
          }
          break;
      }
    }

    return result;
  }

  /**
   * Match puanı hesapla
   */
  private calculateMatchScore(item: IFilteredItem, rule: IAssociationRule): IFilteredItem {
    let score = 0;
    const reasons: string[] = [];

    if (rule.filterCriteria) {
      // Kategori eşleşmesi
      if (rule.filterCriteria.categories) {
        score += 10;
        reasons.push('Kategori filtresi eşleşti');
      }

      // Aile eşleşmesi
      if (rule.filterCriteria.families) {
        score += 10;
        reasons.push('Aile filtresi eşleşti');
      }

      // Attribute eşleşmeleri
      if (rule.filterCriteria.attributeFilters) {
        score += rule.filterCriteria.attributeFilters.length * 5;
        reasons.push('Attribute filtreleri eşleşti');
      }
    }

    item.matchScore = score;
    item.matchReasons = reasons;

    return item;
  }

  /**
   * Item association'larını güncelle
   */
  private async updateItemAssociations(
    sourceItem: IItem,
    targetItemIds: string[],
    rule: IAssociationRule
  ): Promise<void> {
    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);

    // İlişki türüne göre güncelle
    switch (rule.relationshipType) {
      case 'one-to-one':
      case 'many-to-one':
        currentAssociations[associationKey] = targetItemIds[0];
        break;
      case 'one-to-many':
      case 'many-to-many':
        const existing = currentAssociations[associationKey] || [];
        const existingArray = Array.isArray(existing) ? existing : [existing];
        currentAssociations[associationKey] = [...existingArray, ...targetItemIds];
        break;
    }

    // Update item
    await Item.findByIdAndUpdate(sourceItem._id, {
      associations: currentAssociations
    });
  }

  /**
   * Association key oluştur
   */
  private getAssociationKey(rule: IAssociationRule): string {
    return `${rule.code}`;
  }
}

export default new EnhancedAssociationService();
