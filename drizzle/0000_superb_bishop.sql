CREATE TABLE "consultants" (
	"consultant_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"pwd" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "consultants_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "consulting_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consulting_id" uuid NOT NULL,
	"diagnosis" text,
	"ai_recommendations" jsonb,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consulting_sessions" (
	"consulting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"consultant_id" uuid NOT NULL,
	"visit_date" timestamp NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"consulting_id" uuid NOT NULL,
	"temp_daytime" integer,
	"temp_nighttime" integer,
	"humidity" integer,
	"co2_level" integer,
	"light_intensity" integer,
	"temp_outside" integer,
	"weather" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"farm_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"owner_name" text NOT NULL,
	"size" integer,
	"crop" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_management" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consulting_id" uuid NOT NULL,
	"electricity_cost" integer,
	"labor_cost" integer,
	"other_costs" integer,
	"notes" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_management" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"crop_image_url" text,
	"thinning_notes" text,
	"growth_stage" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "irrigation_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"feed_ec" integer,
	"feed_ph" integer,
	"drain_ec" integer,
	"drain_ph" integer,
	"moisture_content" integer,
	"feed_amount" integer,
	"drain_amount" integer,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consulting_id" uuid NOT NULL,
	"concerns" text,
	"questions" text,
	"feedback" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_management" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"ispest" boolean NOT NULL,
	"pest_type" text,
	"pest_image_url" text,
	"severity" text,
	"treatment" text,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "consulting_reports" ADD CONSTRAINT "consulting_reports_consulting_id_consulting_sessions_consulting_id_fk" FOREIGN KEY ("consulting_id") REFERENCES "public"."consulting_sessions"("consulting_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consulting_sessions" ADD CONSTRAINT "consulting_sessions_farm_id_farms_farm_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("farm_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consulting_sessions" ADD CONSTRAINT "consulting_sessions_consultant_id_consultants_consultant_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("consultant_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_data" ADD CONSTRAINT "environmental_data_farm_id_farms_farm_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("farm_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_data" ADD CONSTRAINT "environmental_data_consulting_id_consulting_sessions_consulting_id_fk" FOREIGN KEY ("consulting_id") REFERENCES "public"."consulting_sessions"("consulting_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_management" ADD CONSTRAINT "financial_management_consulting_id_consulting_sessions_consulting_id_fk" FOREIGN KEY ("consulting_id") REFERENCES "public"."consulting_sessions"("consulting_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_management" ADD CONSTRAINT "growth_management_farm_id_farms_farm_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("farm_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "irrigation_data" ADD CONSTRAINT "irrigation_data_farm_id_farms_farm_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("farm_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_interviews" ADD CONSTRAINT "owner_interviews_consulting_id_consulting_sessions_consulting_id_fk" FOREIGN KEY ("consulting_id") REFERENCES "public"."consulting_sessions"("consulting_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_management" ADD CONSTRAINT "pest_management_farm_id_farms_farm_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("farm_id") ON DELETE no action ON UPDATE no action;