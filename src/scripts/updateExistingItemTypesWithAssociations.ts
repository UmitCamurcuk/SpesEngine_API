import mongoose from 'mongoose';
import ItemType from '../models/ItemType';

/**
 * Mevcut CUSTOMERS ve ORDERS ItemType'larına association rules ekler
 */

async function updateExistingItemTypesWithAssociations() {
  try {

    // 1. CUSTOMERS ItemType'ını bul ve güncelle
    
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
      console.log('   Outgoing rules:', customersResult.associations?.outgoing?.length || 0);
    } else {
    }

    // 2. ORDERS ItemType'ını bul ve güncelle
    
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
      console.log('   Outgoing rules:', ordersResult.associations?.outgoing?.length || 0);
    } else {
    }

    // 3. Sonuçları doğrula
    
    const updatedCustomers = await ItemType.findOne({ code: 'CUSTOMERS' }).select('code associations');
    const updatedOrders = await ItemType.findOne({ code: 'ORDERS' }).select('code associations');


    // 4. Association rules detayları
    if (updatedOrders?.associations?.outgoing && updatedOrders.associations.outgoing.length > 0) {
      const customerAssociation = updatedOrders.associations.outgoing[0];
      console.log('   Target:', customerAssociation.targetItemTypeCode);
      console.log('   Type:', customerAssociation.relationshipType);
      console.log('   Required:', customerAssociation.isRequired);
      console.log('   Display Field:', customerAssociation.displayField);
      console.log('   UI Mode:', customerAssociation.uiConfig?.displayMode);
    }

    console.log('');
    console.log('');
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

    // Association rules ekle
    await updateExistingItemTypesWithAssociations();

  } catch (error: any) {
    console.error('💥 Script hatası:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Script'i çalıştır
main().catch(console.error);

export default updateExistingItemTypesWithAssociations;