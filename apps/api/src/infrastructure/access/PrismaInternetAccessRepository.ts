import { InternetAccess, InternetAccessStatus } from "@domain";

import type { InternetAccessRepository } from "@application/ports/InternetAccessRepository.js";

import { prisma } from "@infrastructure/database/prisma.js";

export class PrismaInternetAccessRepository implements InternetAccessRepository {
  async findAll(): Promise<InternetAccess[]> {
    const records = await prisma.internetAccess.findMany();

    return records.map((record) =>
      InternetAccess.reconstitute({
        id: record.id,
        purchaseId: record.purchaseId,
        customerId: record.customerId,
        grantedAt: record.grantedAt,
        expiresAt: record.expiresAt,
        status: record.status as InternetAccessStatus,
        consumedMinutes: record.consumedMinutes,
      }),
    );
  }

  async save(access: InternetAccess): Promise<void> {
    await prisma.internetAccess.upsert({
      where: {
        id: access.id,
      },

      update: {
        purchaseId: access.purchaseId,
        customerId: access.customerId,
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        status: access.status,
        consumedMinutes: access.consumedMinutes,
        ...(access.usageSessionId === undefined
          ? {}
          : { usageSessionId: access.usageSessionId }),
        ...(access.usageRecordedThrough === undefined
          ? {}
          : { usageRecordedThrough: access.usageRecordedThrough }),
      },

      create: {
        id: access.id,
        purchaseId: access.purchaseId,
        customerId: access.customerId,
        grantedAt: access.grantedAt,
        expiresAt: access.expiresAt,
        status: access.status,
        consumedMinutes: access.consumedMinutes,
        ...(access.usageSessionId === undefined
          ? {}
          : { usageSessionId: access.usageSessionId }),
        ...(access.usageRecordedThrough === undefined
          ? {}
          : { usageRecordedThrough: access.usageRecordedThrough }),
      },
    });
  }

  async findByPurchaseId(purchaseId: string): Promise<InternetAccess | null> {
    const record = await prisma.internetAccess.findUnique({
      where: {
        purchaseId,
      },
    });

    if (record === null) {
      return null;
    }

    return InternetAccess.reconstitute({
      id: record.id,
      purchaseId: record.purchaseId,
      customerId: record.customerId,
      grantedAt: record.grantedAt,
      expiresAt: record.expiresAt,
      status: record.status as InternetAccessStatus,
      consumedMinutes: record.consumedMinutes,
      ...(record.usageSessionId === null
        ? {}
        : { usageSessionId: record.usageSessionId }),
      ...(record.usageRecordedThrough === null
        ? {}
        : { usageRecordedThrough: record.usageRecordedThrough }),
    });
  }

  async findByCustomerId(customerId: string): Promise<InternetAccess | null> {
    const record = await prisma.internetAccess.findFirst({
      where: {
        customerId,
      },
    });

    if (record === null) {
      return null;
    }

    return InternetAccess.reconstitute({
      id: record.id,
      purchaseId: record.purchaseId,
      customerId: record.customerId,
      grantedAt: record.grantedAt,
      expiresAt: record.expiresAt,
      status: record.status as InternetAccessStatus,
      consumedMinutes: record.consumedMinutes,
      ...(record.usageSessionId === null
        ? {}
        : { usageSessionId: record.usageSessionId }),
      ...(record.usageRecordedThrough === null
        ? {}
        : { usageRecordedThrough: record.usageRecordedThrough }),
    });
  }
}
