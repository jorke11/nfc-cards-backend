import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration.ts1772993500249 implements MigrationInterface {
    name = 'InitialMigration.ts1772993500249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile_views" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "viewed_at" TIMESTAMP NOT NULL DEFAULT now(), "ip_address" character varying(45), "user_agent" text, "referrer" text, "country" character varying(100), "device_type" character varying(50), CONSTRAINT "PK_d097089dc034d5c56a396ae2fd2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d85d9173ce50a329dad9eb3e6a" ON "profile_views" ("profile_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d766450cdbcf4474b6fc2f110" ON "profile_views" ("viewed_at") `);
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "username" character varying(50), "unique_id" character varying(20) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "photo_url" text, "job_title" character varying(150), "company" character varying(150), "bio" text, "phone" character varying(50), "phones" jsonb NOT NULL DEFAULT '[]', "email_public" character varying, "website" character varying, "social_links" jsonb NOT NULL DEFAULT '{}', "theme_settings" jsonb NOT NULL DEFAULT '{}', "is_enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d1ea35db5be7c08520d70dc03f8" UNIQUE ("username"), CONSTRAINT "UQ_28b0f2a13771bc20d42bb4a8f1b" UNIQUE ("unique_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d1ea35db5be7c08520d70dc03f" ON "profiles" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_28b0f2a13771bc20d42bb4a8f1" ON "profiles" ("unique_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "password_hash" character varying, "auth_provider" character varying NOT NULL DEFAULT 'local', "provider_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "verification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" character varying NOT NULL, "type" character varying(50) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b00b1be0e5a820594d7c07a3dfb" UNIQUE ("token"), CONSTRAINT "PK_f2d4d7a2aa57ef199e61567db22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31d2079dc4079b80517d31cf4f" ON "verification_tokens" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b00b1be0e5a820594d7c07a3df" ON "verification_tokens" ("token") `);
        await queryRunner.query(`ALTER TABLE "profile_views" ADD CONSTRAINT "FK_d85d9173ce50a329dad9eb3e6a0" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verification_tokens" ADD CONSTRAINT "FK_31d2079dc4079b80517d31cf4f2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_tokens" DROP CONSTRAINT "FK_31d2079dc4079b80517d31cf4f2"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`);
        await queryRunner.query(`ALTER TABLE "profile_views" DROP CONSTRAINT "FK_d85d9173ce50a329dad9eb3e6a0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b00b1be0e5a820594d7c07a3df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31d2079dc4079b80517d31cf4f"`);
        await queryRunner.query(`DROP TABLE "verification_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_28b0f2a13771bc20d42bb4a8f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d1ea35db5be7c08520d70dc03f"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d766450cdbcf4474b6fc2f110"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d85d9173ce50a329dad9eb3e6a"`);
        await queryRunner.query(`DROP TABLE "profile_views"`);
    }

}
