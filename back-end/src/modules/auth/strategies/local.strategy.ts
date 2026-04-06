import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true, // Pass the request object to the validate method
    });
  }

  async validate(req: any, username: string, password: string) {
    const deviceType = req.body.deviceType; // Extract deviceType from request body
    if (!deviceType) {
      return { message_error: 'deviceType is required' };
    }

    const user = await this.authService.validateUser({
      username,
      password,
      deviceType,
    });

    if (!user) {
      return { message_error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    }
    return user;
  }
}
