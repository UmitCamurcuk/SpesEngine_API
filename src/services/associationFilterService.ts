import mongoose from 'mongoose';
import Item from '../models/Item';
import ItemType from '../models/ItemType';
import Association from '../models/Association';
import Category from '../models/Category';
import Family from '../models/Family';
import { IItem } from '../models/Item';
import { IAssociation, IAssociationFilterCriteria } from '../models/Association';
import { ValidationError } from '../utils/errors';

export interface IFilteredAssociationResult {
  items: IItem[];
  totalCount: number;
  appliedFilters: {
    categories?: any[];
    families?: any[];
    attributeFilters?: any[];
  };
}

/**
 * Association Filter Service
 * Association'lardaki filter criteria'ya göre item'ları filtreler
 */
class AssociationFilterService {

  /**
   * Association'da tanımlı filter criteria'ya göre target item'ları filtrele
   */
  async getFilteredTargetItems(
    sourceItemId: string,
    associationId: string,
    options: {
      page?: number;
      limit?: number;
      searchQuery?: string;
      additionalFilters?: Record<string, any>;
      populate?: boolean;
    } = {}
  ): Promise<IFilteredAssociationResult> {
    
    // Association'ı getir ve filter criteria'yı al
    const association = await Association.findById(associationId)
      .populate('allowedTargetTypes')
      .populate('filterCriteria.allowedTargetCategories')
      .populate('filterCriteria.allowedTargetFamilies');

    if (!association) {
      throw new ValidationError('Association bulunamadı');
    }

    // Source item'ı kontrol et
    const sourceItem = await Item.findById(sourceItemId).populate('itemType');
    if (!sourceItem) {
      throw new ValidationError('Source item bulunamadı');
    }

    // Source ItemType'ın bu association'ı kullanıp kullanamayacağını kontrol et
    const sourceItemType = sourceItem.itemType as any;
    const isAllowedSource = association.allowedSourceTypes.some((st: any) => 
      st._id.toString() === sourceItemType._id.toString()
    );

    if (!isAllowedSource) {
      throw new ValidationError('Bu ItemType bu association\'ı kullanamaz');
    }

    // Source item filter criteria kontrol
    if (association.filterCriteria) {
      const sourceValidation = await this.validateSourceItemAgainstCriteria(
        sourceItem, 
        association.filterCriteria
      );
      
      if (!sourceValidation.isValid) {
        throw new ValidationError(`Source item kriterleri karşılamıyor: ${sourceValidation.errors.join(', ')}`);
      }
    }

    // Target item'ları filtrele
    return await this.applyTargetFiltering(association, options);
  }

  /**
   * Source item'ın filter criteria'larını karşılayıp karşılamadığını kontrol et
   */
  async validateSourceItemAgainstCriteria(
    sourceItem: IItem,
    filterCriteria: IAssociationFilterCriteria
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Source kategori kontrolü
    if (filterCriteria.allowedSourceCategories && filterCriteria.allowedSourceCategories.length > 0) {
      const sourceCategory = sourceItem.category as any;
      const categoryId = sourceCategory._id || sourceCategory;
      
      const isAllowedCategory = filterCriteria.allowedSourceCategories.some(
        (cat: any) => cat._id?.toString() === categoryId.toString() || cat.toString() === categoryId.toString()
      );
      
      if (!isAllowedCategory) {
        errors.push('Source item kategorisi izin verilen kategoriler arasında değil');
      }
    }

    // Source aile kontrolü
    if (filterCriteria.allowedSourceFamilies && filterCriteria.allowedSourceFamilies.length > 0) {
      const sourceFamily = sourceItem.family as any;
      const familyId = sourceFamily._id || sourceFamily;
      
      const isAllowedFamily = filterCriteria.allowedSourceFamilies.some(
        (fam: any) => fam._id?.toString() === familyId.toString() || fam.toString() === familyId.toString()
      );
      
      if (!isAllowedFamily) {
        errors.push('Source item ailesi izin verilen aileler arasında değil');
      }
    }

    // Source attribute filtreleri
    if (filterCriteria.sourceAttributeFilters && filterCriteria.sourceAttributeFilters.length > 0) {
      const sourceAttributes = sourceItem.attributes instanceof Map 
        ? Object.fromEntries(sourceItem.attributes) 
        : sourceItem.attributes;

      for (const filter of filterCriteria.sourceAttributeFilters) {
        const attributeValue = sourceAttributes[filter.attributeCode];
        const isValid = this.validateAttributeFilter(attributeValue, filter);
        
        if (!isValid) {
          errors.push(`Source attribute ${filter.attributeCode} kriteri karşılamıyor`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Target item filtreleme işlemini uygula
   */
  async applyTargetFiltering(
    association: IAssociation,
    options: {
      page?: number;
      limit?: number;
      searchQuery?: string;
      additionalFilters?: Record<string, any>;
      populate?: boolean;
    }
  ): Promise<IFilteredAssociationResult> {
    
    // Base query - target ItemType'lardan item'ları al
    const targetItemTypeIds = association.allowedTargetTypes.map((tt: any) => tt._id);
    let query = Item.find({
      itemType: { $in: targetItemTypeIds },
      isActive: true
    });

    const appliedFilters: any = {};

    // Filter criteria'yı uygula
    if (association.filterCriteria) {
      const criteria = association.filterCriteria;

      // Target kategori filtresi
      if (criteria.allowedTargetCategories && criteria.allowedTargetCategories.length > 0) {
        const categoryIds = criteria.allowedTargetCategories.map((cat: any) => cat._id || cat);
        query.where({ category: { $in: categoryIds } });
        appliedFilters.categories = criteria.allowedTargetCategories;
      }

      // Target aile filtresi  
      if (criteria.allowedTargetFamilies && criteria.allowedTargetFamilies.length > 0) {
        const familyIds = criteria.allowedTargetFamilies.map((fam: any) => fam._id || fam);
        query.where({ family: { $in: familyIds } });
        appliedFilters.families = criteria.allowedTargetFamilies;
      }

      // Target attribute filtreleri
      if (criteria.targetAttributeFilters && criteria.targetAttributeFilters.length > 0) {
        for (const filter of criteria.targetAttributeFilters) {
          const attributePath = `attributes.${filter.attributeCode}`;
          
          switch (filter.operator) {
            case 'equals':
              query.where({ [attributePath]: filter.value });
              break;
            case 'contains':
              query.where({ [attributePath]: { $regex: filter.value, $options: 'i' } });
              break;
            case 'in':
              query.where({ [attributePath]: { $in: Array.isArray(filter.value) ? filter.value : [filter.value] } });
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
        appliedFilters.attributeFilters = criteria.targetAttributeFilters;
      }
    }

    // Arama sorgusu
    if (options.searchQuery) {
      const searchRegex = { $regex: options.searchQuery, $options: 'i' };
      query.or([
        { 'attributes.name': searchRegex },
        { 'attributes.code': searchRegex },
        { 'attributes.description': searchRegex }
      ]);
    }

    // Ek filtreler
    if (options.additionalFilters) {
      query.where(options.additionalFilters);
    }

    // Total count
    const totalCount = await Item.countDocuments(query.getQuery());

    // Populate
    if (options.populate) {
      query.populate('itemType family category createdBy updatedBy');
    }

    // Pagination
    if (options.page && options.limit) {
      const skip = (options.page - 1) * options.limit;
      query.skip(skip).limit(options.limit);
    }

    // Sıralama
    query.sort({ createdAt: -1 });

    const items = await query.exec();

    return {
      items,
      totalCount,
      appliedFilters
    };
  }

  /**
   * Attribute filter validation
   */
  private validateAttributeFilter(value: any, filter: any): boolean {
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return value && value.toString().toLowerCase().includes(filter.value.toLowerCase());
      case 'in':
        const filterValues = Array.isArray(filter.value) ? filter.value : [filter.value];
        return filterValues.includes(value);
      case 'range':
        if (filter.value.min !== undefined && value < filter.value.min) return false;
        if (filter.value.max !== undefined && value > filter.value.max) return false;
        return true;
      case 'exists':
        const exists = value !== undefined && value !== null;
        return exists === filter.value;
      default:
        return true;
    }
  }

  /**
   * Association için mevcut filtreleme kriterlerini getir
   */
  async getAssociationFilterInfo(associationId: string): Promise<{
    hasFilters: boolean;
    filterSummary: string[];
    allowedTargetCategories?: any[];
    allowedTargetFamilies?: any[];
    allowedSourceCategories?: any[];
    allowedSourceFamilies?: any[];
  }> {
    const association = await Association.findById(associationId)
      .populate('filterCriteria.allowedTargetCategories', 'code name')
      .populate('filterCriteria.allowedTargetFamilies', 'code name')
      .populate('filterCriteria.allowedSourceCategories', 'code name')
      .populate('filterCriteria.allowedSourceFamilies', 'code name');

    if (!association || !association.filterCriteria) {
      return {
        hasFilters: false,
        filterSummary: []
      };
    }

    const criteria = association.filterCriteria;
    const summary: string[] = [];

    if (criteria.allowedTargetCategories?.length) {
      summary.push(`Target kategoriler: ${criteria.allowedTargetCategories.length} adet`);
    }

    if (criteria.allowedTargetFamilies?.length) {
      summary.push(`Target aileler: ${criteria.allowedTargetFamilies.length} adet`);
    }

    if (criteria.allowedSourceCategories?.length) {
      summary.push(`Source kategoriler: ${criteria.allowedSourceCategories.length} adet`);
    }

    if (criteria.allowedSourceFamilies?.length) {
      summary.push(`Source aileler: ${criteria.allowedSourceFamilies.length} adet`);
    }

    if (criteria.targetAttributeFilters?.length) {
      summary.push(`Target attribute filtreleri: ${criteria.targetAttributeFilters.length} adet`);
    }

    if (criteria.sourceAttributeFilters?.length) {
      summary.push(`Source attribute filtreleri: ${criteria.sourceAttributeFilters.length} adet`);
    }

    return {
      hasFilters: summary.length > 0,
      filterSummary: summary,
      allowedTargetCategories: criteria.allowedTargetCategories,
      allowedTargetFamilies: criteria.allowedTargetFamilies,
      allowedSourceCategories: criteria.allowedSourceCategories,
      allowedSourceFamilies: criteria.allowedSourceFamilies
    };
  }

  /**
   * Source item için uygun association'ları getir
   */
  async getAvailableAssociationsForItem(itemId: string): Promise<any[]> {
    const item = await Item.findById(itemId).populate('itemType category family');
    if (!item) {
      throw new ValidationError('Item bulunamadı');
    }

    const itemType = item.itemType as any;

    // Bu ItemType'ın kaynak olarak kullanabileceği association'ları bul
    const associations = await Association.find({
      allowedSourceTypes: itemType._id
    })
      .populate('allowedTargetTypes', 'code name')
      .populate('filterCriteria.allowedSourceCategories', 'code name')
      .populate('filterCriteria.allowedSourceFamilies', 'code name');

    // Item'ın her association için uygunluğunu kontrol et
    const availableAssociations = [];

    for (const association of associations) {
      if (association.filterCriteria) {
        const validation = await this.validateSourceItemAgainstCriteria(item, association.filterCriteria);
        
        if (validation.isValid) {
          // Filter bilgilerini ekle
          const filterInfo = await this.getAssociationFilterInfo(association._id?.toString() || '');
          availableAssociations.push({
            ...association.toObject(),
            filterInfo
          });
        }
      } else {
        // Filter criteria yoksa tüm item'lar için uygun
        availableAssociations.push({
          ...association.toObject(),
          filterInfo: { hasFilters: false, filterSummary: [] }
        });
      }
    }

    return availableAssociations;
  }
}

export default new AssociationFilterService();
