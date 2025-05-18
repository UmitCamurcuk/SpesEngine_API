import mongoose from 'mongoose';
import connectDB from '../config/database';
import Attribute, { IAttribute } from '../models/Attribute';
import AttributeGroup, { IAttributeGroup } from '../models/AttributeGroup';

async function updateAttributeGroups() {
  try {
    // Veritabanına bağlan
    await connectDB();
    console.log('Veritabanı bağlantısı başarılı.');

    // Tüm attribute'ları getir
    const attributes = await Attribute.find({});
    console.log(`${attributes.length} adet attribute bulundu.`);

    // Her bir attribute için, ilgili attributeGroup'u güncelle
    for (const attribute of attributes) {
      if (attribute.attributeGroup) {
        // AttributeGroup'u bul
        const attributeGroup = await AttributeGroup.findById(attribute.attributeGroup);
        
        if (attributeGroup) {
          // Eğer bu attribute zaten group'un içinde yoksa ekle
          const attributeIdStr = (attribute as any)._id.toString();
          const exists = attributeGroup.attributes.some(attrId => attrId.toString() === attributeIdStr);
          
          if (!exists) {
            attributeGroup.attributes.push((attribute as any)._id);
            await attributeGroup.save();
            console.log(`Attribute ${(attribute as any).name} (${(attribute as any)._id}) attributeGroup ${attributeGroup.name} (${attributeGroup._id}) içine eklendi.`);
          } else {
            console.log(`Attribute ${(attribute as any).name} (${(attribute as any)._id}) zaten attributeGroup ${attributeGroup.name} (${attributeGroup._id}) içinde bulunuyor.`);
          }
        } else {
          console.log(`AttributeGroup ID ${attribute.attributeGroup} bulunamadı.`);
        }
      } else {
        console.log(`Attribute ${(attribute as any).name} (${(attribute as any)._id}) için attributeGroup belirtilmemiş.`);
      }
    }

    console.log('İşlem tamamlandı.');
    process.exit(0);
  } catch (error) {
    console.error('AttributeGroup güncelleme işlemi sırasında hata:', error);
    process.exit(1);
  }
}

// Scripti çalıştır
updateAttributeGroups(); 