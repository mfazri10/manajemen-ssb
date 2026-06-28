import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    
    // Custom error formatting
    return new GraphQLError(exception.message || 'Internal server error', {
      extensions: {
        code: exception.status || 'INTERNAL_SERVER_ERROR',
        status: exception.status || 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
