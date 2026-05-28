import { EventEmitter } from "node:events";
import { prisma } from "../prisma/client.js";

export const notificationBus = new EventEmitter();
notificationBus.setMaxListeners(100);

export async function notify(input: {
  userId?: string;
  title: string;
  message: string;
  category: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}) {
  const notification = await prisma.notification.create({ data: input });
  notificationBus.emit("notification", notification);
  return notification;
}
