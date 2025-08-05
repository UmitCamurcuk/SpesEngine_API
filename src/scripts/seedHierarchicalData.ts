import mongoose from 'mongoose';
import Attribute from '../models/Attribute';
import AttributeGroup from '../models/AttributeGroup';
import Category from '../models/Category';
import Family from '../models/Family';
import ItemType from '../models/ItemType';
import localizationService from '../services/localizationService';

async function seedHierarchicalData() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb://localhost:27017/spesengine');
    console.log('MongoDB bağlantısı başarılı');

    // 1. Mevcut verileri temizle
    console.log('Mevcut veriler temizleniyor...');
    await ItemType.deleteMany({});
    await Category.deleteMany({});
    await Family.deleteMany({});
    await AttributeGroup.deleteMany({});
    await Attribute.deleteMany({});
    console.log('Mevcut veriler temizlendi');

    // 2. ATTRIBUTES (En temel seviye)
    console.log('Attributes oluşturuluyor...');
    const attributeDefinitions = [
      {
        nameTranslations: { tr: 'Renk', en: 'Color' },
        code: 'color',
        descriptionTranslations: { tr: 'Ürünün renk özniteliği', en: 'Product color attribute' },
        type: 'select',
        options: ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Siyah', 'Beyaz'],
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Boyut', en: 'Size' },
        code: 'size',
        descriptionTranslations: { tr: 'Ürünün boyut özniteliği', en: 'Product size attribute' },
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Marka', en: 'Brand' },
        code: 'brand',
        descriptionTranslations: { tr: 'Ürünün marka özniteliği', en: 'Product brand attribute' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Fiyat', en: 'Price' },
        code: 'price',
        descriptionTranslations: { tr: 'Ürünün fiyat özniteliği', en: 'Product price attribute' },
        type: 'number',
        validations: { min: 0, max: 999999 },
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Malzeme', en: 'Material' },
        code: 'material',
        descriptionTranslations: { tr: 'Ürünün malzeme özniteliği', en: 'Product material attribute' },
        type: 'select',
        options: ['Pamuk', 'Polyester', 'Denim', 'Yün', 'İpek'],
        isRequired: false,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Ağırlık', en: 'Weight' },
        code: 'weight',
        descriptionTranslations: { tr: 'Ürünün ağırlık özniteliği', en: 'Product weight attribute' },
        type: 'number',
        validations: { min: 0, max: 10000 },
        isRequired: false,
        isActive: true
      }
    ];

    const createdAttributes: any[] = [];
    for (const attrDef of attributeDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${attrDef.code}_name`,
          namespace: 'attributes',
          translations: attrDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${attrDef.code}_description`,
          namespace: 'attributes',
          translations: attrDef.descriptionTranslations
        });

        const attributeData = {
          name: nameLocalization._id,
          code: attrDef.code,
          type: attrDef.type,
          description: descriptionLocalization._id,
          isRequired: attrDef.isRequired,
          options: attrDef.options || [],
          validations: attrDef.validations,
          isActive: attrDef.isActive
        };

        const attribute = await Attribute.create(attributeData);
        createdAttributes.push(attribute);
      } catch (error) {
        console.error(`❌ Attribute oluşturma hatası (${attrDef.code}):`, error);
      }
    }
    console.log(`${createdAttributes.length} attribute oluşturuldu`);

    // 3. ATTRIBUTE GROUPS
    console.log('Attribute Groups oluşturuluyor...');
    const attributeGroupDefinitions = [
      {
        nameTranslations: { tr: 'Temel Özellikler', en: 'Basic Properties' },
        code: 'basic_properties',
        descriptionTranslations: { tr: 'Ürünün temel özelliklerini içeren grup', en: 'Group containing basic product properties' },
        attributeCodes: ['color', 'size', 'brand'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Fiyat ve Değer', en: 'Price and Value' },
        code: 'price_value',
        descriptionTranslations: { tr: 'Fiyat ve değer bilgilerini içeren grup', en: 'Group containing price and value information' },
        attributeCodes: ['price'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Fiziksel Özellikler', en: 'Physical Properties' },
        code: 'physical_properties',
        descriptionTranslations: { tr: 'Fiziksel özellikleri içeren grup', en: 'Group containing physical properties' },
        attributeCodes: ['material', 'weight'],
        isActive: true
      }
    ];

    const createdAttributeGroups: any[] = [];
    for (const agDef of attributeGroupDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${agDef.code}_name`,
          namespace: 'attribute_groups',
          translations: agDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${agDef.code}_description`,
          namespace: 'attribute_groups',
          translations: agDef.descriptionTranslations
        });

        // Attribute ID'lerini bul
        const attributeIds = agDef.attributeCodes.map(code => 
          createdAttributes.find(attr => attr.code === code)?._id
        ).filter(Boolean);

        const attributeGroupData = {
          name: nameLocalization._id,
          code: agDef.code,
          description: descriptionLocalization._id,
          attributes: attributeIds,
          isActive: agDef.isActive
        };

        const attributeGroup = await AttributeGroup.create(attributeGroupData);
        createdAttributeGroups.push(attributeGroup);
      } catch (error) {
        console.error(`❌ Attribute Group oluşturma hatası (${agDef.code}):`, error);
      }
    }
    console.log(`${createdAttributeGroups.length} attribute group oluşturuldu`);

    // 4. CATEGORIES (Orta seviye)
    console.log('Categories oluşturuluyor...');
    const categoryDefinitions = [
      {
        nameTranslations: { tr: 'Kadın Giyim', en: 'Women\'s Clothing' },
        code: 'womens_clothing',
        descriptionTranslations: { tr: 'Kadın giyim kategorisi', en: 'Women\'s clothing category' },
        isActive: true
      },
      {
        nameTranslations: { tr: 'Erkek Giyim', en: 'Men\'s Clothing' },
        code: 'mens_clothing',
        descriptionTranslations: { tr: 'Erkek giyim kategorisi', en: 'Men\'s clothing category' },
        isActive: true
      },
      {
        nameTranslations: { tr: 'Çocuk Giyim', en: 'Kids\' Clothing' },
        code: 'kids_clothing',
        descriptionTranslations: { tr: 'Çocuk giyim kategorisi', en: 'Kids\' clothing category' },
        isActive: true
      },
      {
        nameTranslations: { tr: 'Spor Giyim', en: 'Sportswear' },
        code: 'sportswear',
        descriptionTranslations: { tr: 'Spor giyim kategorisi', en: 'Sportswear category' },
        isActive: true
      }
    ];

    const createdCategories: any[] = [];
    for (const catDef of categoryDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_name`,
          namespace: 'categories',
          translations: catDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_description`,
          namespace: 'categories',
          translations: catDef.descriptionTranslations
        });

        const categoryData = {
          name: nameLocalization._id,
          code: catDef.code,
          description: descriptionLocalization._id,
          isActive: catDef.isActive
        };

        const category = await Category.create(categoryData);
        createdCategories.push(category);
      } catch (error) {
        console.error(`❌ Category oluşturma hatası (${catDef.code}):`, error);
      }
    }
    console.log(`${createdCategories.length} category oluşturuldu`);

    // 5. FAMILIES (En alt seviye) - Her family bir category'ye ait olmalı
    console.log('Families oluşturuluyor...');
    const familyDefinitions = [
      {
        nameTranslations: { tr: 'Üst Giyim', en: 'Tops' },
        code: 'tops',
        descriptionTranslations: { tr: 'Üst giyim ürün ailesi', en: 'Tops product family' },
        categoryCode: 'womens_clothing', // Bu family kadın giyimine ait
        attributeGroupCodes: ['basic_properties', 'price_value', 'physical_properties'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Alt Giyim', en: 'Bottoms' },
        code: 'bottoms',
        descriptionTranslations: { tr: 'Alt giyim ürün ailesi', en: 'Bottoms product family' },
        categoryCode: 'mens_clothing', // Bu family erkek giyimine ait
        attributeGroupCodes: ['basic_properties', 'price_value', 'physical_properties'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Ayakkabı', en: 'Footwear' },
        code: 'footwear',
        descriptionTranslations: { tr: 'Ayakkabı ürün ailesi', en: 'Footwear product family' },
        categoryCode: 'kids_clothing', // Bu family çocuk giyimine ait
        attributeGroupCodes: ['basic_properties', 'price_value', 'physical_properties'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Aksesuar', en: 'Accessories' },
        code: 'accessories',
        descriptionTranslations: { tr: 'Aksesuar ürün ailesi', en: 'Accessories product family' },
        categoryCode: 'sportswear', // Bu family spor giyimine ait
        attributeGroupCodes: ['basic_properties', 'price_value'],
        isActive: true
      }
    ];

    const createdFamilies: any[] = [];
    for (const famDef of familyDefinitions) {
      try {
        // Category ID'sini bul
        const categoryId = createdCategories.find(cat => cat.code === famDef.categoryCode)?._id;
        if (!categoryId) {
          console.error(`❌ Category bulunamadı: ${famDef.categoryCode}`);
          continue;
        }

        // Attribute Group ID'lerini bul
        const attributeGroupIds = famDef.attributeGroupCodes.map(code => 
          createdAttributeGroups.find(ag => ag.code === code)?._id
        ).filter(Boolean);

        const familyData = {
          name: famDef.nameTranslations.tr, // Family model string kullanıyor
          code: famDef.code,
          description: famDef.descriptionTranslations.tr, // Family model string kullanıyor
          category: categoryId, // Family'nin ait olduğu category
          attributeGroups: attributeGroupIds,
          isActive: famDef.isActive
        };

        const family = await Family.create(familyData);
        createdFamilies.push(family);
      } catch (error) {
        console.error(`❌ Family oluşturma hatası (${famDef.code}):`, error);
      }
    }
    console.log(`${createdFamilies.length} family oluşturuldu`);

    // 6. ITEM TYPES (En üst seviye)
    console.log('Item Types oluşturuluyor...');
    const itemTypeDefinitions = [
      {
        nameTranslations: { tr: 'Giyim Ürünleri', en: 'Clothing Products' },
        code: 'clothing_products',
        descriptionTranslations: { tr: 'Tüm giyim ürünlerini kapsayan ana tip', en: 'Main type covering all clothing products' },
        categoryCode: 'womens_clothing', // Ana kategori
        attributeGroupCodes: ['basic_properties', 'price_value', 'physical_properties'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Moda Ürünleri', en: 'Fashion Products' },
        code: 'fashion_products',
        descriptionTranslations: { tr: 'Moda odaklı ürün tipi', en: 'Fashion-focused product type' },
        categoryCode: 'mens_clothing',
        attributeGroupCodes: ['basic_properties', 'price_value'],
        isActive: true
      },
      {
        nameTranslations: { tr: 'Spor Ürünleri', en: 'Sports Products' },
        code: 'sports_products',
        descriptionTranslations: { tr: 'Spor odaklı ürün tipi', en: 'Sports-focused product type' },
        categoryCode: 'sportswear',
        attributeGroupCodes: ['basic_properties', 'physical_properties'],
        isActive: true
      }
    ];

    const createdItemTypes: any[] = [];
    for (const itDef of itemTypeDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${itDef.code}_name`,
          namespace: 'item_types',
          translations: itDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${itDef.code}_description`,
          namespace: 'item_types',
          translations: itDef.descriptionTranslations
        });

        // Category ID'sini bul
        const categoryId = createdCategories.find(cat => cat.code === itDef.categoryCode)?._id;
        if (!categoryId) {
          console.error(`❌ Category bulunamadı: ${itDef.categoryCode}`);
          continue;
        }

        // Attribute Group ID'lerini bul
        const attributeGroupIds = itDef.attributeGroupCodes.map(code => 
          createdAttributeGroups.find(ag => ag.code === code)?._id
        ).filter(Boolean);

        const itemTypeData = {
          name: nameLocalization._id,
          code: itDef.code,
          description: descriptionLocalization._id,
          category: categoryId,
          attributeGroups: attributeGroupIds,
          isActive: itDef.isActive
        };

        const itemType = await ItemType.create(itemTypeData);
        createdItemTypes.push(itemType);
      } catch (error) {
        console.error(`❌ Item Type oluşturma hatası (${itDef.code}):`, error);
      }
    }
    console.log(`${createdItemTypes.length} item type oluşturuldu`);

    console.log('\n=== HİYERAŞİK VERİ YAPISI OLUŞTURULDU ===');
    console.log('Hiyerarşi: ItemType > Category > Family');
    console.log(`- ${createdAttributes.length} Attributes`);
    console.log(`- ${createdAttributeGroups.length} Attribute Groups`);
    console.log(`- ${createdCategories.length} Categories`);
    console.log(`- ${createdFamilies.length} Families`);
    console.log(`- ${createdItemTypes.length} Item Types`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Genel Hata:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedHierarchicalData(); 