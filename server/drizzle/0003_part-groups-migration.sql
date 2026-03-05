-- Drop old foreign key from parts.selected_option_id → options.id
ALTER TABLE "parts" DROP CONSTRAINT IF EXISTS "parts_selected_option_id_options_id_fk";
--> statement-breakpoint

-- Drop old options table (depends on parts via FK)
DROP TABLE IF EXISTS "options";
--> statement-breakpoint

-- Drop old parts table
DROP TABLE IF EXISTS "parts";
--> statement-breakpoint

-- Create part_groups table (replaces old parts)
CREATE TABLE "part_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"selected_option_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create new options table (simplified)
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_group_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create new parts table (leaf entity)
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"option_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"source" varchar(255),
	"link" text,
	"comment" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "part_groups" ADD CONSTRAINT "part_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "part_groups" ADD CONSTRAINT "part_groups_selected_option_id_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."options"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_part_group_id_part_groups_id_fk" FOREIGN KEY ("part_group_id") REFERENCES "public"."part_groups"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE cascade ON UPDATE no action;
