import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Match {
  @Field(() => ID) id!: string;
  @Field(() => String) turnamenId!: string;
  @Field(() => String, { nullable: true }) babak?: string;
  @Field(() => Int, { nullable: true }) matchNo?: number;
  @Field(() => String, { nullable: true }) tanggal?: string;
  @Field(() => String, { nullable: true }) waktu?: string;
  @Field(() => String, { nullable: true }) lokasi?: string;
  @Field(() => String, { nullable: true }) timHome?: string;
  @Field(() => String, { nullable: true }) timAway?: string;
  @Field(() => Int, { defaultValue: 0 }) skorHome!: number;
  @Field(() => Int, { defaultValue: 0 }) skorAway!: number;
  @Field(() => String, { defaultValue: 'belum' }) status!: string;
  @Field(() => String, { nullable: true }) catatan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class MatchLineup {
  @Field(() => ID) id!: string;
  @Field(() => String) matchId!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String, { nullable: true }) tim?: string;
  @Field(() => String, { nullable: true }) posisi?: string;
  @Field(() => String, { defaultValue: 'starter' }) status!: string;
  @Field(() => Int, { nullable: true }) menitMasuk?: number;
  @Field(() => Int, { nullable: true }) menitKeluar?: number;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class MatchEvent {
  @Field(() => ID) id!: string;
  @Field(() => String) matchId!: string;
  @Field(() => String, { nullable: true }) siswaId?: string;
  @Field(() => String) tipe!: string;
  @Field(() => Int, { nullable: true }) menit?: number;
  @Field(() => String, { nullable: true }) keterangan?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}

@ObjectType()
export class KlasemenEntry {
  @Field(() => String) tim!: string;
  @Field(() => Int) main!: number;
  @Field(() => Int) menang!: number;
  @Field(() => Int) seri!: number;
  @Field(() => Int) kalah!: number;
  @Field(() => Int) golMasuk!: number;
  @Field(() => Int) golKemasukan!: number;
  @Field(() => Int) selisihGol!: number;
  @Field(() => Int) poin!: number;
}
