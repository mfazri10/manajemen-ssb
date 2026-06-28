import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentAkademi = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    // Handling HTTP
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return request.akademiId;
    }
    // Handling GraphQL
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.akademiId;
  },
);
