import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class PaketLangganan {
  @Field(() => ID) id!: string;
  @Field(() => String) nama!: string;
  @Field(() => Float) harga!: number;
  @Field(() => Number) durasiBulan!: number;
  @Field(() => Number, { nullable: true }) maxSiswa?: number;
  @Field(() => Number, { nullable: true }) maxPelatih?: number;
  @Field(() => String, { nullable: true }) fitur?: string;
  @Field(() => Boolean, { defaultValue: true }) aktif!: boolean;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
  @Field(() => Date, { nullable: true }) updatedAt?: Date;
}

@ObjectType()
export class LanggananAkademi {
  @Field(() => ID) id!: string;
  @Field(() => String) akademiId!: string;
  @Field(() => String) paketId!: string;
  @Field(() => String) tanggalMulai!: string;
  @Field(() => String) tanggalBerakhir!: string;
  @Field(() => String, { defaultValue: 'aktif' }) status!: string;
  @Field(() => Boolean, { defaultValue: false }) autoRenew!: boolean;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
  @Field(() => Date, { nullable: true }) updatedAt?: Date;
}

@ObjectType()
export class SubscriptionPublic {
  @Field(() => ID) id!: string;
  @Field(() => String) akademiId!: string;
  @Field(() => String) plan!: string;
  @Field(() => String) status!: string;
  @Field(() => Date) startedAt!: Date;
  @Field(() => Date, { nullable: true }) expiresAt?: Date;
  @Field(() => Number) daysRemaining!: number;
  @Field(() => Boolean) isTrial!: boolean;
}
