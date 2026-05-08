using Hexa_Hub.Interface;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using System.Text;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Repository
{
    public class AssetService : IAsset
    {
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly iLoggerService _log;

        public AssetService(DataContext context, IWebHostEnvironment environment, iLoggerService log)
        {
            _context = context;
            _environment = environment;
            _log = log;
        }

        //public async Task<List<Asset>> GetAllAssets()
        //{    return await _context.Assets
        //                         //.Include(a => a.Category)
        //                         //.Include(a => a.SubCategories)
        //                         .ToListAsync();
        //    //var assets = await _context.Assets
        //    //                    .Include(a => a.Category)
        //    //                    .Include(a => a.SubCategories)
        //    //                    .ToListAsync();

        //    //return assets.Select(a => new Asset
        //    //{
        //    //    assetId = a.assetId,
        //    //    assetName = a.assetName,
        //    //    assetDescription = a.assetDescription,
        //    //    categoryId = a.categoryId,
        //    //    subCategoryId = a.subCategoryId,
        //    //    assetImage = a.assetImage,
        //    //    serialNumber = a.serialNumber,
        //    //    Model = a.Model,
        //    //    manufacturingDate = a.manufacturingDate,
        //    //    Location = a.Location,
        //    //    Value = a.Value,
        //    //    expiryDate = a.expiryDate,
        //    //    assetStatus = a.assetStatus,
        //    //    Category = a.Category,
        //    //    SubCategories = a.SubCategories
        //    //}).ToList();

        //}

        public async Task<List<AssetDtoClass>> GetAssetsAll()
        {
            _log.LogInfo("Fetching Asset ");

            return await _context.Assets
         .Include(a => a.Category)       
         .Include(a => a.SubCategories)  
         .Select(a => new AssetDtoClass
         {
             assetId = a.assetId,
             assetName = a.assetName,
             Location = a.Location,
             Value = a.Value,
             Model = a.Model,
             serialNumber = a.serialNumber,
             categoryName = a.Category.categoryName,
             categoryId =  a.Category.categoryId,
             subCategoryId = a.SubCategories.subCategoryId,
             subCategoryName = a.SubCategories.subCategoryName, 
             assetStatus = a.assetStatus ?? assetStatus.OpenToRequest,        
         })
         .ToListAsync();
        }
        public async Task<List<Asset>> GetAllAssets()
        {
            _log.LogInfo("Fetching all assets");

            return await _context.Assets
                                 .ToListAsync();
        }

        //return assets.Select(a => new AssetDto
        //{
        //    assetId = a.assetId,
        //    assetName = a.assetName,
        //    assetDescription = a.assetDescription,
        //    categoryId = a.categoryId,
        //    subCategoryId = a.subCategoryId,
        //    assetImage = a.assetImage,
        //    serialNumber = a.serialNumber,
        //    Model = a.Model,
        //    manufacturingDate = a.manufacturingDate,
        //    Location = a.Location,
        //    Value = a.Value,
        //    expiryDate = a.expiryDate,
        //    assetStatus = a.assetStatus?.ToString()
        //}).ToList();
    //}

    public async Task<List<Asset>> GetAllDetailsOfAssets()
        {
            _log.LogInfo("Fetching all assets");

            return await _context.Assets
                                 .Include(a => a.Category)
                                 .Include(a => a.SubCategories)
                                 .Include(a => a.AssetRequests)
                                 .Include(a => a.ServiceRequests)
                                 .Include(a => a.MaintenanceLogs)
                                 .Include(a => a.Audits)
                                 .Include(a => a.ReturnRequests)
                                 .Include(a => a.AssetAllocations)
                                 .ToListAsync();
        }

        public async Task<Asset?> GetAssetById(int id)
        {
            _log.LogInfo("Fetching assets by id");

            return await _context.Assets
                                 .FirstOrDefaultAsync(a => a.assetId == id);
        }

        public async Task<AssetDtoClass?> GetAssetByassetId(int id)
        {
            _log.LogInfo("Fetching assets by id");

            return await _context.Assets
                                 .Include(a => a.Category)
                                 .Include(a => a.SubCategories)
                                  .Select(a => new AssetDtoClass
                                  {
                                      assetId = a.assetId,
                                      assetName = a.assetName,
                                      assetDescription = a.assetDescription,
                                      Location = a.Location,
                                      Value = a.Value,
                                      categoryName = a.Category.categoryName,
                                      subCategoryName = a.SubCategories.subCategoryName,
                                      assetStatus = a.assetStatus ?? assetStatus.OpenToRequest,
                                      serialNumber = a.serialNumber,
                                      Model = a.Model,
                                      manufacturingDate = a.manufacturingDate,
                                      expiryDate = a.expiryDate,

                                  })
                                 .FirstOrDefaultAsync(a => a.assetId == id);
        }


        //public async Task<Asset> UpdateAssetDto(int id, AssetUpdateDto assetDto)
        //{
        //    byte[]? assetImageBytes = null;

        //    if (assetDto.assetImage != null)
        //    {
        //        using (var memoryStream = new MemoryStream())
        //        {
        //            await assetDto.assetImage.CopyToAsync(memoryStream);
        //            assetImageBytes = memoryStream.ToArray();
        //        }
        //    }

        //    var existingAsset = await _context.Assets.FindAsync(id);
        //    if (existingAsset == null)
        //    {
        //        throw new AssetNotFoundException($"Asset with ID {id} not found");
        //    }

        //    existingAsset.assetName = assetDto.assetName;
        //    existingAsset.assetDescription = assetDto.assetDescription;
        //    existingAsset.categoryId = assetDto.categoryId;
        //    existingAsset.subCategoryId = assetDto.subCategoryId;
        //    //existingAsset.assetImage = assetImageBytes ?? existingAsset.assetImage;
        //    //existingAsset.assetImage = assetImageBytes;
        //    existingAsset.serialNumber = assetDto.serialNumber;
        //    existingAsset.Model = assetDto.Model;
        //    existingAsset.manufacturingDate = assetDto.manufacturingDate;
        //    existingasset.Location = assetDto.Location;
        //    existingasset.Value = assetDto.Value;
        //    existingAsset.expiryDate = assetDto.expiryDate;


        //    _context.Assets.Update(existingAsset);
        //    return existingAsset;
        //}


        public async Task<Asset> UpdateAssetDto(int id, AssetUpdateDto assetDto)
        {
            _log.LogInfo("Update assets process started");

            byte[]? assetImageBytes = null;
            var existingAsset = await _context.Assets.FindAsync(id);
            if (assetDto.assetImage != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await assetDto.assetImage.CopyToAsync(memoryStream);
                    assetImageBytes = memoryStream.ToArray();
                }

                // Save the image bytes to the asset object (or handle saving it to disk)
                existingAsset.assetImage = assetImageBytes;
            }

            
            if (existingAsset == null)
            {
                _log.LogDebug("asset id not found");
                throw new AssetNotFoundException($"Asset with ID {id} not found");
            }

            existingAsset.assetName = assetDto.assetName;
            existingAsset.assetDescription = assetDto.assetDescription;
            existingAsset.categoryId = assetDto.categoryId;
            existingAsset.subCategoryId = assetDto.subCategoryId;
            existingAsset.serialNumber = assetDto.serialNumber;
            existingAsset.Model = assetDto.Model;
            existingAsset.manufacturingDate = assetDto.manufacturingDate;
            existingasset.Location = assetDto.Location;
            existingasset.Value = assetDto.Value;
            existingAsset.expiryDate = assetDto.expiryDate;

            _context.Assets.Update(existingAsset);

            await _context.SaveChangesAsync();
            _log.LogInfo("asset updated");

            return existingAsset;
        }

        public async Task<Asset> UpdateAsset(Asset asset)
        {
            _context.Assets.Update(asset);
            return asset;
        }

        public async Task<IEnumerable<AssetDto>> GetAssetByName(string name)
        {
            _log.LogInfo("Fetching assets by name");

            var assetDetails = await (from asset in _context.Assets
                                      where EF.Functions.Like(asset.assetName, $"%{name}%")
                                      select new AssetDto
                                      {
                                          //assetId = asset.assetId,
                                          assetName = asset.assetName,
                                          assetDescription = asset.assetDescription,
                                          manufacturingDate = asset.manufacturingDate,
                                          Location = asset.Location,
                                          Value = asset.Value,
                                          expiryDate = asset.expiryDate,
                                          assetStatus = asset.assetStatus.ToString(),
                                          categoryId = asset.categoryId,
                                          subCategoryId = asset.subCategoryId,
                                          serialNumber = asset.serialNumber,
                                          Model = asset.Model
                                      }).ToListAsync();

            return assetDetails;
        }

        public async Task<IEnumerable<AssetDto>> GetAssetsByValue(decimal minPrice, decimal maxPrice)
        {
            var assetsInRange = await (from asset in _context.Assets
                                       where asset.Value >= minPrice && asset.Value <= maxPrice
                                       select new AssetDto
                                       {
                                           //assetId = asset.assetId,
                                           assetName = asset.assetName,
                                           assetDescription = asset.assetDescription,
                                           //assetImage = asset.assetImage,
                                           manufacturingDate = asset.manufacturingDate,
                                           Location = asset.Location,
                                           Value = asset.Value,
                                           expiryDate = asset.expiryDate,
                                           assetStatus = asset.assetStatus.ToString(),
                                           categoryId = asset.categoryId,
                                           subCategoryId = asset.subCategoryId,
                                           serialNumber = asset.serialNumber,
                                           Model = asset.Model
                                       }).ToListAsync();

            return assetsInRange;
        }

        public async Task<IEnumerable<AssetDto>> GetAssetsByLocation(string location)
        {
            var assetDetails = await (from asset in _context.Assets
                                      where EF.Functions.Like(asset.Location, $"%{location}%")
                                      select new AssetDto
                                      {
                                          //assetId = asset.assetId,
                                          assetName = asset.assetName,
                                          assetDescription = asset.assetDescription,
                                          //assetImage = asset.assetImage,
                                          manufacturingDate = asset.manufacturingDate,
                                          Location = asset.Location,
                                          Value = asset.Value,
                                          expiryDate = asset.expiryDate,
                                          assetStatus = asset.assetStatus.ToString(),
                                          categoryId = asset.categoryId,
                                          subCategoryId = asset.subCategoryId,
                                          serialNumber = asset.serialNumber,
                                          Model = asset.Model
                                      }).ToListAsync();

            return assetDetails;
        }

        public async Task<IEnumerable<AssetDto>> GetAssetsByStatus(assetStatus status)
        {
            var assetsByStatus = await (from asset in _context.Assets
                                        where asset.assetStatus == status
                                        select new AssetDto
                                        {
                                            //assetId = asset.assetId,
                                            assetName = asset.assetName,
                                            assetDescription = asset.assetDescription,
                                            //assetImage = asset.assetImage,
                                            manufacturingDate = asset.manufacturingDate,
                                            Location = asset.Location,
                                            Value = asset.Value,
                                            expiryDate = asset.expiryDate,
                                            assetStatus = asset.assetStatus.ToString(),
                                            categoryId = asset.categoryId,
                                            subCategoryId = asset.subCategoryId,
                                            serialNumber = asset.serialNumber,
                                            Model = asset.Model
                                        }).ToListAsync();

            return assetsByStatus;
        }


        public async Task DeleteAsset(int id)
        {
            _log.LogInfo("Delete asset process started");

            var asset = await _context.Assets.FindAsync(id);
            if (asset == null)
            {
                _log.LogDebug("asset id not found");

                throw new AssetNotFoundException($"Asset with ID {id} Not Found");
            }
            _log.LogInfo("deleted asset");

            _context.Assets.Remove(asset);

        }
        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        //public async Task<string?> UploadassetImageAsync(int assetId, IFormFile file)
        //{
        //    var asset = await _context.Assets.FindAsync(assetId);
        //    if(asset == null)
        //    {
        //        return null;
        //    }
        //    const string assetImageFolder = "assetImages";
        //    string ImagePath = Path.Combine(Directory.GetCurrentDirectory(), assetImageFolder);
        //    if (!Directory.Exists(ImagePath))
        //    {
        //        Directory.CreateDirectory(ImagePath);
        //    }
        //    string fileName;
        //    if (asset.assetImage == null && file == null)
        //    {
        //        fileName = "AssetDefault.jpg";
        //    }
        //    else if(file != null)
        //    {
        //        string fileExtension = Path.GetExtension(file.FileName);
        //        fileName = $"{assetId}{fileExtension}";
        //        string fullPath = Path.Combine(ImagePath, fileName);
        //        using (var stream = new FileStream(fullPath, FileMode.Create))
        //        {
        //            await file.CopyToAsync(stream);
        //        }
        //    }
        //    else
        //    {
        //        return Encoding.UTF8.GetString(asset.assetImage);
        //    }
        //    asset.assetImage = Encoding.UTF8.GetBytes(fileName);
        //    await _context.SaveChangesAsync();
        //    return fileName;
        //}

        public async Task<string?> UploadassetImageAsync(int assetId, IFormFile file)
        {
            _log.LogInfo("uploading assets image");

            var asset = await _context.Assets.FindAsync(assetId);
            if (asset == null)
            {
                return null;
            }

            if (file != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    asset.assetImage = memoryStream.ToArray();
                }
            }

            await _context.SaveChangesAsync();
            _log.LogInfo("Assets Image uploaded");

            return "Image uploaded successfully";
        }

        //public async Task<string?> UploadassetImageAsync(int assetId, IFormFile file)
        //{
        //    var asset = await _context.Assets.FindAsync(assetId);
        //    if (asset == null)
        //    {
        //        return null;
        //    }
        //    const string assetImageFolder = "assetImages";
        //    string imagePath = Path.Combine(Directory.GetCurrentDirectory(), assetImageFolder);

        //    if (!Directory.Exists(imagePath))
        //    {
        //        Directory.CreateDirectory(imagePath);
        //    }

        //    string fileName;
        //    if (file != null)
        //    {
        //        string fileExtension = Path.GetExtension(file.FileName);
        //        fileName = $"{assetId}{fileExtension}";
        //        string fullPath = Path.Combine(imagePath, fileName);

        //        using (var stream = new FileStream(fullPath, FileMode.Create))
        //        {
        //            await file.CopyToAsync(stream);
        //        }

        //        asset.assetImage = Encoding.UTF8.GetBytes(fileName);
        //    }
        //    else
        //    {
        //        fileName = Encoding.UTF8.GetString(asset.assetImage) ?? "AssetDefault.jpg";
        //    }

        //    await _context.SaveChangesAsync();
        //    return fileName;
        //}

        public async Task<Asset> AddAsset(AssetDto assetDto)
        {
            _log.LogInfo("Adding asset process started");

            // Convert IFormFile to byte[]
            byte[]? assetImageBytes = null;

            if (assetDto.assetImage != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await assetDto.assetImage.CopyToAsync(memoryStream);
                    assetImageBytes = memoryStream.ToArray();
                }
            }

            var asset = new Asset
            {
                assetName = assetDto.assetName,
                assetDescription = assetDto.assetDescription,
                categoryId = assetDto.categoryId,
                subCategoryId = assetDto.subCategoryId,
                serialNumber = assetDto.serialNumber,
                Model = assetDto.Model,
                manufacturingDate = assetDto.manufacturingDate,
                Location = assetDto.Location,
                Value = assetDto.Value,
                expiryDate = assetDto.expiryDate,
                assetImage = assetImageBytes 
            };

            await _context.AddAsync(asset);
            await _context.SaveChangesAsync();
            _log.LogInfo("Added asset");

            return asset;
        }

        //public async Task<Asset> AddAsset(AssetDto assetDto)
        //{
        //    var asset = new Asset
        //    {
        //        assetName = assetDto.assetName,
        //        assetDescription = assetDto.assetDescription,
        //        categoryId = assetDto.categoryId,
        //        subCategoryId = assetDto.subCategoryId,
        //        serialNumber = assetDto.serialNumber,
        //        Model = assetDto.Model,
        //        manufacturingDate = assetDto.manufacturingDate,
        //        Location = assetDto.Location,
        //        Value = assetDto.Value,
        //        expiryDate = assetDto.expiryDate
        //    };

        //    await _context.AddAsync(asset);
        //    await _context.SaveChangesAsync();

        //    // Set default image if no image is provided
        //    if (assetDto.assetImage == null)
        //    {
        //        const string defaultImageFileName = "AssetDefault.jpg";
        //        asset.assetImage = Encoding.UTF8.GetBytes(defaultImageFileName);
        //    }
        //    else
        //    {
        //        asset.assetImage = assetDto.assetImage; // Set the uploaded image
        //    }

        //    _context.Assets.Update(asset);
        //    await _context.SaveChangesAsync();

        //    return asset;
        //}
        private string GetDefaultassetImagePath()
        {
            return Path.Combine(Directory.GetCurrentDirectory(), "assetImages", "AssetDefault.jpg");
        }

        public string GetImagePath(string fileName)
        {
            return Path.Combine("assetImages", fileName);
        }


    }

}
