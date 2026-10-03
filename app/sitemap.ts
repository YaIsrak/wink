import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/theme`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  try {
    const users = await prisma.user.findMany({
      where: {
        onboardedAt: { not: null },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      take: 100,
    });

    const userProfileRoutes: MetadataRoute.Sitemap = users.map((u) => ({
      url: `${baseUrl}/profile/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...userProfileRoutes];
  } catch {
    return staticRoutes;
  }
}
