using Hexa_Hub.Interface;
using log4net;

public class Log4NetLogger : iLoggerService
{
    private readonly ILog _logger;

    public Log4NetLogger(Type type)
    {
        _logger = LogManager.GetLogger(type);
    }

    public void LogInfo(string message)
    {
        _logger.Info(message);
    }

    public void LogError(string message, Exception ex)
    {
        _logger.Error(message, ex);
    }

    public void LogDebug(string message)
    {
        _logger.Debug(message);
    }

}
