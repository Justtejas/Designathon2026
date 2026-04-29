using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;
namespace Hexa_Hub.DTO
{
    public class AllocationClassDto
    {
        public int AllocationId { get; set; }

        public string AssetName { get; set; }
        public int AssetId { get; set; }
        public string UserName { get; set; }
        public int UserId { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime AssetReqDate { get; set; }

        public int AssetReqId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime AllocatedDate { get; set; } = DateTime.Now;

    }
}
