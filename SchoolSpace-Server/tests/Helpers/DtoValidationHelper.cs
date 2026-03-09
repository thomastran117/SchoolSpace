using System.ComponentModel.DataAnnotations;

namespace backend.tests.Helpers;

public static class DtoValidationHelper
{
    public static IList<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(model);
        Validator.TryValidateObject(model, context, results, validateAllProperties: true);
        return results;
    }

    public static bool IsValid(object model) => Validate(model).Count == 0;

    public static bool HasErrorContaining(object model, string message)
        => Validate(model).Any(r => r.ErrorMessage?.Contains(message, StringComparison.OrdinalIgnoreCase) == true);
}
