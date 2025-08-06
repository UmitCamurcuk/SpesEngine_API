import mongoose from 'mongoose';
import Item from '../models/Item';
import ItemType from '../models/ItemType';
import { IAssociationRule, IItemType } from '../models/ItemType';
import { IItem } from '../models/Item';
import { ValidationError } from '../utils/errors';

export interface IAssociationQueryOptions {
  populate?: boolean;          // İlişkili item'ları populate et
  populateFields?: string[];   // Populate edilecek alanlar
  includeInactive?: boolean;   // Pasif item'ları da getir
  sort?: Record<string, 1 | -1>; // Sıralama
  limit?: number;              // Limit
  skip?: number;               // Skip
}

export interface IAssociationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IPopulatedAssociation {
  associationKey: string;
  targetItemTypeCode: string;
  relationshipType: string;
  items: IItem[];
  metadata: IAssociationRule;
}

/**
 * Association Management Service
 * ItemType'lar arasındaki ilişkileri yönetir ve optimize edilmiş sorgular sağlar
 */
class AssociationService {

  /**
   * ItemType için tanımlı association kurallarını getir
   */
  async getAssociationRules(itemTypeCode: string): Promise<IAssociationRule[]> {
    const itemType = await ItemType.findOne({ code: itemTypeCode, isActive: true });
    if (!itemType) {
      throw new ValidationError(`ItemType bulunamadı: ${itemTypeCode}`);
    }

    const rules: IAssociationRule[] = [];
    
    // AssociationIds'den association'ları getir
    if (itemType.associationIds && itemType.associationIds.length > 0) {
      const Association = require('../models/Association').default;
      const associations = await Association.find({
        _id: { $in: itemType.associationIds }
      });

      for (const association of associations) {
        // Bu itemType source olarak kullanılıyor mu?
        if (association.allowedSourceTypes.includes(itemTypeCode)) {
          for (const targetTypeCode of association.allowedTargetTypes) {
            if (targetTypeCode !== itemTypeCode) {
              rules.push({
                targetItemTypeCode: targetTypeCode,
                targetItemTypeName: targetTypeCode === 'customer' ? 'Müşteri' : 'Sipariş',
                relationshipType: association.relationshipType,
                cardinality: {
                  min: 0,
                  max: undefined
                },
                isRequired: false,
                cascadeDelete: false,
                displayField: 'name',
                searchableFields: ['name'],
                filterBy: {
                  isActive: true
                },
                uiConfig: {
                  showInList: true,
                  showInDetail: true,
                  allowInlineCreate: false,
                  allowInlineEdit: false,
                  displayMode: 'dropdown'
                }
              });
            }
          }
        }
        
        // Bu itemType target olarak kullanılıyor mu?
        if (association.allowedTargetTypes.includes(itemTypeCode)) {
          for (const sourceTypeCode of association.allowedSourceTypes) {
            if (sourceTypeCode !== itemTypeCode) {
              rules.push({
                targetItemTypeCode: sourceTypeCode,
                targetItemTypeName: sourceTypeCode === 'customer' ? 'Müşteri' : 'Sipariş',
                relationshipType: this.reverseAssociation(association.relationshipType) as 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many',
                cardinality: {
                  min: 0,
                  max: undefined
                },
                isRequired: false,
                cascadeDelete: false,
                displayField: 'name',
                searchableFields: ['name'],
                filterBy: {
                  isActive: true
                },
                uiConfig: {
                  showInList: true,
                  showInDetail: true,
                  allowInlineCreate: false,
                  allowInlineEdit: false,
                  displayMode: 'dropdown'
                }
              });
            }
          }
        }
      }
    }

    return rules;
  }

  /**
   * Item'ın association'larını validate et
   */
  async validateAssociations(itemId: string, associations: Record<string, any>): Promise<IAssociationValidationResult> {
    const result: IAssociationValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const item = await Item.findById(itemId).populate('itemType');
      if (!item) {
        result.errors.push('Item bulunamadı');
        result.isValid = false;
        return result;
      }

      const itemType = item.itemType as IItemType;
      const rules = await this.getAssociationRules(itemType.code);

      // Her association için validation
      for (const [associationKey, targetIds] of Object.entries(associations)) {
        const rule = rules.find(r => this.getAssociationKey(r) === associationKey);
        
        if (!rule) {
          result.warnings.push(`Tanımsız association: ${associationKey}`);
          continue;
        }

        // Cardinality kontrolü
        const idArray = Array.isArray(targetIds) ? targetIds : [targetIds];
        const count = idArray.filter(id => id).length;

        if (rule.cardinality.min && count < rule.cardinality.min) {
          result.errors.push(`${associationKey}: Minimum ${rule.cardinality.min} ilişki gerekli, ${count} tanımlı`);
          result.isValid = false;
        }

        if (rule.cardinality.max && count > rule.cardinality.max) {
          result.errors.push(`${associationKey}: Maximum ${rule.cardinality.max} ilişki izinli, ${count} tanımlı`);
          result.isValid = false;
        }

        // Required kontrolü
        if (rule.isRequired && count === 0) {
          result.errors.push(`${associationKey}: Bu ilişki zorunludur`);
          result.isValid = false;
        }

        // Target item'ların varlığını kontrol et
        for (const targetId of idArray) {
          if (targetId) {
            const targetItem = await Item.findById(targetId).populate('itemType');
            if (!targetItem) {
              result.errors.push(`${associationKey}: Hedef item bulunamadı (${targetId})`);
              result.isValid = false;
              continue;
            }

            const targetItemType = targetItem.itemType as IItemType;
            if (targetItemType.code !== rule.targetItemTypeCode) {
              result.errors.push(`${associationKey}: Yanlış item type. Beklenen: ${rule.targetItemTypeCode}, Gelen: ${targetItemType.code}`);
              result.isValid = false;
            }

            // Custom validation rules
            if (rule.validationRules) {
              const customValidation = await this.validateCustomRules(targetItem, rule.validationRules);
              if (!customValidation.isValid) {
                result.errors.push(...customValidation.errors);
                result.warnings.push(...customValidation.warnings);
                result.isValid = false;
              }
            }
          }
        }
      }

      // Eksik required association'ları kontrol et
      for (const rule of rules) {
        if (rule.isRequired) {
          const associationKey = this.getAssociationKey(rule);
          if (!associations[associationKey] || 
              (Array.isArray(associations[associationKey]) && associations[associationKey].length === 0)) {
            result.errors.push(`Zorunlu association eksik: ${associationKey}`);
            result.isValid = false;
          }
        }
      }

    } catch (error: any) {
      result.errors.push(`Validation hatası: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Item'ın association'larını populate ederek getir
   */
  async getItemAssociations(itemId: string, options: IAssociationQueryOptions = {}): Promise<IPopulatedAssociation[]> {
    const item = await Item.findById(itemId).populate('itemType');
    if (!item) {
      throw new ValidationError('Item bulunamadı');
    }

    const itemType = item.itemType as IItemType;
    const rules = await this.getAssociationRules(itemType.code);
    const associations: IPopulatedAssociation[] = [];

    if (!item.associations) {
      return associations;
    }

    const associationsMap = item.associations instanceof Map 
      ? Object.fromEntries(item.associations) 
      : item.associations;

    for (const rule of rules) {
      const associationKey = this.getAssociationKey(rule);
      const targetIds = associationsMap[associationKey];
      
      if (!targetIds) {
        continue;
      }

      const idArray = Array.isArray(targetIds) ? targetIds : [targetIds];
      const validIds = idArray.filter(id => mongoose.Types.ObjectId.isValid(id));

      if (validIds.length === 0) {
        continue;
      }

      let items: IItem[] = [];

      if (options.populate) {
        // Query builder
        const query = Item.find({
          _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) }
        });

        if (!options.includeInactive) {
          query.where({ isActive: true });
        }

        // Custom filtering
        if (rule.filterBy) {
          const filterObj = rule.filterBy instanceof Map 
            ? Object.fromEntries(rule.filterBy) 
            : rule.filterBy;
          query.where(filterObj);
        }

        // Populate fields
        if (options.populateFields?.length) {
          for (const field of options.populateFields) {
            query.populate(field);
          }
        } else {
          // Default populate
          query.populate('itemType family category');
        }

        // Sorting
        if (options.sort) {
          query.sort(options.sort);
        } else if (rule.displayField) {
          query.sort({ [`attributes.${rule.displayField}`]: 1 });
        }

        // Pagination
        if (options.skip) query.skip(options.skip);
        if (options.limit) query.limit(options.limit);

        items = await query.exec();
      }

      associations.push({
        associationKey,
        targetItemTypeCode: rule.targetItemTypeCode,
        relationshipType: rule.relationshipType,
        items,
        metadata: rule
      });
    }

    return associations;
  }

  /**
   * Association kurma işlemi
   */
  async createAssociation(
    sourceItemId: string, 
    targetItemId: string, 
    associationType: string
  ): Promise<void> {
    const sourceItem = await Item.findById(sourceItemId).populate('itemType');
    const targetItem = await Item.findById(targetItemId).populate('itemType');

    if (!sourceItem || !targetItem) {
      throw new ValidationError('Source veya target item bulunamadı');
    }

    const sourceItemType = sourceItem.itemType as IItemType;
    const targetItemType = targetItem.itemType as IItemType;

    // Association rule'unu bul
    const rules = await this.getAssociationRules(sourceItemType.code);
    const rule = rules.find(r => 
      r.targetItemTypeCode === targetItemType.code && 
      this.getAssociationKey(r) === associationType
    );

    if (!rule) {
      throw new ValidationError(`İlişki kuralı bulunamadı: ${associationType}`);
    }

    // Mevcut associations'ı al
    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);
    let targetIds = currentAssociations[associationKey] || [];

    // Array'e çevir
    if (!Array.isArray(targetIds)) {
      targetIds = [targetIds];
    }

    // Duplicate kontrolü
    if (targetIds.includes(targetItemId)) {
      throw new ValidationError('Bu ilişki zaten mevcut');
    }

    // Cardinality kontrolü
    if (rule.cardinality.max && targetIds.length >= rule.cardinality.max) {
      throw new ValidationError(`Maximum ${rule.cardinality.max} ilişki izinli`);
    }

    // İlişkiyi ekle
    targetIds.push(targetItemId);

    // One-to-one veya many-to-one ise tek değer olarak sakla
    if (rule.relationshipType === 'one-to-one' || rule.relationshipType === 'many-to-one') {
      currentAssociations[associationKey] = targetItemId;
    } else {
      currentAssociations[associationKey] = targetIds;
    }

    // Update
    await Item.findByIdAndUpdate(sourceItemId, {
      associations: currentAssociations
    });

    // Reverse ilişki varsa onu da güncelle
    await this.updateReverseAssociation(targetItemId, sourceItemId, rule, 'add');
  }

  /**
   * Association silme işlemi
   */
  async removeAssociation(
    sourceItemId: string, 
    targetItemId: string, 
    associationType: string
  ): Promise<void> {
    const sourceItem = await Item.findById(sourceItemId).populate('itemType');
    if (!sourceItem) {
      throw new ValidationError('Source item bulunamadı');
    }

    const sourceItemType = sourceItem.itemType as IItemType;
    const rules = await this.getAssociationRules(sourceItemType.code);
    const rule = rules.find(r => this.getAssociationKey(r) === associationType);

    if (!rule) {
      throw new ValidationError(`İlişki kuralı bulunamadı: ${associationType}`);
    }

    // Mevcut associations'ı al
    const currentAssociations = sourceItem.associations instanceof Map 
      ? Object.fromEntries(sourceItem.associations) 
      : (sourceItem.associations || {});

    const associationKey = this.getAssociationKey(rule);
    let targetIds = currentAssociations[associationKey] || [];

    if (!Array.isArray(targetIds)) {
      targetIds = [targetIds];
    }

    // İlişkiyi kaldır
    targetIds = targetIds.filter((id: string) => id !== targetItemId);

    // Required kontrolü
    if (rule.isRequired && targetIds.length === 0) {
      throw new ValidationError('Bu ilişki zorunlu, silinemez');
    }

    // Update
    if (targetIds.length === 0) {
      delete currentAssociations[associationKey];
    } else if (rule.relationshipType === 'one-to-one' || rule.relationshipType === 'many-to-one') {
      currentAssociations[associationKey] = targetIds[0];
    } else {
      currentAssociations[associationKey] = targetIds;
    }

    await Item.findByIdAndUpdate(sourceItemId, {
      associations: currentAssociations
    });

    // Reverse ilişki varsa onu da güncelle
    await this.updateReverseAssociation(targetItemId, sourceItemId, rule, 'remove');
  }

  /**
   * Belirli bir ItemType'a göre item'ları ara (association için)
   */
  async searchItemsForAssociation(
    sourceItemId: string,
    targetItemTypeCode: string,
    searchQuery?: string,
    options: IAssociationQueryOptions = {}
  ): Promise<IItem[]> {
    const sourceItem = await Item.findById(sourceItemId).populate('itemType');
    if (!sourceItem) {
      throw new ValidationError('Source item bulunamadı');
    }

    const targetItemType = await ItemType.findOne({ code: targetItemTypeCode, isActive: true });
    if (!targetItemType) {
      throw new ValidationError(`Target ItemType bulunamadı: ${targetItemTypeCode}`);
    }

    // Association rule'unu bul
    const sourceItemType = sourceItem.itemType as IItemType;
    const rules = await this.getAssociationRules(sourceItemType.code);
    const rule = rules.find(r => r.targetItemTypeCode === targetItemTypeCode);

    // Query builder
    const query = Item.find({ 
      itemType: targetItemType._id,
      isActive: options.includeInactive ? undefined : true
    });

    // Custom filtering (rule'dan gelen)
    if (rule?.filterBy) {
      const filterObj = rule.filterBy instanceof Map 
        ? Object.fromEntries(rule.filterBy) 
        : rule.filterBy;
      query.where(filterObj);
    }

    // Search query
    if (searchQuery && rule?.searchableFields?.length) {
      const searchConditions = rule.searchableFields.map(field => ({
        [`attributes.${field}`]: { $regex: searchQuery, $options: 'i' }
      }));
      query.or(searchConditions);
    }

    // Populate
    if (options.populate) {
      if (options.populateFields?.length) {
        for (const field of options.populateFields) {
          query.populate(field);
        }
      } else {
        query.populate('itemType family category');
      }
    }

    // Sorting
    if (options.sort) {
      query.sort(options.sort);
    } else if (rule?.displayField) {
      query.sort({ [`attributes.${rule.displayField}`]: 1 });
    }

    // Pagination
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);

    return await query.exec();
  }

  // Helper Methods

  private reverseAssociation(type: string): string {
    switch (type) {
      case 'one-to-one': return 'one-to-one';
      case 'one-to-many': return 'many-to-one';
      case 'many-to-one': return 'one-to-many';
      case 'many-to-many': return 'many-to-many';
      default: return type;
    }
  }

  private getAssociationKey(rule: IAssociationRule): string {
    return `${rule.targetItemTypeCode}_${rule.relationshipType}`;
  }

  private async validateCustomRules(
    item: IItem, 
    rules: Record<string, any>
  ): Promise<IAssociationValidationResult> {
    // Custom validation logic implementation
    // Bu kısım business logic'e göre customize edilebilir
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  private async updateReverseAssociation(
    targetItemId: string,
    sourceItemId: string,
    rule: IAssociationRule,
    operation: 'add' | 'remove'
  ): Promise<void> {
    // Reverse association mantığı
    // Bi-directional ilişkiler için gerekirse uygulanır
    // Şu an için basit implementasyon
    
    // Silence the unused parameter warning
    void targetItemId;
    void sourceItemId;
    void rule;
    void operation;
  }
}

export default new AssociationService();