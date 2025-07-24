import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Role from '../models/Role';
import { PermissionVersionService } from '../services/permissionVersionService';

// Tüm kullanıcıları getir
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .populate('role', 'name description')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users: users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilemedi',
      error: error.message
    });
  }
};

// Belirli bir role atanmış kullanıcıları getir
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;

    // Role'ün var olup olmadığını kontrol et
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
      return;
    }

    const users = await User.find({ role: roleId })
      .populate('role', 'name description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users,
      role: {
        _id: role._id,
        name: role.name,
        description: role.description
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Role kullanıcıları getirilemedi',
      error: error.message
    });
  }
};

// Belirli bir role atanmamış kullanıcıları getir
export const getUsersNotInRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;

    // Role'ün var olup olmadığını kontrol et
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
      return;
    }

    const users = await User.find({ 
      role: { $ne: roleId },
      isActive: true // Sadece aktif kullanıcıları göster
    })
      .populate('role', 'name description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users,
      role: {
        _id: role._id,
        name: role.name,
        description: role.description
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanılabilir kullanıcılar getirilemedi',
      error: error.message
    });
  }
};

// Kullanıcıya rol ata
export const assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { roleId, comment } = req.body;

    // Kullanıcıyı kontrol et
    const user = await User.findById(userId).populate('role');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    // Role'ü kontrol et
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
      return;
    }

    // Kullanıcının zaten bu role sahip olup olmadığını kontrol et
    if (user.role && user.role._id.toString() === roleId) {
      res.status(400).json({
        success: false,
        message: 'Kullanıcı zaten bu role sahip'
      });
      return;
    }

    const previousRole = user.role;

    // Kullanıcıya yeni rolü ata
    user.role = roleId;
    await user.save();

    // Güncellenen kullanıcıyı populate et
    await user.populate('role');

    // Kullanıcının permission version'ını güncelle
    try {
      await PermissionVersionService.invalidateUserPermissions(userId);
      console.log(`Permission version updated for user: ${userId}`);
    } catch (permissionError) {
      console.error('Permission version güncelleme hatası:', permissionError);
      // Permission version hatası ana işlemi durdurmaz
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcıya rol başarıyla atandı',
      user: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol atama işlemi başarısız',
      error: error.message
    });
  }
};

// Kullanıcıdan rol kaldır
export const removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, roleId } = req.params;
    const { comment } = req.body;

    // Kullanıcıyı kontrol et
    const user = await User.findById(userId).populate('role');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    // Kullanıcının bu role sahip olup olmadığını kontrol et
    if (!user.role || user.role._id.toString() !== roleId) {
      res.status(400).json({
        success: false,
        message: 'Kullanıcı bu role sahip değil'
      });
      return;
    }

    const previousRole = user.role;

    // Varsayılan bir rol bulalım (örneğin "User" rolü)
    const defaultRole = await Role.findOne({ name: 'User' });
    if (!defaultRole) {
      res.status(500).json({
        success: false,
        message: 'Varsayılan rol bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.'
      });
      return;
    }

    // Kullanıcıya varsayılan rolü ata
    user.role = defaultRole._id as any;
    await user.save();

    // Güncellenen kullanıcıyı populate et
    await user.populate('role');

    // Kullanıcının permission version'ını güncelle
    try {
      await PermissionVersionService.invalidateUserPermissions(userId);
      console.log(`Permission version updated for user: ${userId}`);
    } catch (permissionError) {
      console.error('Permission version güncelleme hatası:', permissionError);
      // Permission version hatası ana işlemi durdurmaz
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı rolü başarıyla kaldırıldı',
      user: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Rol kaldırma işlemi başarısız',
      error: error.message
    });
  }
};

// Tek bir kullanıcıyı getir
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilemedi',
      error: error.message
    });
  }
};

// Kullanıcı oluştur
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Kullanıcı oluşturulamadı',
      error: error.message
    });
  }
};

// Kullanıcı güncelle
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Kullanıcı güncellenemedi',
      error: error.message
    });
  }
};

// Kullanıcı sil
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi',
      error: error.message
    });
  }
}; 