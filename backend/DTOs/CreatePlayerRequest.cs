using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreatePlayerRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;
    }
}
