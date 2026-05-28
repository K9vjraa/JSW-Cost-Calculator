import { Router } from "express";
import { asyncRoute, pageArgs } from "../utils/http.js";
import { prisma } from "../prisma/client.js";
import { notificationBus } from "../services/notifications.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const where = { OR: [{ userId: req.actor!.id }, { userId: null }] };
  const [total, data] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit })
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

notificationRoutes.patch("/:id/read", asyncRoute(async (req, res) => {
  const row = await prisma.notification.update({ where: { id: String(req.params.id) }, data: { readAt: new Date() } });
  res.json(row);
}));

notificationRoutes.get("/stream/live", asyncRoute(async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write(`event: ready\ndata: ${JSON.stringify({ userId: req.actor!.id })}\n\n`);
  const onNotification = (notification: any) => {
    if (!notification.userId || notification.userId === req.actor!.id) {
      res.write(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`);
    }
  };
  notificationBus.on("notification", onNotification);
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 20_000);
  req.on("close", () => {
    clearInterval(heartbeat);
    notificationBus.off("notification", onNotification);
  });
}));
