namespace Hexa_Hub.Interface
{
   
        public interface IEmail
        {
            Task SendEmailAsync(string to, string subject, string body);
        }

    

}
