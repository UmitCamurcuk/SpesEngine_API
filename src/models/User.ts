import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isActive: boolean;
  lastLogin: Date;
  role: mongoose.Types.ObjectId;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Şifre karşılaştırma metodu
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Şifre karşılaştırma metodu (alternatif isim)
UserSchema.methods.matchPassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT token oluşturma metodu
UserSchema.methods.getSignedJwtToken = function(): string {
  const payload = { id: this._id };
  const secret = process.env.JWT_SECRET || 'gizlianahtar';
  const expire = process.env.JWT_EXPIRE || '30d';
  
  // @ts-ignore - jsonwebtoken türleri ile ilgili sorun çözümü
  return jwt.sign(payload, secret, { expiresIn: expire });
};

// Kaydetmeden önce şifreyi hash'le
UserSchema.pre('save', async function(next) {
  // Eğer şifre değişmediyse devam et
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const password = this.password as string;
    this.password = await bcrypt.hash(password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.model<IUser>('User', UserSchema); 