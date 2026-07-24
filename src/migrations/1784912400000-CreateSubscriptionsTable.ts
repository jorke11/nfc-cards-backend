import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSubscriptionsTable1784912400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'plan_id', type: 'varchar', length: '50' },
          { name: 'provider', type: 'varchar', length: '20', default: `'mercadopago'` },
          { name: 'provider_subscription_id', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: `'pending'` },
          { name: 'init_point', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}
