
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Linq;
namespace Hexa_Hub.Constants
{

   

    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type.IsEnum)
            {
                schema.Enum = context.Type.GetEnumNames()
                                 .Select(e => (IOpenApiAny)new OpenApiString(e))
                                 .ToList(); 
                schema.Type = "string";
                schema.Format = null;
            }
        }
    }



}
