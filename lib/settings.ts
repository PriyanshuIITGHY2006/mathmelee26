import prisma from "@/lib/prisma";

export async function getRegistrationsOpen(): Promise<boolean> {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "registrations_open" },
  });
  // Default to open if setting doesn't exist yet
  return setting ? setting.value === "true" : true;
}

export async function setRegistrationsOpen(open: boolean): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: "registrations_open" },
    update: { value: open ? "true" : "false" },
    create: { key: "registrations_open", value: open ? "true" : "false" },
  });
}
