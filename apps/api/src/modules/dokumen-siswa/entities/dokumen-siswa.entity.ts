import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class DokumenSiswa {
  @Field(() => ID) id!: string;
  @Field(() => String) siswaId!: string;
  @Field(() => String) jenis!: string;
  @Field(() => String) fileUrl!: string;
  @Field(() => String, { nullable: true }) namaFile?: string;
  @Field(() => Date, { nullable: true }) uploadedAt?: Date;
}
