import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserRoleAndSubscriptionNextPaymentDate1784923200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        length: '20',
        default: `'user'`,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'subscriptions',
      new TableColumn({
        name: 'next_payment_date',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('subscriptions', 'next_payment_date');
    await queryRunner.dropColumn('users', 'role');
  }
}
