import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCardOrdersTable1784916000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'card_orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'shape', type: 'varchar', length: '20' },
          { name: 'color', type: 'varchar', length: '20', isNullable: true },
          { name: 'title', type: 'varchar', length: '100', isNullable: true },
          { name: 'subtitle', type: 'varchar', length: '150', isNullable: true },
          { name: 'image_url', type: 'text', isNullable: true },
          { name: 'quantity', type: 'int' },
          { name: 'unit_price', type: 'numeric', precision: 10, scale: 2 },
          { name: 'total_price', type: 'numeric', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10', default: `'USD'` },
          { name: 'status', type: 'varchar', length: '20', default: `'pending'` },
          { name: 'shipping_name', type: 'varchar', length: '150' },
          { name: 'shipping_address', type: 'text' },
          { name: 'shipping_city', type: 'varchar', length: '100' },
          { name: 'shipping_country', type: 'varchar', length: '100' },
          { name: 'shipping_phone', type: 'varchar', length: '50' },
          { name: 'provider', type: 'varchar', length: '20', default: `'mercadopago'` },
          { name: 'provider_preference_id', type: 'varchar', isNullable: true },
          { name: 'provider_payment_id', type: 'varchar', isNullable: true },
          { name: 'init_point', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'card_orders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('card_orders');
  }
}
