import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class OrangTua {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  siswaId!: string;

  @Field(() => String)
  namaOrangTua!: string;

  @Field(() => String)
  hpOrangTua!: string;

  @Field(() => String, { nullable: true })
  hpAyah?: string;

  @Field(() => String, { nullable: true })
  hpIbu?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  hubungan?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
