import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { auth } from '../../config/better-auth.config';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req;

    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
    }

    try {
      // Validasi session Better Auth menggunakan headers
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Sesi tidak valid atau telah habis.');
      }

      // Simpan user dan userId ke request context
      req.user = session.user;
      req.userId = session.user.id;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Autentikasi gagal.');
    }
  }
}
