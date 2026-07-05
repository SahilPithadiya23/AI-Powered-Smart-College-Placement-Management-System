import { AuditLog } from '../models/AuditLog.js';

export const logActivity = async ({ req, actor, action, entity, entityId, metadata }) => {
  await AuditLog.create({
    actor,
    action,
    entity,
    entityId,
    ip: req?.ip,
    userAgent: req?.headers?.['user-agent'],
    metadata
  });
};
