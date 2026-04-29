using Hexa_Hub.DTO;

namespace Hexa_Hub.Interface
{
    public interface IReturnReqRepo
    {
        Task<List<ReturnClassDto>> GetAllReturnRequest();
        Task<ReturnRequest?> GetReturnRequestById(int id);
        Task<ReturnClassDto?> GetReturnRequestId(int id);
        Task<ReturnRequest> AddReturnRequest(ReturnRequestDto returnRequestDto);
        public void UpdateReturnRequest(ReturnClassDto returnRequest);

        Task DeleteReturnRequest(int id);
        Task Save();
        Task<List<ReturnClassDto>> GetReturnRequestsByUserId(int userId);
        Task<bool> UserHasAsset(int id);
    }
}
