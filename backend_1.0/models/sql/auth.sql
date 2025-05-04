/*
    sp_add_buyer
    sp_add_vendor
*/

CREATE OR ALTER PROCEDURE sp_add_buyer
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(256),
    @Preferences NVARCHAR(20),
    @AddressLine1 NVARCHAR(255),
    @City NVARCHAR(100),
    @PostalCode NVARCHAR(20),
    @Country NVARCHAR(100),
    @IsDefault BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate inputs
        IF @FullName IS NULL OR @Email IS NULL OR @Password IS NULL OR @Preferences IS NULL
            THROW 50001, 'Full name, email, password, and preferences are required', 1;
        IF @AddressLine1 IS NULL OR @City IS NULL OR @PostalCode IS NULL OR @Country IS NULL
            THROW 50002, 'Address line 1, city, postal code, and country are required', 1;
        IF @Preferences NOT IN ('male', 'female', 'children')
            THROW 50003, 'Preferences must be male, female, or children', 1;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM [user] WHERE email_address = @Email)
            THROW 50004, 'Email already exists', 1;

        DECLARE @UserID INT;
        DECLARE @RoleID INT;

        -- Start transaction
        BEGIN TRANSACTION;

        -- Insert into user table
        INSERT INTO [user] (full_name, email_address, password_hash, created_at, is_active)
        VALUES (@FullName, @Email, @Password, GETDATE(), 1);

        -- Get the new user ID
        SET @UserID = SCOPE_IDENTITY();

        -- Get buyer role ID
        SELECT @RoleID = id FROM role WHERE name = 'buyer';
        IF @RoleID IS NULL
        BEGIN
            ROLLBACK;
            THROW 50005, 'Buyer role not found', 1;
        END;

        -- Insert into user_role
        INSERT INTO user_role (user_id, role_id, assigned_at)
        VALUES (@UserID, @RoleID, GETDATE());

        -- Insert into buyer table
        INSERT INTO buyer (user_id, preferences, created_at)
        VALUES (@UserID, @Preferences, GETDATE());

        -- Insert into address table
        INSERT INTO address (user_id, address_line1, city, postal_code, country, is_default)
        VALUES (@UserID, @AddressLine1, @City, @PostalCode, @Country, @IsDefault);

        COMMIT TRANSACTION;

        -- Return success
        SELECT @UserID AS user_id, 'Buyer added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        SELECT 0 AS user_id, @ErrorMessage AS message;
    END CATCH;
END;
GO

-- Stored procedure to add a vendor with address
CREATE OR ALTER PROCEDURE sp_add_vendor
    @FullName NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(256),
    @VendorName NVARCHAR(100),
    @AddressLine1 NVARCHAR(255),
    @City NVARCHAR(100),
    @PostalCode NVARCHAR(20),
    @Country NVARCHAR(100),
    @IsDefault BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Validate inputs
        IF @FullName IS NULL OR @Email IS NULL OR @Password IS NULL OR @VendorName IS NULL
            THROW 50001, 'Full name, email, password, and vendor name are required', 1;
        IF @AddressLine1 IS NULL OR @City IS NULL OR @PostalCode IS NULL OR @Country IS NULL
            THROW 50002, 'Address line 1, city, postal code, and country are required', 1;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM [user] WHERE email_address = @Email)
            THROW 50003, 'Email already exists', 1;

        -- Check if vendor name already exists
        IF EXISTS (SELECT 1 FROM vendor WHERE vendor_name = @VendorName)
            THROW 50004, 'Vendor name already exists', 1;

        DECLARE @UserID INT;
        DECLARE @RoleID INT;

        -- Start transaction
        BEGIN TRANSACTION;

        -- Insert into user table
        INSERT INTO [user] (full_name, email_address, password_hash, created_at, is_active)
        VALUES (@FullName, @Email, @Password, GETDATE(), 1);

        -- Get the new user ID
        SET @UserID = SCOPE_IDENTITY();

        -- Get vendor role ID
        SELECT @RoleID = id FROM role WHERE name = 'vendor';
        IF @RoleID IS NULL
        BEGIN
            ROLLBACK;
            THROW 50005, 'Vendor role not found', 1;
        END;

        -- Insert into user_role
        INSERT INTO user_role (user_id, role_id, assigned_at)
        VALUES (@UserID, @RoleID, GETDATE());

        -- Insert into vendor table
        INSERT INTO vendor (user_id, vendor_name, created_at)
        VALUES (@UserID, @VendorName, GETDATE());

        -- Insert into address table
        INSERT INTO address (user_id, address_line1, city, postal_code, country, is_default)
        VALUES (@UserID, @AddressLine1, @City, @PostalCode, @Country, @IsDefault);

        COMMIT TRANSACTION;

        -- Return success
        SELECT @UserID AS user_id, 'Vendor added successfully' AS message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorNumber INT = ERROR_NUMBER();
        SELECT 0 AS user_id, @ErrorMessage AS message;
    END CATCH;
END;
GO
