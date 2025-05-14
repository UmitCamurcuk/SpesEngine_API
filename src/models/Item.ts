import mongoose, { Schema, Document } from 'mongoose';
import { IItemType } from './ItemType';
import { IFamily } from './Family';
import { ICategory } from './Category';

export interface IItem extends Document {
  name: string;
  code: string;
  itemType: IItemType['_id'] | IItemType;
  family: IFamily['_id'] | IFamily;
  category: ICategory['_id'] | ICategory;
  attributes: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Ad alanı zorunludur'],
      trim: true,
      maxlength: [100, 'Ad alanı en fazla 100 karakter olabilir']
    },
    code: {
      type: String,
      required: [true, 'Kod alanı zorunludur'],
      trim: true,
      unique: true,
      maxlength: [20, 'Kod alanı en fazla 20 karakter olabilir']
    },
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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Attributes alanını düz bir obje olarak döndür
ItemSchema.methods.toJSON = function () {
  const item = this.toObject();
  if (item.attributes && item.attributes instanceof Map) {
    item.attributes = Object.fromEntries(item.attributes);
  } else if (!item.attributes) {
    item.attributes = {};
  }
  return item;
};

// Öğe oluşturulurken veya güncellenirken attributes Map olarak ayarla
ItemSchema.pre('save', function (next) {
  if (this.attributes && typeof this.attributes === 'object' && !(this.attributes instanceof Map)) {
    this.attributes = new Map(Object.entries(this.attributes as Record<string, any>));
  }
  next();
});

// Öğe toplu güncelleme işlemleri için attributes Map olarak ayarla
ItemSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  if (update && update.attributes && typeof update.attributes === 'object' && !(update.attributes instanceof Map)) {
    update.attributes = new Map(Object.entries(update.attributes as Record<string, any>));
  }
  next();
});

export default mongoose.model<IItem>('Item', ItemSchema); 