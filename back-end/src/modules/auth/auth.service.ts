import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async validateUser({ username, password, deviceType }: AuthPayloadDto) {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      return { message_error: 'ไม่พบ user' };
    }

    // ||!['พนักงาน', 'ผู้ดูแลระบบ', 'ไฟแนนซ์', 'admin-external'].includes(user.type,)

    if (user.deviceType !== deviceType) {
      return { message_error: 'device type mismatch' };
    }

    if (user.userGroup?.permissions?.length < 0 && deviceType == 'website') {
      return { message_error: 'miss permission' };
    }

    if (!user || user.active !== '1') {
      return { message_error: 'user deleted' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const {
        password,
        bookbank,
        bookname,
        bookno,
        firebaseToken,
        refreshToken,
        ...userData
      } = user;
      const permissions = userData.userGroup.permissions;
      delete userData.userGroup.permissions;
      userData.branch = {
        name: userData.branch.name,
        code: userData.branch.code,
        id: userData.branch.id,
        online: userData.branch.online,
        isCheckOcr: userData.branch.isCheckOcr,
      };

      if (deviceType === 'mobile') {
        delete userData.branch;
        delete userData.userGroup;
      }

      // กำหนดอายุของ token ตาม device type
      const accessTokenExpiresIn = deviceType === 'website' ? '40min' : '1y';
      const refreshTokenExpiresIn = deviceType === 'website' ? '7d' : '2y';

      const access_token = this.jwtService.sign(
        { ...userData, deviceType },
        { expiresIn: accessTokenExpiresIn },
      );

      const newRefreshToken = this.jwtService.sign(
        { ...userData, deviceType },
        { expiresIn: refreshTokenExpiresIn },
      );

      // เก็บ refresh token พร้อม device type
      await this.usersService.updateRefreshToken(user.id, {
        refreshToken: newRefreshToken,
      });

      return {
        access_token,
        refresh_token: newRefreshToken,
        permissions,
      };
    }
    return null;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      const { deviceType } = refreshTokenDto;

      const user = await this.usersService.findOneByUsername(payload.username);

      if (
        user.refreshToken !== refreshTokenDto.refreshToken ||
        user.deviceType !== deviceType
      ) {
        throw new UnauthorizedException(
          'Refresh token or device type mismatch',
        );
      }

      if (!user || user.active !== '1') {
        throw new UnauthorizedException('user deleted');
      }

      if (user.userGroup?.permissions?.length < 0 && deviceType === 'website') {
        throw new UnauthorizedException('miss permission');
      }

      if (user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('refresh token mismatch');
      }

      const {
        password,
        bookbank,
        bookname,
        bookno,
        firebaseToken,
        refreshToken,
        ...userData
      } = user;
      const permissions = userData.userGroup.permissions;
      delete userData.userGroup.permissions;
      userData.branch = {
        name: userData.branch.name,
        code: userData.branch.code,
        id: userData.branch.id,
        online: userData.branch.online,
        isCheckOcr: userData.branch.isCheckOcr,
      };

      if (deviceType === 'mobile') {
        delete userData.branch;
        delete userData.userGroup;
      }

      const accessTokenExpiresIn = deviceType === 'website' ? '40min' : '1y';
      const refreshTokenExpiresIn = deviceType === 'website' ? '7d' : '2y';

      const access_token = this.jwtService.sign(
        { ...userData, deviceType },
        { expiresIn: accessTokenExpiresIn },
      );

      const newRefreshToken = this.jwtService.sign(
        { ...userData, deviceType },
        { expiresIn: refreshTokenExpiresIn },
      );

      // เก็บ refresh token พร้อม device type
      await this.usersService.updateRefreshToken(user.id, {
        refreshToken: newRefreshToken,
      });

      return {
        access_token,
        refresh_token: newRefreshToken,
        permissions,
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw error;
    }
  }
}
