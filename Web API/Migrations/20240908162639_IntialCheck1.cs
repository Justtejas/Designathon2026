using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hexa_Hub.Migrations
{
    /// <inheritdoc />
    public partial class IntialCheck1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    categoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    categoryName = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.categoryId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userName = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    userMail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    dept = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    branch = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    User_Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.userId);
                });

            migrationBuilder.CreateTable(
                name: "SubCategories",
                columns: table => new
                {
                    subCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    subCategoryName = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    categoryId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubCategories", x => x.subCategoryId);
                    table.ForeignKey(
                        name: "FK_SubCategories_Categories_categoryId",
                        column: x => x.categoryId,
                        principalTable: "Categories",
                        principalColumn: "categoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    userId = table.Column<int>(type: "int", nullable: false),
                    userName = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    userMail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    dept = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    designation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    phoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileImage = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.userId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assets",
                columns: table => new
                {
                    assetId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assetName = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    assetDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    categoryId = table.Column<int>(type: "int", nullable: false),
                    subCategoryId = table.Column<int>(type: "int", nullable: false),
                    assetImage = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    serialNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    manufacturingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    expiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    assetStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assets", x => x.assetId);
                    table.ForeignKey(
                        name: "FK_Assets_Categories_categoryId",
                        column: x => x.categoryId,
                        principalTable: "Categories",
                        principalColumn: "categoryId");
                    table.ForeignKey(
                        name: "FK_Assets_SubCategories_subCategoryId",
                        column: x => x.subCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "subCategoryId");
                });

            migrationBuilder.CreateTable(
                name: "AssetRequests",
                columns: table => new
                {
                    assetReqId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    categoryId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    assetReqDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    assetReqReason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    requestStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetRequests", x => x.assetReqId);
                    table.ForeignKey(
                        name: "FK_AssetRequests_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_AssetRequests_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "Audits",
                columns: table => new
                {
                    auditId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false),
                    auditDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    auditMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    auditStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Audits", x => x.auditId);
                    table.ForeignKey(
                        name: "FK_Audits_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_Audits_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceLogs",
                columns: table => new
                {
                    maintenanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false),
                    maintenanceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    maintenanceDescription = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceLogs", x => x.maintenanceId);
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_MaintenanceLogs_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "ReturnRequests",
                columns: table => new
                {
                    ReturnId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    categoryId = table.Column<int>(type: "int", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Condition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReturnStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReturnRequests", x => x.ReturnId);
                    table.ForeignKey(
                        name: "FK_ReturnRequests_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_ReturnRequests_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "ServiceRequests",
                columns: table => new
                {
                    ServiceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false),
                    ServiceRequestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Issue_Type = table.Column<int>(type: "int", nullable: false),
                    ServiceDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ServiceReqStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequests", x => x.ServiceId);
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_ServiceRequests_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateTable(
                name: "AssetAllocations",
                columns: table => new
                {
                    allocationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assetId = table.Column<int>(type: "int", nullable: false),
                    userId = table.Column<int>(type: "int", nullable: false),
                    assetReqId = table.Column<int>(type: "int", nullable: false),
                    allocatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetAllocations", x => x.allocationId);
                    table.ForeignKey(
                        name: "FK_AssetAllocations_AssetRequests_assetReqId",
                        column: x => x.assetReqId,
                        principalTable: "AssetRequests",
                        principalColumn: "assetReqId");
                    table.ForeignKey(
                        name: "FK_AssetAllocations_Assets_assetId",
                        column: x => x.assetId,
                        principalTable: "Assets",
                        principalColumn: "assetId");
                    table.ForeignKey(
                        name: "FK_AssetAllocations_Users_userId",
                        column: x => x.userId,
                        principalTable: "Users",
                        principalColumn: "userId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssetAllocations_assetId",
                table: "AssetAllocations",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetAllocations_assetReqId",
                table: "AssetAllocations",
                column: "assetReqId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetAllocations_userId",
                table: "AssetAllocations",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetRequests_assetId",
                table: "AssetRequests",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetRequests_userId",
                table: "AssetRequests",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_categoryId",
                table: "Assets",
                column: "categoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_subCategoryId",
                table: "Assets",
                column: "subCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Audits_assetId",
                table: "Audits",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_Audits_userId",
                table: "Audits",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_assetId",
                table: "MaintenanceLogs",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceLogs_userId",
                table: "MaintenanceLogs",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequests_assetId",
                table: "ReturnRequests",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_ReturnRequests_userId",
                table: "ReturnRequests",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_assetId",
                table: "ServiceRequests",
                column: "assetId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_userId",
                table: "ServiceRequests",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_categoryId",
                table: "SubCategories",
                column: "categoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssetAllocations");

            migrationBuilder.DropTable(
                name: "Audits");

            migrationBuilder.DropTable(
                name: "MaintenanceLogs");

            migrationBuilder.DropTable(
                name: "ReturnRequests");

            migrationBuilder.DropTable(
                name: "ServiceRequests");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "AssetRequests");

            migrationBuilder.DropTable(
                name: "Assets");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "SubCategories");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
