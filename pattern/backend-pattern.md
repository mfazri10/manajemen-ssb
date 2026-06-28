# Standar dan Pattern Backend NestJS + GraphQL (TypeScript)

Dokumen ini merangkum _best practices_, standar arsitektur, dan _pattern_ yang wajib diikuti saat mengembangkan API backend SaaS Sport Management menggunakan **NestJS**, **GraphQL (Code-First)**, dan **Better Auth**.

---

## 1. Arsitektur & Struktur Direktori

Gunakan struktur **modular berbasis fitur**. Setiap domain bisnis (misal: `siswa`, `pelatih`, `keuangan`) punya modulnya sendiri yang _self-contained_.

```text
apps/api/src/
├── main.ts                     # Entry point, bootstrap NestJS
├── app.module.ts               # Root module, import semua feature modules
│
├── common/                     # Kode bersama di seluruh modul
│   ├── decorators/             # Custom decorator (@CurrentUser, @Roles)
│   ├── guards/                 # AuthGuard, RolesGuard, TenantGuard
│   ├── filters/                # Exception filters (GraphQL error formatting)
│   ├── interceptors/           # Logging, transform response
│   └── scalars/                # Custom GraphQL scalars (Date, JSON)
│
├── config/                     # Konfigurasi aplikasi
│   ├── app.config.ts
│   ├── database.config.ts
│   └── auth.config.ts
│
├── database/                   # Setup koneksi database (Prisma)
│   ├── database.module.ts
│   └── database.service.ts
│
└── modules/                    # Feature modules — satu folder per domain
    ├── akademi/
    │   ├── akademi.module.ts
    │   ├── akademi.resolver.ts     # GraphQL resolver (query & mutation)
    │   ├── akademi.service.ts      # Business logic
    │   ├── akademi.repository.ts   # Database access layer
    │   ├── dto/
    │   │   ├── create-akademi.input.ts
    │   │   └── update-akademi.input.ts
    │   └── entities/
    │       └── akademi.entity.ts   # GraphQL Object Type (@ObjectType)
    │
    ├── siswa/                  # Manajemen data siswa/pemain
    ├── pelatih/                # Manajemen data pelatih
    ├── jadwal/                 # Jadwal latihan
    ├── absensi/                # Absensi digital
    ├── keuangan/               # SPP, kas, tabungan
    ├── evaluasi/               # Raport & evaluasi pemain
    ├── turnamen/               # Turnamen & pertandingan
    ├── pengumuman/             # Komunikasi & pengumuman
    ├── materi/                 # Materi latihan / kurikulum
    └── tes-fisik/              # Tes fisik pemain
```

**Aturan pokok:**
- Satu modul = satu domain bisnis
- Tidak ada logika bisnis di resolver
- Tidak ada query database langsung di service (gunakan repository)
- Tidak ada import silang antar feature modules tanpa melalui module exports

---

## 2. Pola Penulisan Module

Setiap fitur harus memiliki NestJS Module yang eksplisit mendefinisikan provider dan exports-nya.

```typescript
// modules/siswa/siswa.module.ts
import { Module } from '@nestjs/common';
import { SiswaResolver } from './siswa.resolver';
import { SiswaService } from './siswa.service';
import { SiswaRepository } from './siswa.repository';

@Module({
  providers: [SiswaResolver, SiswaService, SiswaRepository],
  exports: [SiswaService], // Ekspor hanya jika dibutuhkan modul lain
})
export class SiswaModule {}
```

---

## 3. Pola GraphQL Code-First

Gunakan pendekatan **Code-First** — schema GraphQL digenerate otomatis dari dekorasi TypeScript.

### 3a. Entity / Object Type

```typescript
// modules/siswa/entities/siswa.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum StatusSiswa {
  AKTIF = 'aktif',
  ALUMNI = 'alumni',
  NONAKTIF = 'nonaktif',
  PENDING = 'pending',
}

registerEnumType(StatusSiswa, { name: 'StatusSiswa' });

@ObjectType()
export class Siswa {
  @Field(() => ID)
  id: string;

  @Field()
  namaLengkap: string;

  @Field({ nullable: true })
  namaPanggilan?: string;

  @Field()
  tanggalLahir: Date;

  @Field(() => StatusSiswa)
  status: StatusSiswa;

  @Field({ nullable: true })
  posisi?: string;

  @Field()
  createdAt: Date;
}
```

### 3b. Input DTO (Data Transfer Object)

Selalu validasi input menggunakan `class-validator`. Jangan percaya data mentah dari client.

```typescript
// modules/siswa/dto/create-siswa.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsDateString, IsEmail } from 'class-validator';
import { StatusSiswa } from '../entities/siswa.entity';

@InputType()
export class CreateSiswaInput {
  @Field()
  @IsString()
  namaLengkap: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  namaPanggilan?: string;

  @Field()
  @IsDateString()
  tanggalLahir: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tempatLahir?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  posisiId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  kelompokUmurId?: string;

  @Field(() => StatusSiswa, { nullable: true })
  @IsOptional()
  @IsEnum(StatusSiswa)
  status?: StatusSiswa;
}
```

### 3c. Resolver

Resolver **hanya** bertanggung jawab menerima request GraphQL dan meneruskan ke Service. Tidak boleh ada logika bisnis di sini.

```typescript
// modules/siswa/siswa.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { Siswa } from './entities/siswa.entity';
import { CreateSiswaInput } from './dto/create-siswa.input';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TenantGuard } from '@/common/guards/tenant.guard';

@Resolver(() => Siswa)
@UseGuards(AuthGuard, TenantGuard)
export class SiswaResolver {
  constructor(private readonly siswaService: SiswaService) {}

  @Query(() => [Siswa], { name: 'siswaList' })
  getSiswaList(@CurrentUser() userId: string): Promise<Siswa[]> {
    return this.siswaService.findByAkademi(userId);
  }

  @Query(() => Siswa, { name: 'siswa', nullable: true })
  getSiswa(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() userId: string,
  ): Promise<Siswa | null> {
    return this.siswaService.findOne(id, userId);
  }

  @Mutation(() => Siswa)
  createSiswa(
    @Args('input') input: CreateSiswaInput,
    @CurrentUser() userId: string,
  ): Promise<Siswa> {
    return this.siswaService.create(input, userId);
  }

  @Mutation(() => Boolean)
  deleteSiswa(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() userId: string,
  ): Promise<boolean> {
    return this.siswaService.delete(id, userId);
  }
}
```

### 3d. Service (Business Logic)

```typescript
// modules/siswa/siswa.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SiswaRepository } from './siswa.repository';
import { CreateSiswaInput } from './dto/create-siswa.input';
import { Siswa } from './entities/siswa.entity';

@Injectable()
export class SiswaService {
  constructor(private readonly siswaRepository: SiswaRepository) {}

  async findByAkademi(userId: string): Promise<Siswa[]> {
    return this.siswaRepository.findByAkademi(userId);
  }

  async findOne(id: string, userId: string): Promise<Siswa | null> {
    const siswa = await this.siswaRepository.findById(id);
    if (!siswa) return null;

    // Pastikan user hanya bisa akses siswa di akademi miliknya
    if (siswa.akademiId !== (await this.getAkademiId(userId))) {
      throw new ForbiddenException('Akses ditolak.');
    }

    return siswa;
  }

  async create(input: CreateSiswaInput, userId: string): Promise<Siswa> {
    const akademiId = await this.getAkademiId(userId);
    return this.siswaRepository.create({ ...input, akademiId });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const siswa = await this.findOne(id, userId);
    if (!siswa) throw new NotFoundException('Siswa tidak ditemukan.');
    return this.siswaRepository.delete(id);
  }

  private async getAkademiId(userId: string): Promise<string> {
    // Logic untuk mendapatkan akademi_id dari user
    // Implementation depends on auth setup
    return '';
  }
}
```

### 3e. Repository (Data Access Layer)

Repository adalah **satu-satunya** tempat query database dilakukan. Ini memisahkan logika bisnis dari implementasi database.

```typescript
// modules/siswa/siswa.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Siswa } from './entities/siswa.entity';

@Injectable()
export class SiswaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAkademi(userId: string): Promise<Siswa[]> {
    return this.prisma.siswa.findMany({
      where: { akademiId: await this.getAkademiId(userId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Siswa | null> {
    return this.prisma.siswa.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<Siswa> & { akademiId: string }): Promise<Siswa> {
    return this.prisma.siswa.create({ data });
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.siswa.delete({ where: { id } });
    return true;
  }
}
```

---

## 4. Auth Guard & Current User Decorator

### Guard
```typescript
// common/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const userId = req.headers['x-user-id'] ?? req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Token tidak valid atau sesi telah habis.');
    }

    req.userId = userId;
    return true;
  }
}
```

### Tenant Guard (Multi-Tenant Isolation)
```typescript
// common/guards/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const akademiId = req.headers['x-akademi-id'] ?? req.user?.akademiId;
    if (!akademiId) {
      throw new ForbiddenException('Konteks akademi tidak ditemukan.');
    }

    req.akademiId = akademiId;
    return true;
  }
}
```

### Decorator
```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.userId;
  },
);

export const CurrentAkademi = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.akademiId;
  },
);
```

---

## 5. Error Handling

Selalu gunakan exception class bawaan NestJS. Jangan melempar `Error` mentah.

```typescript
// ❌ HINDARI
throw new Error('Siswa tidak ditemukan');

// ✅ GUNAKAN NestJS HTTP/GraphQL Exceptions
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

throw new NotFoundException('Siswa tidak ditemukan.');
throw new ForbiddenException('Anda tidak berhak mengakses data akademi ini.');
throw new BadRequestException('Input tidak valid: tanggal lahir harus format ISO date.');
```

---

## 6. Validasi Input dengan class-validator

Aktifkan `ValidationPipe` secara global di `main.ts` agar semua DTO tervalidasi otomatis:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip properti yang tidak ada di DTO
      forbidNonWhitelisted: true,
      transform: true,        // Auto-transform tipe data
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(3000);
}

bootstrap();
```

---

## 7. Standar Kebersihan TypeScript

- **Strict mode wajib** — `"strict": true` di `tsconfig.json`
- **Tidak boleh menggunakan `any`** — gunakan tipe eksplisit atau `unknown`
- **Interface untuk shape objek**, `type` untuk union/alias
- **Return type eksplisit** pada semua method service & repository
- **Readonly** untuk property yang tidak seharusnya diubah

```typescript
// ❌ HINDARI
async createSiswa(input: any): Promise<any> { ... }

// ✅ GUNAKAN
async createSiswa(input: CreateSiswaInput, userId: string): Promise<Siswa> { ... }
```

---

## 8. Naming Convention

| Elemen | Convention | Contoh |
|---|---|---|
| File | `kebab-case` | `jadwal-latihan.service.ts` |
| Class | `PascalCase` | `JadwalLatihanService` |
| Method | `camelCase` | `findByKelompokUmur` |
| Variable | `camelCase` | `activeSiswa` |
| GraphQL Query | `camelCase` | `siswaList`, `jadwalByKelompokUmur` |
| GraphQL Mutation | `camelCase` + verb | `createSiswa`, `updateEvaluasi` |
| GraphQL Type | `PascalCase` | `Siswa`, `Pelatih`, `Absensi` |
| GraphQL Input | `PascalCase` + `Input` | `CreateSiswaInput` |
| Database table | `snake_case` | `jadwal_latihan`, `tes_fisik` |
| Database column | `snake_case` | `siswa_id`, `kelompok_umur_id` |
| Env variable | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

---

## 9. Struktur Response Standar

Bungkus semua response dalam format konsisten menggunakan wrapper type:

```typescript
// common/types/paginated.type.ts
import { Type } from '@nestjs/common';
import { ObjectType, Field, Int } from '@nestjs/graphql';

export function PaginatedType<T>(ItemType: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedClass {
    @Field(() => [ItemType])
    items: T[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    page: number;

    @Field(() => Int)
    limit: number;

    @Field()
    hasNextPage: boolean;
  }
  return PaginatedClass;
}

// Contoh penggunaan:
@ObjectType()
export class PaginatedSiswa extends PaginatedType(Siswa) {}
```

---

## 10. Testing

Setiap service **wajib** memiliki unit test. Gunakan mock untuk repository.

```typescript
// modules/siswa/siswa.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SiswaService } from './siswa.service';
import { SiswaRepository } from './siswa.repository';
import { NotFoundException } from '@nestjs/common';

const mockRepository = {
  findByAkademi: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('SiswaService', () => {
  let service: SiswaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiswaService,
        { provide: SiswaRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SiswaService>(SiswaService);
  });

  it('should throw NotFoundException when siswa not found', async () => {
    mockRepository.findById.mockResolvedValue(null);
    await expect(service.delete('nonexistent', 'userId')).rejects.toThrow(NotFoundException);
  });
});
```

---

## 11. Ringkasan: Tanggung Jawab Setiap Layer

| Layer | File | Tanggung Jawab |
|---|---|---|
| **Resolver** | `*.resolver.ts` | Terima GraphQL request, validasi auth, teruskan ke Service |
| **Service** | `*.service.ts` | Business logic, aturan bisnis, orkestrasi |
| **Repository** | `*.repository.ts` | Query & mutasi database — **hanya di sini** |
| **Entity** | `entities/*.entity.ts` | Definisi GraphQL Object Type |
| **DTO/Input** | `dto/*.input.ts` | Validasi & definisi input dari client |
| **Guard** | `common/guards/` | Autentikasi, otorisasi, & isolasi tenant |
| **Module** | `*.module.ts` | Wiring dependency injection |

---

*Pattern ini berlaku untuk semua modul di `apps/api`. Setiap penambahan fitur baru wajib mengikuti struktur Resolver → Service → Repository.*

---

## 12. API Versioning & Route Prefixing

Semua endpoint HTTP REST API wajib menggunakan prefix versi `v1/` pada route path-nya. 

- **Aturan**: Gunakan `@Controller('v1/nama-route')` pada setiap REST controller.
- **Contoh**:
  - `v1/auth` untuk endpoint autentikasi: `@Controller('v1/auth')`
  - `v1/siswa` untuk REST endpoint siswa: `@Controller('v1/siswa')`
  - `v1/pelatih` untuk REST endpoint pelatih: `@Controller('v1/pelatih')`

