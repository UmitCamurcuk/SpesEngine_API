# Association API Dokümantasyonu

## Genel Bakış

Association sistemi, ItemType'lar arasında tanımlı ilişkileri yönetmek için tasarlanmıştır. Müşteri-Sipariş gibi iş mantığı ilişkilerini hem performanslı hem de esnek şekilde kurmanızı sağlar.

## Özellikler

- ✅ **Tip Güvenli İlişkiler**: ItemType seviyesinde tanımlı kurallar
- ✅ **Cardinality Kontrolü**: one-to-one, one-to-many, many-to-one, many-to-many
- ✅ **Validation**: Otomatik doğrulama ve kısıtlama kontrolü
- ✅ **Performans Optimizasyonu**: İndeksli sorgular ve populate desteği
- ✅ **UI Desteği**: Frontend için yapılandırılabilir görüntüleme seçenekleri

## API Endpoints

### 1. Item Association'larını Getir

```http
GET /api/items/:id/associations?populate=true&includeInactive=false
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "associationKey": "order_one-to-many",
      "targetItemTypeCode": "order",
      "relationshipType": "one-to-many",
      "items": [
        {
          "_id": "orderObjectId",
          "attributes": {
            "orderNumber": "ORD-2024-001",
            "status": "Hazırlanıyor"
          }
        }
      ],
      "metadata": {
        "cardinality": { "min": 0, "max": null },
        "isRequired": false
      }
    }
  ]
}
```

### 2. Association Oluştur

```http
POST /api/items/:sourceItemId/associations/create
```

**Payload:**
```json
{
  "targetItemId": "targetObjectId",
  "associationType": "customer_many-to-one"
}
```

### 3. Association Sil

```http
POST /api/items/:sourceItemId/associations/remove
```

**Payload:**
```json
{
  "targetItemId": "targetObjectId", 
  "associationType": "customer_many-to-one"
}
```

### 4. Association için Item Ara

```http
GET /api/items/:sourceItemId/search/:targetItemTypeCode?search=müşteri&page=1&limit=20
```

### 5. ItemType Association Kurallarını Getir

```http
GET /api/items/types/:itemTypeCode/association-rules
```

### 6. Association Validation

```http
POST /api/items/:id/associations/validate
```

**Payload:**
```json
{
  "associations": {
    "customer_many-to-one": "customerObjectId",
    "products_one-to-many": ["productId1", "productId2"]
  }
}
```

## Müşteri-Sipariş Örneği

### 1. ItemType Tanımları

**Müşteri ItemType:**
```json
{
  "code": "customer",
  "associations": {
    "outgoing": [
      {
        "targetItemTypeCode": "order",
        "relationshipType": "one-to-many",
        "cardinality": { "min": 0, "max": null },
        "isRequired": false,
        "displayField": "orderNumber",
        "uiConfig": {
          "showInList": true,
          "displayMode": "modal"
        }
      }
    ]
  }
}
```

**Sipariş ItemType:**
```json
{
  "code": "order", 
  "associations": {
    "outgoing": [
      {
        "targetItemTypeCode": "customer",
        "relationshipType": "many-to-one",
        "cardinality": { "min": 1, "max": 1 },
        "isRequired": true,
        "displayField": "customerName",
        "uiConfig": {
          "showInList": true,
          "displayMode": "dropdown"
        }
      }
    ]
  }
}
```

### 2. Item Oluşturma

**Müşteri Oluştur:**
```json
POST /api/items
{
  "itemType": "customerItemTypeId",
  "family": "familyId",
  "category": "categoryId",
  "attributes": {
    "customerName": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+90 555 123 4567"
  },
  "associations": {}
}
```

**Sipariş Oluştur (Müşteri ile bağlantılı):**
```json
POST /api/items
{
  "itemType": "orderItemTypeId",
  "family": "familyId", 
  "category": "categoryId",
  "attributes": {
    "orderNumber": "ORD-2024-001",
    "orderDate": "2024-01-15T10:00:00Z",
    "status": "Hazırlanıyor",
    "totalAmount": 1500.00
  },
  "associations": {
    "customer_many-to-one": "customerObjectId"
  }
}
```

### 3. Sorgulama Örnekleri

**Müşteriyi Siparişleriyle Getir:**
```http
GET /api/items/customerObjectId/associations?populate=true
```

**Belirli Müşterinin Siparişlerini Bul:**
```http
GET /api/items?itemType=orderItemTypeId&associations.customer_many-to-one=customerObjectId
```

**Sipariş için Müşteri Ara:**
```http
GET /api/items/orderObjectId/search/customer?search=ahmet
```

## Frontend Integration

### Association Rules Getir
```javascript
// ItemType'ın association kurallarını getir
const response = await fetch('/api/items/types/order/association-rules');
const rules = await response.json();

// UI formunu rules'a göre oluştur
rules.data.forEach(rule => {
  if (rule.targetItemTypeCode === 'customer') {
    // Müşteri seçim dropdown'ı oluştur
    createCustomerSelector(rule);
  }
});
```

### Item Oluşturma Formu
```javascript
// Sipariş formu validation
const validateOrderForm = async (formData) => {
  const response = await fetch(`/api/items/${itemId}/associations/validate`, {
    method: 'POST',
    body: JSON.stringify({
      associations: formData.associations
    })
  });
  
  const validation = await response.json();
  return validation.data.isValid;
};
```

### Association Yönetimi
```javascript
// Yeni association oluştur
const createAssociation = async (sourceId, targetId, type) => {
  await fetch(`/api/items/${sourceId}/associations/create`, {
    method: 'POST',
    body: JSON.stringify({
      targetItemId: targetId,
      associationType: type
    })
  });
};

// Association sil
const removeAssociation = async (sourceId, targetId, type) => {
  await fetch(`/api/items/${sourceId}/associations/remove`, {
    method: 'POST', 
    body: JSON.stringify({
      targetItemId: targetId,
      associationType: type
    })
  });
};
```

## İleri Seviye Kullanım

### Custom Validation Rules
```json
{
  "validationRules": {
    "maxActiveOrders": 5,
    "allowedRegions": ["İstanbul", "Ankara", "İzmir"],
    "minimumCreditScore": 700
  }
}
```

### Filtreleme ve Arama
```json
{
  "filterBy": {
    "isActive": true,
    "attributes.customerType": "premium"
  },
  "searchableFields": ["customerName", "email", "phone", "company"]
}
```

### UI Konfigürasyonu
```json
{
  "uiConfig": {
    "showInList": true,
    "showInDetail": true,
    "allowInlineCreate": false,
    "allowInlineEdit": false,
    "displayMode": "dropdown"
  }
}
```

## Performance Tips

1. **İndeksleme**: Association değerleri otomatik olarak indekslenir
2. **Pagination**: Büyük listelerde limit/skip kullanın
3. **Selective Population**: Sadece gerekli alanları populate edin
4. **Caching**: Frontend'de association rules'ları cache'leyin

## Hata Yönetimi

### Validation Hataları
- **CARDINALITY_ERROR**: Min/max kısıtlaması ihlali
- **REQUIRED_ERROR**: Zorunlu association eksik
- **TYPE_MISMATCH**: Yanlış ItemType bağlantısı
- **CIRCULAR_REFERENCE**: Döngüsel bağlantı

### Örnek Hata Response
```json
{
  "success": false,
  "message": "Association validation başarısız",
  "errors": [
    "customer_many-to-one: Bu ilişki zorunludur",
    "products_one-to-many: Maximum 10 ürün izinli, 15 tanımlı"
  ],
  "warnings": [
    "Tanımsız association: oldAssociationType"
  ]
}
```