using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Strukture;

namespace Models
{
    [Table("Admin")]
    public class Admin
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Username { get; set; } 
        [Required]
        public string Lozinka { get; set; } 
    
    }
}