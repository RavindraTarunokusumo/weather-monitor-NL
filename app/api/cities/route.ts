import { prisma } from "@/lib/db";

export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      countryCode: true,
      latitude: true,
      longitude: true,
      timezone: true,
    },
  });

  return Response.json({ cities });
}
