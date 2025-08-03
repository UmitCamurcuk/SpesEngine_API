import mongoose from 'mongoose';
import ItemType from '../models/ItemType';

/**
 * Mevcut CUSTOMERS ve ORDERS ItemType'larına association rules ekler
 */

async function updateExistingItemTypesWithAssociations() {
  try {
    console.log('🚀 Mevcut ItemType\'lara Association Rules Ekleme Başlıyor...');

    // 1. CUSTOMERS ItemType'ını bul ve güncelle
    console.log('📊 CUSTOMERS ItemType güncelleniyor...');
    
    const customersResult = await ItemType.findOneAndUpdate(
      { code: 'CUSTOMERS' },
      {
        $set: {
          associations: {
            outgoing: [
              {
                targetItemTypeCode: 'ORDERS',
                targetItemTypeName: 'Siparişler',
                relationshipType: 'one-to-many',
                cardinality: {
                  min: 0,
                  max: null // Unlimited
                },
                isRequired: false,
                cascadeDelete: false,
                displayField: 'order_date', // Sipariş tarihi field'ı
                searchableFields: ['order_date', 'order_status'],
                filterBy: {
                  isActive: true
                },
                uiConfig: {
                  showInList: true,
                  showInDetail: true,
                  allowInlineCreate: false,
                  allowInlineEdit: false,
                  displayMode: 'modal'
                }
              }
            ],
            incoming: []
          }
        }
      },
      { new: true, upsert: false }
    );

    if (customersResult) {
      console.log('✅ CUSTOMERS ItemType association rules eklendi');
      console.log('   Outgoing rules:', customersResult.associations?.outgoing?.length || 0);
    } else {
      console.log('❌ CUSTOMERS ItemType bulunamadı');
    }

    // 2. ORDERS ItemType'ını bul ve güncelle
    console.log('📦 ORDERS ItemType güncelleniyor...');
    
    const ordersResult = await ItemType.findOneAndUpdate(
      { code: 'ORDERS' },
      {
        $set: {
          associations: {
            outgoing: [
              {
                targetItemTypeCode: 'CUSTOMERS',
                targetItemTypeName: 'Müşteriler',
                relationshipType: 'many-to-one',
                cardinality: {
                  min: 1,     // Sipariş için müşteri zorunlu
                  max: 1      // Tek müşteri
                },
                isRequired: true,
                cascadeDelete: false,
                displayField: 'person_name', // Müşteri adı field'ı (person_information_group'tan)
                searchableFields: ['person_name', 'person_lastname'], // Müşteri ad-soyad
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
              }
            ],
            incoming: []
          }
        }
      },
      { new: true, upsert: false }
    );

    if (ordersResult) {
      console.log('✅ ORDERS ItemType association rules eklendi');
      console.log('   Outgoing rules:', ordersResult.associations?.outgoing?.length || 0);
    } else {
      console.log('❌ ORDERS ItemType bulunamadı');
    }

    // 3. Sonuçları doğrula
    console.log('🧪 Association rules doğrulanıyor...');
    
    const updatedCustomers = await ItemType.findOne({ code: 'CUSTOMERS' }).select('code associations');
    const updatedOrders = await ItemType.findOne({ code: 'ORDERS' }).select('code associations');

    console.log('📊 CUSTOMERS association rules:', updatedCustomers?.associations?.outgoing?.length || 0);
    console.log('📦 ORDERS association rules:', updatedOrders?.associations?.outgoing?.length || 0);

    // 4. Association rules detayları
    if (updatedOrders?.associations?.outgoing && updatedOrders.associations.outgoing.length > 0) {
      const customerAssociation = updatedOrders.associations.outgoing[0];
      console.log('🔗 ORDERS -> CUSTOMERS association:');
      console.log('   Target:', customerAssociation.targetItemTypeCode);
      console.log('   Type:', customerAssociation.relationshipType);
      console.log('   Required:', customerAssociation.isRequired);
      console.log('   Display Field:', customerAssociation.displayField);
      console.log('   UI Mode:', customerAssociation.uiConfig?.displayMode);
    }

    console.log('🎉 Association rules başarıyla eklendi!');
    console.log('');
    console.log('📝 Özet:');
    console.log('- ✅ CUSTOMERS ItemType: Bir müşterinin birden fazla siparişi olabilir (one-to-many)');
    console.log('- ✅ ORDERS ItemType: Her siparişin bir müşterisi olmalıdır (many-to-one, zorunlu)');
    console.log('- ✅ UI konfigürasyonu: ORDERS create ederken CUSTOMERS dropdown ile seçilecek');
    console.log('- ✅ Display field: Müşteri adı (person_name) gösterilecek');
    console.log('');
    console.log('🔧 Test için:');
    console.log('1. Frontend\'de Items -> Create sayfasına gidin');
    console.log('2. ORDERS ItemType\'ını seçin'); 
    console.log('3. İlişkiler adımında CUSTOMERS seçimi zorunlu olarak görünecek');

  } catch (error: any) {
    console.error('❌ Association rules eklenirken hata:', error.message);
    throw error;
  }
}

// Script çalıştır
async function main() {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spesengine';
    await mongoose.connect(mongoUri);
    console.log('🔗 MongoDB bağlantısı kuruldu');

    // Association rules ekle
    await updateExistingItemTypesWithAssociations();

    console.log('✨ Script başarıyla tamamlandı');
  } catch (error: any) {
    console.error('💥 Script hatası:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔗 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
main().catch(console.error);

export default updateExistingItemTypesWithAssociations;