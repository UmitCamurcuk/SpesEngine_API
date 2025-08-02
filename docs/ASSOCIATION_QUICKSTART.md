# Association Sistemi - Hızlı Başlangıç

## Genel Bakış

Association sistemi, ItemType'lar arasında iş mantığı ilişkileri kurmanıza olanak tanır. Müşteri-Sipariş, Ürün-Kategori gibi gerçek dünya ilişkilerini sistem içinde modelleyebilirsiniz.

## Özellikler

✅ **Tip Güvenli İlişkiler**: ItemType seviyesinde önceden tanımlı kurallar  
✅ **Esnek Cardinality**: one-to-one, one-to-many, many-to-one, many-to-many  
✅ **Performanslı Sorgular**: İndeksli ve optimize edilmiş sorgu yapısı  
✅ **UI Desteği**: Frontend entegrasyonu ve kullanıcı dostu arayüz  
✅ **Validation**: Otomatik doğrulama ve kısıtlama kontrolü  

## Hızlı Kurulum

### 1. Demo Kurulumu

```bash
cd SpesEngine_API
npm run setup:customer-order-demo
```

Bu script:
- Müşteri ve Sipariş ItemType'larını oluşturur
- Association kurallarını tanımlar  
- Gerekli çevirileri ekler
- Test verileri hazırlar

### 2. İlişki Tanımlama

ItemType modeline association kuralları eklenir:

```javascript
{
  associations: {
    outgoing: [
      {
        targetItemTypeCode: "customer",
        relationshipType: "many-to-one", 
        cardinality: { min: 1, max: 1 },
        isRequired: true,
        displayField: "name"
      }
    ]
  }
}
```

### 3. Frontend Kullanımı

#### Item Create Sayfası
Association step'i otomatik olarak eklenir:
- Zorunlu ilişkiler validation ile kontrol edilir
- Cardinality kuralları uygulanır
- UI konfigürasyonu otomatik çalışır

#### Item Details Sayfası  
Association tab'ı ile:
- İlişkili item'ları görüntüleme
- İlişki düzenleme/kaldırma
- Performanslı populate işlemleri

## API Kullanımı

### Association Oluşturma
```http
POST /api/items/:sourceItemId/associations/create
{
  "targetItemId": "64abc123def456789",
  "associationType": "customer_many-to-one" 
}
```

### Association'ları Getirme
```http
GET /api/items/:itemId/associations?populate=true
```

### Association Kaldırma
```http
POST /api/items/:sourceItemId/associations/remove
{
  "targetItemId": "64abc123def456789",
  "associationType": "customer_many-to-one"
}
```

## Best Practices

### 1. Association Kuralları

**✅ İyi Örnekler:**
```javascript
// Müşteri-Sipariş (Zorunlu, Many-to-One)
{
  targetItemTypeCode: "customer",
  relationshipType: "many-to-one",
  cardinality: { min: 1, max: 1 },
  isRequired: true
}

// Sipariş-Ürün (İsteğe bağlı, Many-to-Many)
{
  targetItemTypeCode: "product", 
  relationshipType: "many-to-many",
  cardinality: { min: 0, max: 50 },
  isRequired: false
}
```

**❌ Kaçınılacak Örnekler:**
```javascript
// Çok geniş cardinality
{ cardinality: { min: 0, max: 10000 } }

// Belirsiz display field
{ displayField: "unknownField" }
```

### 2. Performance

- **İndeks kullanımı**: Association queries otomatik olarak indekslidir
- **Populate seçici**: Sadece gerekli alanları populate edin
- **Pagination**: Büyük association listelerinde sayfalama kullanın

### 3. Validation

- **Zorunlu ilişkiler**: Frontend'de real-time validation
- **Cardinality kontrolü**: Min/max kısıtlamaları uygulanır
- **Döngüsel ilişki**: Otomatik olarak engellenir

## Troubleshooting

### Yaygın Hatalar

1. **"Association rule not found"**
   - ItemType'da association tanımı eksik
   - targetItemTypeCode yanlış

2. **"Cardinality violation"**
   - Min/max kısıtlamalarını kontrol edin
   - Mevcut association sayısını doğrulayın

3. **"Target item not found"**
   - Target item'ın aktif olduğundan emin olun
   - ID'nin doğru olduğunu kontrol edin

### Debug Mode

```javascript
// Backend debug
DEBUG=association:* npm start

// Frontend debug  
localStorage.setItem('DEBUG_ASSOCIATIONS', 'true');
```

## Gelişmiş Özellikler

### Custom Display Field
```javascript
{
  displayField: "customerName",
  searchableFields: ["customerName", "email", "phone"]
}
```

### UI Konfigürasyonu
```javascript
{
  uiConfig: {
    displayMode: "modal",
    allowInlineCreate: true,
    showInList: true
  }
}
```

### Filter By
```javascript
{
  filterBy: {
    isActive: true,
    category: "premium"
  }
}
```

## Sonraki Adımlar

1. Demo script'i çalıştırın
2. İlk müşteri ve sipariş oluşturun  
3. Association'ları test edin
4. Kendi ItemType'larınız için kuralları tanımlayın

Daha fazla bilgi için: [API Dokümantasyonu](./ASSOCIATION_API.md)