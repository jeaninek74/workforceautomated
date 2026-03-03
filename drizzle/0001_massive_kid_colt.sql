CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`description` text,
	`capabilities` json,
	`permissions` json,
	`systemPrompt` text,
	`confidenceThreshold` float DEFAULT 0.75,
	`riskThreshold` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('active','inactive','draft') DEFAULT 'draft',
	`sourceType` enum('job_description','manual') DEFAULT 'manual',
	`sourceJobDescription` text,
	`lastExecutedAt` timestamp,
	`totalExecutions` int DEFAULT 0,
	`avgConfidenceScore` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executionId` int,
	`agentId` int,
	`teamId` int,
	`action` varchar(255) NOT NULL,
	`category` enum('agent','team','execution','escalation','billing','auth','governance') NOT NULL,
	`details` json,
	`confidenceScore` float,
	`riskLevel` enum('low','medium','high','critical'),
	`ipAddress` varchar(64),
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int,
	`teamId` int,
	`type` enum('single','team') NOT NULL DEFAULT 'single',
	`status` enum('pending','running','completed','failed','escalated','canceled') NOT NULL DEFAULT 'pending',
	`input` text,
	`output` text,
	`confidenceScore` float,
	`riskLevel` enum('low','medium','high','critical'),
	`escalated` boolean DEFAULT false,
	`escalationReason` text,
	`escalationResolvedAt` timestamp,
	`escalationResolvedBy` int,
	`steps` json,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`durationMs` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governanceSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`globalConfidenceThreshold` float DEFAULT 0.75,
	`globalRiskThreshold` enum('low','medium','high','critical') DEFAULT 'medium',
	`autoEscalate` boolean DEFAULT true,
	`escalateOnRiskLevels` json,
	`requireHumanApproval` boolean DEFAULT false,
	`maxConcurrentExecutions` int DEFAULT 5,
	`retentionDays` int DEFAULT 90,
	`notifyOnEscalation` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governanceSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `governanceSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`stripePriceId` varchar(128),
	`plan` enum('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`agentId` int NOT NULL,
	`executionOrder` int DEFAULT 0,
	`role` enum('lead','member','reviewer') DEFAULT 'member',
	`inputMapping` json,
	`outputMapping` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`governanceMode` enum('sequential','parallel','conditional') DEFAULT 'sequential',
	`confidenceThreshold` float DEFAULT 0.75,
	`riskThreshold` enum('low','medium','high','critical') DEFAULT 'medium',
	`escalationPolicy` json,
	`status` enum('active','inactive','draft') DEFAULT 'draft',
	`totalExecutions` int DEFAULT 0,
	`avgConfidenceScore` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
