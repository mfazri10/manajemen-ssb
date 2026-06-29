import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class LogPelatih {
  @Field(() => ID) id!: string;
  @Field(() => String) pelatihId!: string;
  @Field(() => String, { nullable: true }) jadwalId?: string;
  @Field(() => String) tanggal!: string;
  @Field(() => String) kegiatan!: string;
  @Field(() => String, { nullable: true }) materiId?: string;
  @Field(() => String, { nullable: true }) catatan?: string;
  @Field(() => Int, { nullable: true }) durasiMenit?: number;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
