import User, { IUser } from '../models/User';
import Role from '../models/Role';

export class PermissionVersionService {
  
  // Kullanıcının izinleri değiştiğinde permission version'ını artır
  static async invalidateUserPermissions(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { 
        $inc: { permissionVersion: 1 } 
      });
      console.log(`Permission version updated for user: ${userId}`);
    } catch (error) {
      console.error('Permission version update error:', error);
      throw error;
    }
  }

  // Rol değiştiğinde o role sahip tüm kullanıcıların izinlerini invalidate et
  static async invalidateRolePermissions(roleId: string): Promise<void> {
    try {
      await User.updateMany(
        { role: roleId }, 
        { $inc: { permissionVersion: 1 } }
      );
      console.log(`Permission versions updated for all users with role: ${roleId}`);
    } catch (error) {
      console.error('Role permission version update error:', error);
      throw error;
    }
  }

  // Kullanıcının güncel permission version'ını al
  static async getUserPermissionVersion(userId: string): Promise<number> {
    try {
      const user = await User.findById(userId).select('permissionVersion');
      return user?.permissionVersion || 0;
    } catch (error) {
      console.error('Get user permission version error:', error);
      return 0;
    }
  }

  // Token'daki permission version ile DB'deki karşılaştır
  static async isPermissionVersionValid(userId: string, tokenPermissionVersion: number): Promise<boolean> {
    try {
      const currentVersion = await this.getUserPermissionVersion(userId);
      return currentVersion === tokenPermissionVersion;
    } catch (error) {
      console.error('Permission version validation error:', error);
      return false;
    }
  }

  // Kullanıcının güncel permission version'ı ile yeni response header bilgisi
  static async getPermissionVersionHeader(userId: string): Promise<{ [key: string]: string }> {
    try {
      const version = await this.getUserPermissionVersion(userId);
      return {
        'X-Permission-Version': version.toString(),
        'X-Permission-Check-Required': 'false'
      };
    } catch (error) {
      console.error('Get permission version header error:', error);
      return {
        'X-Permission-Version': '0',
        'X-Permission-Check-Required': 'true'
      };
    }
  }

  // Birden fazla kullanıcının izinlerini invalidate et
  static async invalidateMultipleUsersPermissions(userIds: string[]): Promise<void> {
    try {
      await User.updateMany(
        { _id: { $in: userIds } }, 
        { $inc: { permissionVersion: 1 } }
      );
      console.log(`Permission versions updated for ${userIds.length} users`);
    } catch (error) {
      console.error('Multiple users permission version update error:', error);
      throw error;
    }
  }

  // Global permission invalidation (tüm kullanıcılar)
  static async invalidateAllPermissions(): Promise<void> {
    try {
      await User.updateMany({}, { $inc: { permissionVersion: 1 } });
      console.log('Permission versions updated for all users');
    } catch (error) {
      console.error('Global permission version update error:', error);
      throw error;
    }
  }
} 