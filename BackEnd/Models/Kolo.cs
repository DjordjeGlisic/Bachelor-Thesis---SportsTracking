using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Strukture;

namespace Models
{
    [Table("Kolo")]
    public class Kolo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int BrojKola { get; set; } 
       
        public DateTime? PocetakKola { get; set; }
      
        public DateTime? KrajKola { get; set; }
        [Required]
        public KoloType TipKola { get; set; }
        //VEZE
        [JsonIgnore]
        public List<Utakmica> Utakmice { get; set; } = new List<Utakmica>(); 
        [JsonIgnore]
        public Takmicenje Takmicenje { get; set; }
        [Required]
       public string Sezona{ get; set; }
        [Required]
        public int TakmicenjeId { get; set; }
    }
}