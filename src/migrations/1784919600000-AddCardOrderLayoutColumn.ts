import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCardOrderLayoutColumn1784919600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'card_orders',
      new TableColumn({
        name: 'layout',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('card_orders', 'layout');
  }
}
