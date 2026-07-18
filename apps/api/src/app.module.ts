import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { join } from 'path';
import appConfig from './config/app.config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { MenuModule } from './modules/menu/menu.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { SiswaModule } from './modules/siswa/siswa.module';
import { OrangTuaModule } from './modules/orang-tua/orang-tua.module';
import { PelatihModule } from './modules/pelatih/pelatih.module';
import { JadwalModule } from './modules/jadwal/jadwal.module';
import { AbsensiModule } from './modules/absensi/absensi.module';
import { SppModule } from './modules/spp/spp.module';
import { KeuanganEvaluasiModule } from './modules/keuangan-evaluasi/keuangan-evaluasi.module';
import { Fase34Module } from './modules/fase-3-4/fase-3-4.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MatchModule } from './modules/match/match.module';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
import { MateriModule } from './modules/materi/materi.module';
import { SeleksiModule } from './modules/seleksi/seleksi.module';
import { LogPelatihModule } from './modules/log-pelatih/log-pelatih.module';
import { PendaftaranModule } from './modules/pendaftaran/pendaftaran.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { GorModule } from './modules/gor/gor.module';
import { LapanganModule } from './modules/lapangan/lapangan.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    ScheduleModule.forRoot(),
    // Hardening: rate limiting global (100 request / 60 detik per IP)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DrizzleModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Hardening: playground & introspection hanya di non-production
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    AuthModule,
    UserModule,
    RoleModule,
    MenuModule,
    TenantModule,
    MasterDataModule,
    SiswaModule,
    OrangTuaModule,
    PelatihModule,
    JadwalModule,
    AbsensiModule,
    SppModule,
    KeuanganEvaluasiModule,
    Fase34Module,
    DashboardModule,
    MatchModule,
    NotifikasiModule,
    MateriModule,
    SeleksiModule,
    LogPelatihModule,
    PendaftaranModule,
    SubscriptionModule,
    PaymentModule,
    AuditLogModule,
    GorModule,
    LapanganModule,
    OnboardingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    AppResolver,
    { provide: APP_FILTER, useClass: GraphQLExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
