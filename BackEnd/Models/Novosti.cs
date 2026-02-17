using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Models
{
    [Table("Novosti")]
    public class Novosti
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public string Slika { get; set; } 
        [Required]
        public string Naslov { get; set; }
        [Required]
        public string Sazetak { get; set; }
        [Required]
        public string Vest { get; set; }
        [Required]
        public string Autor{get;set;}

        
        [Required]
        public DateTime Datum { get; set; } 
      
        public int BrojLajkova { get; set; }
        public int BrojDislajkova { get; set; }
        [Required]
        public int KlubID { get; set; }
        [JsonIgnore]
        public Klub Klub { get; set; }
    }
}