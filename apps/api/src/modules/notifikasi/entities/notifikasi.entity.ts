import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Notifikasi {
  @Field(() => ID) id!: string;
  @Field(() => String, { nullable: true }) penerimaUserId?: string;
  @Field(() => String) judul!: string;
  @Field(() => String) isi!: string;
  @Field(() => String, { defaultValue: 'info' }) tipe!: string;
  @Field(() => String, { defaultValue: 'semua' }) target!: string;
  @Field(() => String, { nullable: true }) siswaId?: string;
  @Field(() => Boolean, { defaultValue: false }) isRead!: boolean;
  @Field(() => String, { defaultValue: 'in_app' }) sentVia!: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
}
