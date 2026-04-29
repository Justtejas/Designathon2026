namespace Hexa_Hub.Interface
{
    public interface iLoggerService
    {
        void LogInfo(string message);
        void LogError(string message, Exception ex);
        void LogDebug(string message);
    }
}
