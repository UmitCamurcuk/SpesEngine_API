import mongoose from 'mongoose';
import ItemType from '../models/ItemType';
import Item from '../models/Item';
import Category from '../models/Category';
import Family from '../models/Family';
import Localization from '../models/Localization';

/**
 * Müşteri-Sipariş Association Demo Script
 * 
 * Bu script aşağıdaki iş mantığını kurar:
 * - Bir müşterinin birden fazla siparişi olabilir
 * - Bir siparişin tek müşterisi vardır
 * - Sipariş girerken müşteri seçimi zorunludur
 * - Müşteri silinirse siparişleri görüntülenir ama bağlantı kopar
 */

async function setupCustomerOrderAssociation() {
  try {
    console.log('🚀 Müşteri-Sipariş Association Kurulumu Başlatılıyor...');

    // 1. Müşteri ItemType'ı oluştur/güncelle
    console.log('📊 Müşteri ItemType ayarlanıyor...');
    
    // Müşteri name localization'ı oluştur
    const customerNameLoc = await Localization.findOneAndUpdate(
      { key: 'customer_name', namespace: 'itemtype' },
      {
        key: 'customer_name',
        namespace: 'itemtype',
        translations: new Map([
          ['tr', 'Müşteri'],
          ['en', 'Customer']
        ])
      },
      { upsert: true, new: true }
    );

    // Müşteri description localization'ı oluştur
    const customerDescLoc = await Localization.findOneAndUpdate(
      { key: 'customer_desc', namespace: 'itemtype' },
      {
        key: 'customer_desc',
        namespace: 'itemtype',
        translations: new Map([
          ['tr', 'Müşteri bilgileri ve iletişim detayları'],
          ['en', 'Customer information and contact details']
        ])
      },
      { upsert: true, new: true }
    );

    // Default kategori (gerekirse oluştur)
    let customerCategory = await Category.findOne({ code: 'business' });
    if (!customerCategory) {
      const businessCatLoc = await Localization.create({
        key: 'business_cat',
        namespace: 'category',
        translations: new Map([
          ['tr', 'İş'],
          ['en', 'Business']
        ])
      });
      customerCategory = await Category.create({
        name: businessCatLoc._id,
        code: 'business',
        description: businessCatLoc._id,
        isActive: true
      });
    }

    // Müşteri ItemType'ını oluştur/güncelle
    const customerItemType = await ItemType.findOneAndUpdate(
      { code: 'customer' },
      {
        name: customerNameLoc._id,
        code: 'customer',
        description: customerDescLoc._id,
        category: customerCategory._id,
        associations: {
          outgoing: [
            {
              targetItemTypeCode: 'order',
              targetItemTypeName: 'Sipariş',
              relationshipType: 'one-to-many',
              cardinality: {
                min: 0,
                max: null // Unlimited
              },
              isRequired: false,
              cascadeDelete: false,
              displayField: 'orderNumber',
              searchableFields: ['orderNumber', 'orderDate', 'status'],
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
        },
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Müşteri ItemType oluşturuldu:', customerItemType.code);

    // 2. Sipariş ItemType'ı oluştur/güncelle
    console.log('📦 Sipariş ItemType ayarlanıyor...');

    // Sipariş name localization'ı oluştur
    const orderNameLoc = await Localization.findOneAndUpdate(
      { key: 'order_name', namespace: 'itemtype' },
      {
        key: 'order_name',
        namespace: 'itemtype',
        translations: new Map([
          ['tr', 'Sipariş'],
          ['en', 'Order']
        ])
      },
      { upsert: true, new: true }
    );

    // Sipariş description localization'ı oluştur
    const orderDescLoc = await Localization.findOneAndUpdate(
      { key: 'order_desc', namespace: 'itemtype' },
      {
        key: 'order_desc',
        namespace: 'itemtype',
        translations: new Map([
          ['tr', 'Müşteri siparişleri ve satış bilgileri'],
          ['en', 'Customer orders and sales information']
        ])
      },
      { upsert: true, new: true }
    );

    // Sipariş ItemType'ını oluştur/güncelle
    const orderItemType = await ItemType.findOneAndUpdate(
      { code: 'order' },
      {
        name: orderNameLoc._id,
        code: 'order',
        description: orderDescLoc._id,
        category: customerCategory._id,
        associations: {
          outgoing: [
            {
              targetItemTypeCode: 'customer',
              targetItemTypeName: 'Müşteri',
              relationshipType: 'many-to-one',
              cardinality: {
                min: 1,     // Sipariş için müşteri zorunlu
                max: 1      // Tek müşteri
              },
              isRequired: true,
              cascadeDelete: false,
              displayField: 'customerName',
              searchableFields: ['customerName', 'email', 'phone'],
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
        },
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Sipariş ItemType oluşturuldu:', orderItemType.code);

    // 3. Örnek Müşteri oluştur
    console.log('👤 Örnek müşteri oluşturuluyor...');

    // Default family (gerekirse oluştur)
    let defaultFamily = await Family.findOne({ code: 'default' });
    if (!defaultFamily) {
      const defaultFamilyLoc = await Localization.create({
        key: 'default_family',
        namespace: 'family',
        translations: new Map([
          ['tr', 'Varsayılan'],
          ['en', 'Default']
        ])
      });
      defaultFamily = await Family.create({
        name: defaultFamilyLoc._id,
        code: 'default',
        description: defaultFamilyLoc._id,
        category: customerCategory._id,
        attributeGroups: [],
        attributes: [],
        isActive: true
      });
    }

    const sampleCustomer = await Item.create({
      itemType: customerItemType._id,
      family: defaultFamily._id,
      category: customerCategory._id,
      attributes: {
        customerName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 123 4567',
        company: 'Yılmaz Ltd. Şti.',
        address: 'İstanbul, Türkiye'
      },
      associations: {},
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(), // Demo için
      updatedBy: new mongoose.Types.ObjectId()
    });

    console.log('✅ Örnek müşteri oluşturuldu:', sampleCustomer._id);

    // 4. Örnek Sipariş oluştur (müşteri ile bağlantılı)
    console.log('📋 Örnek sipariş oluşturuluyor...');

    const sampleOrder = await Item.create({
      itemType: orderItemType._id,
      family: defaultFamily._id,
      category: customerCategory._id,
      attributes: {
        orderNumber: 'ORD-2024-001',
        orderDate: new Date(),
        status: 'Hazırlanıyor',
        totalAmount: 1500.00,
        currency: 'TRY',
        notes: 'Acil sipariş - hızlı teslimat'
      },
      associations: {
        'customer_many-to-one': String(sampleCustomer._id) // Müşteri bağlantısı
      },
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    console.log('✅ Örnek sipariş oluşturuldu:', sampleOrder._id);

    // 5. İkinci sipariş oluştur (aynı müşteri)
    console.log('📋 İkinci sipariş oluşturuluyor...');

    const secondOrder = await Item.create({
      itemType: orderItemType._id,
      family: defaultFamily._id,
      category: customerCategory._id,
      attributes: {
        orderNumber: 'ORD-2024-002',
        orderDate: new Date(),
        status: 'Teslim Edildi',
        totalAmount: 890.50,
        currency: 'TRY',
        notes: 'Normal teslimat'
      },
      associations: {
        'customer_many-to-one': String(sampleCustomer._id) // Aynı müşteri
      },
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    console.log('✅ İkinci sipariş oluşturuldu:', secondOrder._id);

    // 6. Müşterinin sipariş listesini güncelle (reverse association)
    console.log('🔄 Müşteri associationları güncelleniyor...');

    await Item.findByIdAndUpdate(sampleCustomer._id, {
      'associations.order_one-to-many': [
        String(sampleOrder._id),
        String(secondOrder._id)
      ]
    });

    console.log('✅ Müşteri associationları güncellendi');

    // 7. Test sorguları çalıştır
    console.log('🧪 Test sorguları çalıştırılıyor...');

    // Müşteriyi siparişleriyle beraber getir
    const customerWithOrders = await Item.findById(sampleCustomer._id)
      .populate('itemType family category')
      .lean();

    console.log('📊 Müşteri bilgileri:', {
      id: customerWithOrders?._id,
      name: customerWithOrders?.attributes?.customerName,
      orderCount: Array.isArray(customerWithOrders?.associations?.['order_one-to-many']) 
        ? customerWithOrders.associations['order_one-to-many'].length 
        : 0
    });

    // Siparişleri müşteri bilgileriyle getir
    const ordersWithCustomer = await Item.find({
      itemType: orderItemType._id,
      'associations.customer_many-to-one': String(sampleCustomer._id)
    }).populate('itemType family category').lean();

    console.log('📦 Müşterinin siparişleri:', ordersWithCustomer.map(order => ({
      orderNumber: order.attributes?.orderNumber,
      status: order.attributes?.status,
      amount: order.attributes?.totalAmount
    })));

    console.log('🎉 Müşteri-Sipariş Association kurulumu tamamlandı!');
    console.log('');
    console.log('📝 Kurulum Özeti:');
    console.log('- ✅ Müşteri ItemType oluşturuldu (one-to-many to orders)');
    console.log('- ✅ Sipariş ItemType oluşturuldu (many-to-one to customer)');
    console.log('- ✅ Örnek müşteri oluşturuldu');
    console.log('- ✅ İki örnek sipariş oluşturuldu');
    console.log('- ✅ Association bağlantıları kuruldu');
    console.log('');
    console.log('🔧 Kullanım:');
    console.log('1. Yeni sipariş oluştururken müşteri seçimi zorunlu');
    console.log('2. Müşteri detayında tüm siparişleri görüntülenir');
    console.log('3. Association validation otomatik çalışır');
    console.log('4. API endpoint\'leri kullanarak association yönetimi yapılabilir');

  } catch (error) {
    console.error('❌ Kurulum hatası:', error);
    throw error;
  }
}

// Script'i direkt çalıştırmak için
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spesengine')
    .then(() => {
      console.log('🔗 MongoDB bağlantısı kuruldu');
      return setupCustomerOrderAssociation();
    })
    .then(() => {
      console.log('✨ Script başarıyla tamamlandı');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script hatası:', error);
      process.exit(1);
    });
}

export default setupCustomerOrderAssociation;