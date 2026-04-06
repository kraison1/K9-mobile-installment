// src/modules/auth/guards/jwt.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/users/users.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      throw new UnauthorizedException('Invalid JWT');
    }

    const requiredPermissions =
      this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) ||
      this.reflector.get<string[]>(PERMISSIONS_KEY, context.getClass());

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const groupId = user.userGroupId;
    if (!groupId) {
      throw new ForbiddenException('Group ID not found in user data');
    }

    let userPermissions: string[] = [];
    const cacheKey = `${this.configService.get<string>('REDIS_PERMISSION_KEY')}${groupId}`;
    // ลองดึงจาก Redis
    const cachedPermissions = await this.redisService.get(cacheKey);
    if (cachedPermissions) {
      userPermissions = JSON.parse(cachedPermissions);
    } else {
      const fullUser = await this.userService.findOneWithRelations({
        where: { id: user.id },
        relations: ['userGroup'],
      });

      if (!fullUser) {
        throw new ForbiddenException('User not found');
      }

      userPermissions = fullUser.userGroup?.permissions || [];
      // ถ้า Redis initialized (production) เก็บใน cache
      if (this.redisService.isInitialized()) {
        await this.redisService.set(
          cacheKey,
          JSON.stringify(userPermissions),
          3600,
        );
      }
    }

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
