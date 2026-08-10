import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRedirectTargetToProfiles1784934000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'profiles',
      new TableColumn({
        name: 'redirect_target',
        type: 'varchar',
        length: '20',
        default: `'profile'`,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profiles', 'redirect_target');
  }
}
