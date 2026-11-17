CREATE TYPE "public"."assignment_status" AS ENUM('pending', 'answered', 'expired', 'declined');--> statement-breakpoint
CREATE TYPE "public"."budget" AS ENUM('low', 'mid', 'high');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('question_assigned', 'question_reassigned', 'answer_received', 'new_question', 'assignment_expired', 'answer_rated');--> statement-breakpoint
CREATE TYPE "public"."person_color" AS ENUM('kobalt', 'safran', 'yosun', 'erik', 'deniz');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'assigned', 'answered', 'open_pool');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'wrong_info', 'rude', 'personal_info', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('user', 'answer');--> statement-breakpoint
CREATE TYPE "public"."system_message_kind" AS ENUM('assigned', 'reassigned', 'open_pool', 'answered');--> statement-breakpoint
CREATE TYPE "public"."topic" AS ENUM('hidden_gem', 'local_food', 'budget', 'route', 'nightlife', 'safe_places');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"local_id" text NOT NULL,
	"text" text NOT NULL,
	"template_id" text,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"local_id" text NOT NULL,
	"attempt" integer NOT NULL,
	"assigned_at" timestamp with time zone NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"status" "assignment_status" DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blocks_blocker_id_blocked_id_pk" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"actor_id" text,
	"question_id" text NOT NULL,
	"text" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"tourist_id" text NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"text" text NOT NULL,
	"topic" "topic" NOT NULL,
	"budget" "budget" NOT NULL,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"current_assignment_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pooled_at" timestamp with time zone,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('turkish', "questions"."text")) STORED
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" text PRIMARY KEY NOT NULL,
	"answer_id" text NOT NULL,
	"tourist_id" text NOT NULL,
	"useful" boolean,
	"up_to_date" boolean,
	"trustworthy" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" "report_target" NOT NULL,
	"target_id" text NOT NULL,
	"reason" "report_reason" NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"kind" "system_message_kind" NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"color" "person_color" NOT NULL,
	"home_city" text NOT NULL,
	"home_district" text,
	"interests" "topic"[] DEFAULT '{}' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"daily_limit" smallint DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_local_id_users_id_fk" FOREIGN KEY ("local_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_local_id_users_id_fk" FOREIGN KEY ("local_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_tourist_id_users_id_fk" FOREIGN KEY ("tourist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_answer_id_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_tourist_id_users_id_fk" FOREIGN KEY ("tourist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_messages" ADD CONSTRAINT "system_messages_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answers_question_uq" ON "answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "answers_local_idx" ON "answers" USING btree ("local_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "answers_archived_idx" ON "answers" USING btree ("question_id") WHERE "answers"."archived";--> statement-breakpoint
CREATE INDEX "assignments_pending_deadline_idx" ON "assignments" USING btree ("deadline") WHERE "assignments"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "assignments_local_assigned_idx" ON "assignments" USING btree ("local_id","assigned_at");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_question_attempt_uq" ON "assignments" USING btree ("question_id","attempt");--> statement-breakpoint
CREATE UNIQUE INDEX "assignments_one_pending_uq" ON "assignments" USING btree ("question_id") WHERE "assignments"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "blocks_blocked_idx" ON "blocks" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "questions_tourist_idx" ON "questions" USING btree ("tourist_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "questions_pool_idx" ON "questions" USING btree ("city","pooled_at") WHERE "questions"."status" = 'open_pool';--> statement-breakpoint
CREATE INDEX "questions_search_gin" ON "questions" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_answer_tourist_uq" ON "ratings" USING btree ("answer_id","tourist_id");--> statement-breakpoint
CREATE INDEX "reports_open_idx" ON "reports" USING btree ("created_at") WHERE "reports"."status" = 'open';--> statement-breakpoint
CREATE INDEX "system_messages_question_idx" ON "system_messages" USING btree ("question_id","created_at");--> statement-breakpoint
CREATE INDEX "users_home_city_idx" ON "users" USING btree ("home_city");--> statement-breakpoint
CREATE INDEX "users_interests_gin" ON "users" USING gin ("interests");