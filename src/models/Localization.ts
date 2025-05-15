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
  timestamps: true
});

// Bileşik index oluştur (key ve namespace birlikte unique olmalı)
LocalizationSchema.index({ key: 1, namespace: 1 }, { unique: true });

export default mongoose.model<ILocalization>('Localization', LocalizationSchema); 