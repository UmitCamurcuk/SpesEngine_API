import User from '../models/User';
import { JWTService } from '../utils/jwt';

export class TokenService {
  // Kullanıcının tüm token'larını geçersiz kıl (tokenVersion'ı artırarak)
  static async invalidateUserTokens(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { tokenVersion: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('Token invalidation hatası:', error);
      throw new Error('Token geçersiz kılamadı');
    }
  }

  // Kullanıcının izinleri değiştiğinde yeni token oluştur
  static async refreshUserToken(userId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      // Kullanıcıyı güncel izinleriyle birlikte getir
      const user = await User.findById(userId)
        .populate({
          path: 'role',
          populate: {
            path: 'permissionGroups',
            populate: [
              {
                path: 'permissionGroup',
                select: 'name code description'
              },
              {
                path: 'permissions.permission',
                select: 'name description code'
              }
            ]
          }
        });

      if (!user) {
        return null;
      }

      // İzinleri topla
      const permissions = await this.getUserPermissions(user);

      // Yeni token'lar oluştur
      const accessToken = JWTService.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: (user.role as any)?.name || 'user',
        permissions
      });

      const refreshToken = JWTService.generateRefreshToken({
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Token refresh hatası:', error);
      return null;
    }
  }

  // Kullanıcının izinlerini topla
  private static async getUserPermissions(user: any): Promise<string[]> {
    const permissions: string[] = [];
    
    if (user.isAdmin) {
      return ['*']; // Admin tüm izinlere sahip
    }
    
    if (user.role && user.role.permissionGroups) {
      for (const group of user.role.permissionGroups) {
        if (group.permissions) {
          for (const perm of group.permissions) {
            if (perm.granted && perm.permission && perm.permission.code) {
              permissions.push(perm.permission.code);
            }
          }
        }
      }
    }
    
    return permissions;
  }

  // Belirli kullanıcıların token'larını toplu geçersiz kıl
  static async invalidateMultipleUserTokens(userIds: string[]): Promise<void> {
    try {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $inc: { tokenVersion: 1 } }
      );
    } catch (error) {
      console.error('Toplu token invalidation hatası:', error);
      throw new Error('Token\'lar geçersiz kılamadı');
    }
  }

  // Kullanıcının token sürümünü kontrol et
  static async validateTokenVersion(userId: string, tokenVersion: number): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('tokenVersion');
      return user ? user.tokenVersion === tokenVersion : false;
    } catch (error) {
      console.error('Token version doğrulama hatası:', error);
      return false;
    }
  }
} 