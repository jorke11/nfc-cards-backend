import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProfileTypeColumn1784908800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'profile_type',
        type: 'varchar',
        length: '20',
        default: `'personal'`,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'business_mode',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'menu_items',
        type: 'jsonb',
        default: `'[]'`,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'menu_pdf_url',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'menu_pdf_url');
    await queryRunner.dropColumn('profiles', 'menu_items');
    await queryRunner.dropColumn('profiles', 'business_mode');
    await queryRunner.dropColumn('profiles', 'profile_type');
  }
}
