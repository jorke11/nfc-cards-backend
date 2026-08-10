import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMenuPdfLabelToProfiles1784930400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'menu_pdf_label',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'menu_pdf_label');
  }
}
