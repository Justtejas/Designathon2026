using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;
namespace Hexa_Hub.DTO
{
    public class AllocationClassDto
    {
        public int allocationId { get; set; }

        public string assetName { get; set; }
        public int assetId { get; set; }
        public string userName { get; set; }
        public int userId { get; set; }
        public string categoryName { get; set; }
        public string subCategoryName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime assetReqDate { get; set; }

        public int assetReqId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime allocatedDate { get; set; } = DateTime.Now;

    }
}
