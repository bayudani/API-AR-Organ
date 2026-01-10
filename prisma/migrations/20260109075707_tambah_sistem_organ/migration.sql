-- AlterTable
ALTER TABLE `organ` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `systemId` INTEGER NULL;

-- CreateTable
CREATE TABLE `OrganSystem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `process` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrganSystem_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organ` ADD CONSTRAINT `Organ_systemId_fkey` FOREIGN KEY (`systemId`) REFERENCES `OrganSystem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
