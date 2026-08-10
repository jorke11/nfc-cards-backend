import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDocumentColumnsToProfiles1784926800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'document_url',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'document_label',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'document_label');
    await queryRunner.dropColumn('profiles', 'document_url');
  }
}
