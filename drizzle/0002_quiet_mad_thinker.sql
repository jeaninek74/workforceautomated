ALTER TABLE `agents` MODIFY COLUMN `capabilities` json;--> statement-breakpoint
ALTER TABLE `agents` MODIFY COLUMN `permissions` json;--> statement-breakpoint
ALTER TABLE `auditLogs` MODIFY COLUMN `details` json;--> statement-breakpoint
ALTER TABLE `executions` MODIFY COLUMN `steps` json;--> statement-breakpoint
ALTER TABLE `governanceSettings` MODIFY COLUMN `escalateOnRiskLevels` json;--> statement-breakpoint
ALTER TABLE `teamMembers` MODIFY COLUMN `inputMapping` json;--> statement-breakpoint
ALTER TABLE `teamMembers` MODIFY COLUMN `outputMapping` json;--> statement-breakpoint
ALTER TABLE `teams` MODIFY COLUMN `escalationPolicy` json;