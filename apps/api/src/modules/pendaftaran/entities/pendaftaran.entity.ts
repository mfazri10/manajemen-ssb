import { ObjectType, Field, ID } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';

export enum StatusPendaftaran {
  PENDING = 'pending',
  DISAPPROVED = 'disapproved',
  LUNAS = 'lunas',
  CATATAN = 'catatan',
}

registerEnumType(StatusPendaftaran, { name: 'StatusPendaftaran' });

@ObjectType()
export class Pendaftaran {
  @Field(() => ID) id!: string;
  @Field(() => String) akademiId!: string;
  @Field(() => String) namaLengkap!: string;
  @Field(() => String, { nullable: true }) tempatLahir?: string;
  @Field(() => String, { nullable: true }) tglLahir?: string;
  @Field(() => String, { nullable: true }) jenisKelamin?: string;
  @Field(() => String, { nullable: true }) alamat?: string;
  @Field(() => String, { nullable: true }) namaOrangTua?: string;
  @Field(() => String, { nullable: true }) noHpOrangTua?: string;
  @Field(() => String, { nullable: true }) email?: string;
  @Field(() => String, { nullable: true }) kelompokUmurId?: string;
  @Field(() => String, { nullable: true }) posisiId?: string;
  @Field(() => String, { defaultValue: 'pending' }) status!: string;
  @Field(() => String, { nullable: true }) fotoUrl?: string;
  @Field(() => String, { nullable: true }) dokumenUrl?: string;
  @Field(() => Date, { nullable: true }) createdAt?: Date;
  @Field(() => Date, { nullable: true }) updatedAt?: Date;
}
