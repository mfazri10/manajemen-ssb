import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Affiliate {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  kodeReferral!: string;

  @Field({ nullable: true })
  namaBank?: string;

  @Field({ nullable: true })
  nomorRekening?: string;

  @Field({ nullable: true })
  atasNama?: string;

  @Field()
  status!: string;

  @Field(() => Float)
  totalKomisiPending!: number;

  @Field(() => Float)
  totalKomisiDisetujui!: number;

  @Field(() => Float)
  totalKomisiCair!: number;

  @Field(() => Float)
  saldoAktif!: number;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class AffiliateStats {
  @Field(() => Int)
  totalKlik!: number;

  @Field(() => Int)
  totalReferral!: number;

  @Field(() => Float)
  totalKomisiPending!: number;

  @Field(() => Float)
  totalKomisiDisetujui!: number;

  @Field(() => Float)
  totalKomisiCair!: number;

  @Field(() => Float)
  saldoAktif!: number;
}

@ObjectType()
export class AffiliateReferral {
  @Field(() => ID)
  id!: string;

  @Field()
  affiliateId!: string;

  @Field({ nullable: true })
  linkId?: string;

  @Field({ nullable: true })
  visitId?: string;

  @Field()
  akademiId!: string;

  @Field(() => Float)
  paymentAmount!: number;

  @Field(() => Int)
  paymentBulanKe!: number;

  @Field(() => Float)
  komisiFlat!: number;

  @Field(() => Float)
  komisiPctEarned!: number;

  @Field(() => Float)
  komisiTotal!: number;

  @Field()
  status!: string;

  @Field({ nullable: true })
  catatan?: string;

  @Field({ nullable: true })
  conversionAt?: Date;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class AffiliateLink {
  @Field(() => ID)
  id!: string;

  @Field()
  affiliateId!: string;

  @Field()
  nama!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  utmCampaign?: string;

  @Field(() => Int)
  totalKlik!: number;

  @Field(() => Int)
  totalKonversi!: number;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class AffiliatePayout {
  @Field(() => ID)
  id!: string;

  @Field()
  affiliateId!: string;

  @Field(() => Float)
  jumlah!: number;

  @Field()
  metode!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  buktiTransfer?: string;

  @Field({ nullable: true })
  referensiBiaya?: string;

  @Field({ nullable: true })
  catatan?: string;

  @Field({ nullable: true })
  requestedAt?: Date;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field({ nullable: true })
  paidAt?: Date;
}
