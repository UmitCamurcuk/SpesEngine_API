import mongoose, { Schema, Document } from 'mongoose';
import { IItemType } from './ItemType';
import { IFamily } from './Family';
import { ICategory } from './Category';
import { IUser } from './User';

// Association değerleri için interface
export interface IItemAssociations {
  [associationKey: string]: string | string[]; // ObjectId veya ObjectId array
}

export interface IItem extends Document {
  itemType: IItemType['_id'] | IItemType;
  family: IFamily['_id'] | IFamily;
  category: ICategory['_id'] | ICategory;
  attributes: Record<string, any>;
  associations?: IItemAssociations; // YENİ: İlişkili item'ların ID'leri
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: IUser['_id'] | IUser;
  updatedBy: IUser['_id'] | IUser;
}

const ItemSchema: Schema = new Schema(
  {
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemType',
      required: [true, 'Öğe tipi seçilmelidir']
    },
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: [true, 'Aile seçilmelidir']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori seçilmelidir']
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
    associations: {
      type: Map,
      of: Schema.Types.Mixed, // Hem tek ID hem de array kabul edebilsin
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Oluşturan kullanıcı belirtilmelidir']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Güncelleyen kullanıcı belirtilmelidir']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // İndexleme stratejisi
    indexes: [
      { itemType: 1, isActive: 1 }, // ItemType'a göre aktif item'lar
      { family: 1, isActive: 1 },   // Family'e göre aktif item'lar
      { category: 1, isActive: 1 }, // Category'e göre aktif item'lar
      { 'associations': 1 },        // Association değerlerine göre arama
      { createdAt: -1 },           // Son oluşturulan item'lar
      { updatedAt: -1 }            // Son güncellenen item'lar
    ]
  }
);

// Attributes ve associations alanlarını düz obje olarak döndür
ItemSchema.methods.toJSON = function () {
  const item = this.toObject();
  
  // Attributes'ı düz obje yap
  if (item.attributes && item.attributes instanceof Map) {
    item.attributes = Object.fromEntries(item.attributes);
  } else if (!item.attributes) {
    item.attributes = {};
  }
  
  // Associations'ı düz obje yap
  if (item.associations && item.associations instanceof Map) {
    item.associations = Object.fromEntries(item.associations);
  } else if (!item.associations) {
    item.associations = {};
  }
  
  return item;
};

// Öğe oluşturulurken veya güncellenirken attributes ve associations Map olarak ayarla
ItemSchema.pre('save', function (next) {
  // Attributes Map'e çevir
  if (this.attributes && typeof this.attributes === 'object' && !(this.attributes instanceof Map)) {
    this.attributes = new Map(Object.entries(this.attributes as Record<string, any>));
  }
  
  // Associations Map'e çevir
  if (this.associations && typeof this.associations === 'object' && !(this.associations instanceof Map)) {
    this.associations = new Map(Object.entries(this.associations as Record<string, any>));
  }
  
  next();
});

// Öğe toplu güncelleme işlemleri için attributes ve associations Map olarak ayarla
ItemSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  
  // Attributes Map'e çevir
  if (update && update.attributes && typeof update.attributes === 'object' && !(update.attributes instanceof Map)) {
    update.attributes = new Map(Object.entries(update.attributes as Record<string, any>));
  }
  
  // Associations Map'e çevir
  if (update && update.associations && typeof update.associations === 'object' && !(update.associations instanceof Map)) {
    update.associations = new Map(Object.entries(update.associations as Record<string, any>));
  }
  
  next();
});

export default mongoose.model<IItem>('Item', ItemSchema); 