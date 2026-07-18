import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { userAkademis, akademi, userOnboardingSurvey } from '@workspace/db';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly dbService: DrizzleService) {}

  async saveSurvey(userId: string, productType: string, rawAnswers?: any) {
    const db = this.dbService.db;
    const [existing] = await db
      .select()
      .from(userOnboardingSurvey)
      .where(eq(userOnboardingSurvey.userId, userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(userOnboardingSurvey)
        .set({
          productType,
          rawAnswers,
          isCompleted: true,
          completedAt: new Date(),
        })
        .where(eq(userOnboardingSurvey.userId, userId))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(userOnboardingSurvey)
      .values({
        userId,
        productType,
        rawAnswers,
        isCompleted: true,
        completedAt: new Date(),
      })
      .returning();
    return inserted;
  }

  async getSurvey(userId: string) {
    const [survey] = await this.dbService.db
      .select()
      .from(userOnboardingSurvey)
      .where(eq(userOnboardingSurvey.userId, userId))
      .limit(1);
    return survey || null;
  }

  async getProgress(userId: string) {
    const db = this.dbService.db;

    // 1. Get default academy
    const [ua] = await db
      .select({
        akademiId: userAkademis.akademiId,
        slug: akademi.slug,
        type: akademi.type,
      })
      .from(userAkademis)
      .innerJoin(akademi, eq(userAkademis.akademiId, akademi.id))
      .where(and(eq(userAkademis.userId, userId), eq(userAkademis.isDefault, true)))
      .limit(1);

    const steps = [
      { step: 'register', completed: true },
      { step: 'survey', completed: false },
      { step: 'academy', completed: false },
      { step: 'siswa', completed: false },
      { step: 'jadwal', completed: false },
      { step: 'spp', completed: false },
    ];

    // Check survey completion
    const [survey] = await db
      .select()
      .from(userOnboardingSurvey)
      .where(eq(userOnboardingSurvey.userId, userId))
      .limit(1);

    if (survey?.isCompleted) {
      steps[1]!.completed = true;
    }

    if (!ua) {
      return steps;
    }

    steps[2]!.completed = true; // Academy registered

    const schemaName = `tenant_${ua.slug}`;
    const productType = ua.type.toLowerCase();

    try {
      if (productType === 'gor' || productType.startsWith('venue_') || ['futsal', 'badminton'].includes(productType)) {
        // GOR / Venue model
        // - Step 4: 'siswa' -> check if pelanggan has records
        const custCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.pelanggan`) as any;
        if (Number(custCount[0]?.count || 0) > 0) {
          steps[3]!.completed = true;
        }

        // - Step 5: 'jadwal' -> check if lapangan has records
        const courtCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.lapangan`) as any;
        if (Number(courtCount[0]?.count || 0) > 0) {
          steps[4]!.completed = true;
        }

        // - Step 6: 'spp' -> check if booking has records
        const bookingCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.booking`) as any;
        if (Number(bookingCount[0]?.count || 0) > 0) {
          steps[5]!.completed = true;
        }

      } else if (['gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'zumba', 'muaythai_mma', 'dance_studio', 'functional', 'senam_aerobik', 'calisthenics', 'renang_dewasa'].includes(productType)) {
        // Gym / Fitness model
        // - Step 4: 'siswa' -> check if member has records
        const memberCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.member`) as any;
        if (Number(memberCount[0]?.count || 0) > 0) {
          steps[3]!.completed = true;
        }

        // - Step 5: 'jadwal' -> check if kelas has records
        const kelasCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.kelas`) as any;
        if (Number(kelasCount[0]?.count || 0) > 0) {
          steps[4]!.completed = true;
        }

        // - Step 6: 'spp' -> check if membership_member has records
        const membershipCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.membership_member`) as any;
        if (Number(membershipCount[0]?.count || 0) > 0) {
          steps[5]!.completed = true;
        }

      } else {
        // Akademi model
        // - Step 4: 'siswa' -> check if siswa has records
        const siswaCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.siswa`) as any;
        if (Number(siswaCount[0]?.count || 0) > 0) {
          steps[3]!.completed = true;
        }

        // - Step 5: 'jadwal' -> check if jadwal_latihan has records
        const jadwalCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.jadwal_latihan`) as any;
        if (Number(jadwalCount[0]?.count || 0) > 0) {
          steps[4]!.completed = true;
        }

        // - Step 6: 'spp' -> check if spp_tagihan has records
        const sppCount = await db.execute(sql`SELECT count(*) FROM ${sql.identifier(schemaName)}.spp_tagihan`) as any;
        if (Number(sppCount[0]?.count || 0) > 0) {
          steps[5]!.completed = true;
        }
      }
    } catch (err) {
      this.logger.error(`Error querying tenant progress for schema ${schemaName}:`, err);
    }

    return steps;
  }
}
