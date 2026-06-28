import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../config/better-auth.config';

@Controller('v1/auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    console.log('AUTH REQ URL:', req.url, 'PATH:', req.path);
    // Gunakan toNodeHandler adapter agar kompatibel dengan Express/NestJS middleware
    return toNodeHandler(auth)(req, res);
  }
}
