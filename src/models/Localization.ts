import mongoose, { Schema, Document } from 'mongoose';

export interface ILocalization extends Document {
  key: string;            // Çeviri anahtarı (örn: "welcome_message", "item_type_name")
  translations: {         // Dillere göre çeviriler
    [lang: string]: string;
  };
  namespace: string;      // Çevirileri gruplamak için (örn: "common", "attributes", "errors")
}

const LocalizationSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    index: true
  },
  translations: {
    type: Map,
    of: String,
    default: {}
  },
  namespace: {
    type: String,
    required: true,
    default: 'common',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Bileşik index oluştur (key ve namespace birlikte unique olmalı)
LocalizationSchema.index({ key: 1, namespace: 1 }, { unique: true });

// Map nesnesini düzgün şekilde JSON'a dönüştür
LocalizationSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Map nesnesini standart objeye dönüştür
    if (ret.translations instanceof Map) {
      const translationsObj: Record<string, string> = {};
      ret.translations.forEach((value: string, key: string) => {
        translationsObj[key] = value;
      });
      ret.translations = translationsObj;
    }
    return ret;
  }
});

export default mongoose.model<ILocalization>('Localization', LocalizationSchema); 