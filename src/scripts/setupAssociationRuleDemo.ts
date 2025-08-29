import mongoose from 'mongoose';
import connectDB from '../config/database';
import ItemType from '../models/ItemType';
import Association from '../models/Association';
import AssociationRule from '../models/AssociationRule';
import Category from '../models/Category';
import Family from '../models/Family';
import Localization from '../models/Localization';

/**
 * Demo Script: Sipariş - Stok İlişkisi için Association Rule Kurulumu
 * 
 * Bu script sizin örneğinizi (Sipariş ve Stok arasında Kumaş kullanımı) kurar:
 * 1. ItemType'ları oluşturur/bulur (Sipariş, Stok)
 * 2. Association oluşturur (Sipariş - Kumaş Kullanımı)
 * 3. AssociationRule oluşturur (kategori ve aile filtresi ile)
 */

async function setupAssociationRuleDemo() {
  try {
    console.log('🚀 Association Rule Demo kurulumu başlatılıyor...');

    // Database bağlantısı
    await connectDB();

    // 1. Localization'ları oluştur
    console.log('📝 Localization kayıtları oluşturuluyor...');
    
    const siparisNameLoc = await Localization.create({
      key: 'itemtype.siparis.name',
      translations: {
        tr: 'Sipariş',
        en: 'Order'
      }
    });

    const siparisDescLoc = await Localization.create({
      key: 'itemtype.siparis.description',
      translations: {
        tr: 'Müşteri siparişlerini yönetmek için kullanılan item type',
        en: 'Item type used for managing customer orders'
      }
    });

    const stokNameLoc = await Localization.create({
      key: 'itemtype.stok.name',
      translations: {
        tr: 'Stok',
        en: 'Stock'
      }
    });

    const stokDescLoc = await Localization.create({
      key: 'itemtype.stok.description',
      translations: {
        tr: 'Depo stoklarını yönetmek için kullanılan item type',
        en: 'Item type used for managing warehouse stocks'
      }
    });

    // 2. Kategori oluştur (Kumaş kategorisi)
    console.log('📁 Kategori oluşturuluyor...');
    
    const kumasKategoriNameLoc = await Localization.create({
      key: 'category.kumas.name',
      translations: {
        tr: 'Kumaş',
        en: 'Fabric'
      }
    });

    const kumasKategoriDescLoc = await Localization.create({
      key: 'category.kumas.description',
      translations: {
        tr: 'Tekstil kumaşları kategorisi',
        en: 'Textile fabrics category'
      }
    });

    let kumasKategori = await Category.findOne({ code: 'KUMAS' });
    if (!kumasKategori) {
      kumasKategori = await Category.create({
        name: kumasKategoriNameLoc._id,
        code: 'KUMAS',
        description: kumasKategoriDescLoc._id,
        isActive: true
      });
    }

    // 3. Aile oluştur (Pamuklu kumaşlar ailesi)
    console.log('👨‍👩‍👧‍👦 Aile oluşturuluyor...');
    
    const pamukluFamilyNameLoc = await Localization.create({
      key: 'family.pamuklu.name',
      translations: {
        tr: 'Pamuklu Kumaşlar',
        en: 'Cotton Fabrics'
      }
    });

    const pamukluFamilyDescLoc = await Localization.create({
      key: 'family.pamuklu.description',
      translations: {
        tr: 'Pamuk içerikli kumaşlar ailesi',
        en: 'Cotton content fabrics family'
      }
    });

    let pamukluFamily = await Family.findOne({ code: 'PAMUKLU_KUMAS' });
    if (!pamukluFamily) {
      pamukluFamily = await Family.create({
        name: pamukluFamilyNameLoc._id,
        code: 'PAMUKLU_KUMAS',
        description: pamukluFamilyDescLoc._id,
        category: kumasKategori._id,
        attributeGroups: [],
        attributes: [],
        isActive: true
      });
    }

    // 4. ItemType'ları oluştur
    console.log('🏷️ ItemType\'lar oluşturuluyor...');

    let siparisItemType = await ItemType.findOne({ code: 'SIPARIS' });
    if (!siparisItemType) {
      siparisItemType = await ItemType.create({
        name: siparisNameLoc._id,
        code: 'SIPARIS',
        description: siparisDescLoc._id,
        category: kumasKategori._id, // Demo için aynı kategori
        isActive: true
      });
    }

    let stokItemType = await ItemType.findOne({ code: 'STOK' });
    if (!stokItemType) {
      stokItemType = await ItemType.create({
        name: stokNameLoc._id,
        code: 'STOK',
        description: stokDescLoc._id,
        category: kumasKategori._id,
        isActive: true
      });
    }

    // 5. Association oluştur
    console.log('🔗 Association oluşturuluyor...');
    
    const associationNameLoc = await Localization.create({
      key: 'association.siparis_kumas_kullanimi.name',
      translations: {
        tr: 'Sipariş - Kumaş Kullanımı',
        en: 'Order - Fabric Usage'
      }
    });

    const associationDescLoc = await Localization.create({
      key: 'association.siparis_kumas_kullanimi.description',
      translations: {
        tr: 'Siparişlerde kullanılan kumaşları tanımlar',
        en: 'Defines fabrics used in orders'
      }
    });

    let association = await Association.findOne({ code: 'siparis_kumas_kullanimi' });
    if (!association) {
      association = await Association.create({
        code: 'siparis_kumas_kullanimi',
        name: associationNameLoc._id,
        description: associationDescLoc._id,
        isDirectional: true,
        relationshipType: 'many-to-many',
        allowedSourceTypes: [siparisItemType._id],
        allowedTargetTypes: [stokItemType._id],
        
        // YENİ: Filter Criteria - sizin istediğiniz özellik!
        filterCriteria: {
          // Target ItemType'da (Stok) sadece kumaş kategorisinden seçim yapılabilir
          allowedTargetCategories: [kumasKategori._id],
          // Target ItemType'da (Stok) sadece pamuklu aile seçim yapılabilir
          allowedTargetFamilies: [pamukluFamily._id],
          // Target attribute filtreleri
          targetAttributeFilters: [
            {
              attributeCode: 'stok_durumu',
              operator: 'equals',
              value: 'mevcut',
              description: 'Sadece stokta mevcut olan kumaşlar'
            },
            {
              attributeCode: 'kalite_onay',
              operator: 'equals',
              value: true,
              description: 'Kalite kontrolünden geçmiş kumaşlar'
            }
          ]
        },
        
        metadata: {
          purpose: 'fabric_usage',
          industry: 'textile'
        }
      });
    }

    // 6. Association Rule oluştur
    console.log('📋 Association Rule oluşturuluyor...');
    
    const ruleNameLoc = await Localization.create({
      key: 'rule.siparis_kumas_secimi.name',
      translations: {
        tr: 'Sipariş Kumaş Seçimi',
        en: 'Order Fabric Selection'
      }
    });

    const ruleDescLoc = await Localization.create({
      key: 'rule.siparis_kumas_secimi.description',
      translations: {
        tr: 'Sipariş oluştururken sadece kumaş kategorisinden ve pamuklu kumaş ailesinden seçim yapılabilir',
        en: 'When creating orders, selection can only be made from fabric category and cotton fabric family'
      }
    });

    let associationRule = await AssociationRule.findOne({ code: 'SIPARIS_KUMAS_SECIMI' });
    if (!associationRule) {
      associationRule = await AssociationRule.create({
        code: 'SIPARIS_KUMAS_SECIMI',
        name: ruleNameLoc._id,
        description: ruleDescLoc._id,
        associationId: association._id,
        sourceItemTypeId: siparisItemType._id,
        targetItemTypeId: stokItemType._id,
        relationshipType: 'many-to-many',
        
        // Filtreleme kriterleri - Bu sizin isteğiniz!
        filterCriteria: {
          categories: [kumasKategori._id], // Sadece kumaş kategorisinden
          families: [pamukluFamily._id],   // Sadece pamuklu kumaş ailesinden
          attributeFilters: [
            {
              attributeCode: 'stok_durumu',
              operator: 'equals',
              value: 'mevcut'
            },
            {
              attributeCode: 'kalite_onay',
              operator: 'equals', 
              value: true
            }
          ]
        },

        // Validation kuralları
        validationRules: [
          {
            type: 'required',
            value: true,
            message: 'En az bir kumaş seçimi zorunludur'
          },
          {
            type: 'minCount',
            value: 1,
            message: 'Minimum 1 kumaş seçilmelidir'
          },
          {
            type: 'maxCount',
            value: 10,
            message: 'Maximum 10 kumaş seçilebilir'
          }
        ],

        // UI konfigürasyonu
        uiConfig: {
          displayMode: 'table',
          allowMultiSelect: true,
          allowInlineCreate: false,
          allowInlineEdit: false,
          showInList: true,
          showInDetail: true,
          showSearchBox: true,
          showFilters: true,
          pageSize: 20,
          sortBy: 'name',
          sortOrder: 'asc',
          displayColumns: [
            {
              attributeCode: 'name',
              displayName: 'Kumaş Adı',
              width: 200,
              sortable: true
            },
            {
              attributeCode: 'code',
              displayName: 'Kumaş Kodu',
              width: 150,
              sortable: true
            },
            {
              attributeCode: 'stok_miktari',
              displayName: 'Stok Miktarı',
              width: 120,
              sortable: true
            },
            {
              attributeCode: 'birim_fiyat',
              displayName: 'Birim Fiyat',
              width: 120,
              sortable: true
            }
          ]
        },

        priority: 10,
        isActive: true,
        isRequired: true,
        cascadeDelete: false,
        createdBy: new mongoose.Types.ObjectId(), // Demo user ID
        updatedBy: new mongoose.Types.ObjectId()  // Demo user ID
      });
    }

    // 7. ItemType'a association rule'u ekle
    console.log('🔗 ItemType\'a association rule bağlanıyor...');
    
    await ItemType.findByIdAndUpdate(siparisItemType._id, {
      $addToSet: { associationIds: association._id }
    });

    console.log('✅ Demo kurulumu tamamlandı!');
    console.log('\n📊 Oluşturulan kayıtlar:');
    console.log(`- Sipariş ItemType: ${siparisItemType.code}`);
    console.log(`- Stok ItemType: ${stokItemType.code}`);
    console.log(`- Kumaş Kategorisi: ${kumasKategori.code}`);
    console.log(`- Pamuklu Kumaş Ailesi: ${pamukluFamily.code}`);
    console.log(`- Association: ${association.code}`);
    console.log(`- Association Rule: ${associationRule.code}`);

    console.log('\n🔧 Kullanım Seçenekleri:');
    console.log('\n📝 SEÇENEK 1: Association Rule ile (daha gelişmiş):');
    console.log('1. Association rule çağırın:');
    console.log(`   GET /api/association-rules/SIPARIS_KUMAS_SECIMI/items/{siparisItemId}`);
    console.log('2. Association oluşturmak için:');
    console.log(`   POST /api/association-rules/SIPARIS_KUMAS_SECIMI/associate/{siparisItemId}`);

    console.log('\n🎯 SEÇENEK 2: Direkt Association Filter ile (sizin istediğiniz):');
    console.log('1. Association filter criteria çağırın:');
    console.log(`   GET /api/associations/${association._id}/filtered-items/{siparisItemId}`);
    console.log('2. Sadece kumaş kategorisi ve pamuklu aile filtrelenmiş stoklar gelecek');
    console.log('3. Normal association oluşturmak için:');
    console.log(`   POST /api/items/{siparisItemId}/associations/create`);

    console.log('\n💡 Frontend\'de kullanım:');
    console.log('```jsx');
    console.log('// Yeni Association oluştururken filter criteria belirleyin:');
    console.log('<EnhancedAssociationCreator');
    console.log('  open={isOpen}');
    console.log('  onAssociationCreated={handleCreated}');
    console.log('/>');
    console.log('');
    console.log('// Association kullanırken filtrelenmiş item\'ları gösterin:');
    console.log('<FilteredItemSelector');
    console.log('  sourceItemId={siparisId}');
    console.log('  associationId={associationId}');
    console.log('  onItemsSelected={handleSelection}');
    console.log('/>');
    console.log('```');

  } catch (error) {
    console.error('❌ Demo kurulumu sırasında hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupAssociationRuleDemo();
}

export default setupAssociationRuleDemo;
