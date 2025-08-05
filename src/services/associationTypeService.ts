import Association, { IAssociation } from '../models/Association';
import { NotFoundError, ValidationError } from '../utils/errors';
import Localization from '../models/Localization';

class AssociationTypeService {
  async create(data: Partial<IAssociation>, userId?: string): Promise<IAssociation> {
    // Association kodunun benzersiz olduğunu kontrol et
    const existingType = await Association.findOne({ code: data.code });
    if (existingType) {
      throw new ValidationError(`Association kodu '${data.code}' zaten kullanılıyor.`);
    }
    
    // CreatedBy ve updatedBy alanlarını ekle
    const associationData = {
      ...data,
      createdBy: userId,
      updatedBy: userId
    };
    
    const association = new Association(associationData);
    const savedType = await association.save();
    
    // Populate edilmiş veriyi döndür
    return await this.getById(String(savedType._id));
  }

  async getAll(): Promise<IAssociation[]> {
    const associations = await Association.find()
      .populate('createdBy', 'firstName lastName email name')
      .populate('updatedBy', 'firstName lastName email name')
      .sort({ createdAt: -1 });

    // Name ve description localization'larını populate et
    const populatedTypes = await Promise.all(
      associations.map(async (type) => {
        const populatedType = type.toObject();
        
        // Name localization'ını getir
        if (type.name) {
          try {
            const nameLocalization = await Localization.findById(type.name);
            if (nameLocalization) {
              populatedType.name = nameLocalization;
            }
          } catch (error) {
            console.error('Name localization error:', error);
          }
        }
        
        // Description localization'ını getir
        if (type.description) {
          try {
            const descLocalization = await Localization.findById(type.description);
            if (descLocalization) {
              populatedType.description = descLocalization;
            }
          } catch (error) {
            console.error('Description localization error:', error);
          }
        }
        
        return populatedType;
      })
    );

    return populatedTypes;
  }

  async getById(id: string): Promise<IAssociation> {
    const association = await Association.findById(id)
      .populate('createdBy', 'firstName lastName email name')
      .populate('updatedBy', 'firstName lastName email name');
    
    if (!association) {
      throw new NotFoundError('Association bulunamadı');
    }

    const populatedType = association.toObject();
    
    // Name localization'ını getir
    if (association.name) {
      try {
        const nameLocalization = await Localization.findById(association.name);
        if (nameLocalization) {
          populatedType.name = nameLocalization;
        }
      } catch (error) {
        console.error('Name localization error:', error);
      }
    }
    
    // Description localization'ını getir
    if (association.description) {
      try {
        const descLocalization = await Localization.findById(association.description);
        if (descLocalization) {
          populatedType.description = descLocalization;
        }
      } catch (error) {
        console.error('Description localization error:', error);
      }
    }
    
    return populatedType;
  }

  async update(id: string, data: Partial<IAssociation>, userId?: string): Promise<IAssociation> {
    // Eğer kod değiştiyse benzersizliğini kontrol et
    if (data.code) {
      const existingType = await Association.findOne({ 
        code: data.code,
        _id: { $ne: id }
      });
      if (existingType) {
        throw new ValidationError(`Association kodu '${data.code}' zaten kullanılıyor.`);
      }
    }
    
    // UpdatedBy alanını ekle
    const updateData = {
      ...data,
      updatedBy: userId
    };
    
    const association = await Association.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!association) {
      throw new NotFoundError('Association bulunamadı');
    }
    
    // Populate edilmiş veriyi döndür
    return await this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await Association.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Association bulunamadı');
    }
  }
}

export default new AssociationTypeService(); 