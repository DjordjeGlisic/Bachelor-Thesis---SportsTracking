using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Strukture;

namespace Models
{
    [Table("Statistika")]
    public abstract class Statistika
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required]
        public int TrenutniMinut { get; set; } 
        [JsonIgnore]
        public Utakmica Utakmica { get; set; }
        [Required]
        public int UtakmicaId { get; set; } 
        public int? AsistencijeDomacin{get;set;}
         public int? AsistencijeGost{get;set;}
        public string? ListaStrelaca { get; set; }
         public SportType Sport { get; protected set; }


    }
}