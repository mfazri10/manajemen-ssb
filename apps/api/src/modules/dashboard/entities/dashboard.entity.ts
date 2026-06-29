import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class DashboardSummary {
  @Field(() => Int) totalSiswa!: number;
  @Field(() => Int) totalPelatih!: number;
  @Field(() => Int) totalJadwal!: number;
  @Field(() => Int) totalTagihanBelum!: number;
  @Field(() => Float) totalPemasukan!: number;
  @Field(() => Float) totalPengeluaran!: number;
  @Field(() => Float) saldoKas!: number;
  @Field(() => Float) totalTabungan!: number;
  @Field(() => Int) siswaAktif!: number;
  @Field(() => Int) siswaAlumni!: number;
}
