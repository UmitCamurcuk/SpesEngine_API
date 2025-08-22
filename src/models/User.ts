import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  position?: string;
  department?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  isAdmin: boolean;
  isActive: boolean;
  lastLogin: Date;
  role: mongoose.Types.ObjectId;
  tokenVersion: number;
  permissionVersion: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  matchPassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Ad alanı zorunludur'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad alanı zorunludur'],
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
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Biyografi en fazla 500 karakter olabilir']
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'tr'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
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
  },
  permissionVersion: {
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