import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'nestjs-prisma';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { CeacModule } from './modules/ceac/ceac.module';
import { B3xModule } from './modules/b3x/b3x.module';

@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Prisma ORM
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [],
      },
    }),
    
    // Módulos da aplicação
    AuthModule,
    UsuariosModule,
    FinanceiroModule,
    CeacModule,
    B3xModule,
  ],
  providers: [
    // Guard JWT global (exceto rotas públicas)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
